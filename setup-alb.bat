@echo off
REM Creates an ALB in front of the dendo ECS service.
REM Fill in the values below, then run: setup-alb.bat
REM Run once — rerunning will create duplicate resources.

set REGION=eu-north-1
set VPC_ID=CHANGE_ME
set SUBNET_1=CHANGE_ME
set SUBNET_2=CHANGE_ME
set ECS_SG=CHANGE_ME

REM ---------------------------------------------------------------
REM 1. Security group for the ALB (allows inbound 80 + 443)
REM ---------------------------------------------------------------
aws ec2 create-security-group ^
    --group-name dendo-alb-sg ^
    --description "ALB security group for dendo" ^
    --vpc-id %VPC_ID% ^
    --region %REGION% ^
    --query "GroupId" --output text > %TEMP%\alb_sg.txt

set /p ALB_SG=<%TEMP%\alb_sg.txt
echo ALB security group: %ALB_SG%

aws ec2 authorize-security-group-ingress --group-id %ALB_SG% --protocol tcp --port 80  --cidr 0.0.0.0/0 --region %REGION%
aws ec2 authorize-security-group-ingress --group-id %ALB_SG% --protocol tcp --port 443 --cidr 0.0.0.0/0 --region %REGION%

REM Allow ALB to reach ECS tasks on port 80
aws ec2 authorize-security-group-ingress --group-id %ECS_SG% --protocol tcp --port 80 --source-group %ALB_SG% --region %REGION%

REM ---------------------------------------------------------------
REM 2. Create the ALB
REM ---------------------------------------------------------------
aws elbv2 create-load-balancer ^
    --name dendo-alb ^
    --subnets %SUBNET_1% %SUBNET_2% ^
    --security-groups %ALB_SG% ^
    --scheme internet-facing ^
    --type application ^
    --region %REGION% ^
    --query "LoadBalancers[0].LoadBalancerArn" --output text > %TEMP%\alb_arn.txt

set /p ALB_ARN=<%TEMP%\alb_arn.txt
echo ALB ARN: %ALB_ARN%

REM ---------------------------------------------------------------
REM 3. Create target group (type=ip required for Fargate awsvpc)
REM ---------------------------------------------------------------
aws elbv2 create-target-group ^
    --name dendo-tg ^
    --protocol HTTP ^
    --port 80 ^
    --vpc-id %VPC_ID% ^
    --target-type ip ^
    --health-check-path /health ^
    --health-check-interval-seconds 30 ^
    --region %REGION% ^
    --query "TargetGroups[0].TargetGroupArn" --output text > %TEMP%\tg_arn.txt

set /p TG_ARN=<%TEMP%\tg_arn.txt
echo Target group ARN: %TG_ARN%

REM ---------------------------------------------------------------
REM 4. Create HTTP listener (port 80)
REM ---------------------------------------------------------------
aws elbv2 create-listener ^
    --load-balancer-arn %ALB_ARN% ^
    --protocol HTTP ^
    --port 80 ^
    --default-actions Type=forward,TargetGroupArn=%TG_ARN% ^
    --region %REGION%

REM ---------------------------------------------------------------
REM 5. Update ECS service to use the target group
REM ---------------------------------------------------------------
aws ecs update-service ^
    --cluster dendo_cluster ^
    --service dendo_service ^
    --load-balancers "targetGroupArn=%TG_ARN%,containerName=dendo_container,containerPort=80" ^
    --region %REGION%

REM ---------------------------------------------------------------
REM Print ALB DNS name
REM ---------------------------------------------------------------
aws elbv2 describe-load-balancers ^
    --load-balancer-arns %ALB_ARN% ^
    --region %REGION% ^
    --query "LoadBalancers[0].DNSName" --output text

echo Done. Point your DNS CNAME to the ALB DNS name above.
