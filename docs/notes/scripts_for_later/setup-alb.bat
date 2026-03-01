@echo off
REM Creates or updates an ALB in front of the dendo ECS service.
REM Safe to re-run — creates resources that don't exist, updates those that do.

set REGION=eu-north-1
set VPC_ID=vpc-0f776b0ea622bd799
set SUBNET_1=subnet-0575cbe088d53767f
set SUBNET_2=subnet-061ae9843df063974
set SUBNET_3=subnet-0df3cfaa85e111e83
set ECS_SG=sg-0aceaf53805ea4d49

echo Config:
echo   Region:  %REGION%
echo   VPC:     %VPC_ID%
echo   Subnets: %SUBNET_1% %SUBNET_2% %SUBNET_3%
echo   ECS SG:  %ECS_SG%
echo.
pause

REM ---------------------------------------------------------------
REM 1. Security group for the ALB
REM ---------------------------------------------------------------
echo [1/5] Checking ALB security group...
aws ec2 describe-security-groups ^
    --filters "Name=group-name,Values=dendo-alb-sg" "Name=vpc-id,Values=%VPC_ID%" ^
    --query "SecurityGroups[0].GroupId" --output text ^
    --region %REGION% > "%TEMP%\alb_sg.txt" 2>nul
set /p ALB_SG=<"%TEMP%\alb_sg.txt"
if "%ALB_SG%"=="None" set ALB_SG=

if "%ALB_SG%"=="" (
    echo Creating...
    aws ec2 create-security-group ^
        --group-name dendo-alb-sg ^
        --description "ALB security group for dendo" ^
        --vpc-id %VPC_ID% ^
        --region %REGION% ^
        --query "GroupId" --output text > "%TEMP%\alb_sg.txt"
    if %errorlevel% neq 0 ( echo FAILED & pause & exit /b 1 )
    set /p ALB_SG=<"%TEMP%\alb_sg.txt"
) else (
    echo Exists: %ALB_SG%
)

REM Ensure ingress rules exist (authorize is idempotent — duplicates are ignored)
echo Ensuring ingress rules...
aws ec2 authorize-security-group-ingress --group-id %ALB_SG% --protocol tcp --port 80  --cidr 0.0.0.0/0 --region %REGION% 2>nul
aws ec2 authorize-security-group-ingress --group-id %ALB_SG% --protocol tcp --port 443 --cidr 0.0.0.0/0 --region %REGION% 2>nul
aws ec2 authorize-security-group-ingress ^
    --group-id %ECS_SG% ^
    --ip-permissions "IpProtocol=tcp,FromPort=80,ToPort=80,UserIdGroupPairs=[{GroupId=%ALB_SG%}]" ^
    --region %REGION% 2>nul
echo ALB SG: %ALB_SG%

REM ---------------------------------------------------------------
REM 2. ALB
REM ---------------------------------------------------------------
echo.
echo [2/5] Checking ALB...
aws elbv2 describe-load-balancers ^
    --names dendo-alb ^
    --query "LoadBalancers[0].LoadBalancerArn" --output text ^
    --region %REGION% > "%TEMP%\alb_arn.txt" 2>nul
set /p ALB_ARN=<"%TEMP%\alb_arn.txt"
if "%ALB_ARN%"=="None" set ALB_ARN=

if "%ALB_ARN%"=="" (
    echo Creating...
    aws elbv2 create-load-balancer ^
        --name dendo-alb ^
        --subnets %SUBNET_1% %SUBNET_2% %SUBNET_3% ^
        --security-groups %ALB_SG% ^
        --scheme internet-facing ^
        --type application ^
        --region %REGION% ^
        --query "LoadBalancers[0].LoadBalancerArn" --output text > "%TEMP%\alb_arn.txt"
    if %errorlevel% neq 0 ( echo FAILED & pause & exit /b 1 )
    set /p ALB_ARN=<"%TEMP%\alb_arn.txt"
) else (
    echo Exists — updating security groups and subnets...
    aws elbv2 set-security-groups ^
        --load-balancer-arn %ALB_ARN% ^
        --security-groups %ALB_SG% ^
        --region %REGION% >nul
    aws elbv2 set-subnets ^
        --load-balancer-arn %ALB_ARN% ^
        --subnets %SUBNET_1% %SUBNET_2% %SUBNET_3% ^
        --region %REGION% >nul
)
echo ALB ARN: %ALB_ARN%

REM ---------------------------------------------------------------
REM 3. Target group
REM ---------------------------------------------------------------
echo.
echo [3/5] Checking target group...
aws elbv2 describe-target-groups ^
    --names dendo-tg ^
    --query "TargetGroups[0].TargetGroupArn" --output text ^
    --region %REGION% > "%TEMP%\tg_arn.txt" 2>nul
set /p TG_ARN=<"%TEMP%\tg_arn.txt"
if "%TG_ARN%"=="None" set TG_ARN=

if "%TG_ARN%"=="" (
    echo Creating...
    aws elbv2 create-target-group ^
        --name dendo-tg ^
        --protocol HTTP ^
        --port 80 ^
        --vpc-id %VPC_ID% ^
        --target-type ip ^
        --health-check-path /health ^
        --health-check-interval-seconds 30 ^
        --region %REGION% ^
        --query "TargetGroups[0].TargetGroupArn" --output text > "%TEMP%\tg_arn.txt"
    if %errorlevel% neq 0 ( echo FAILED & pause & exit /b 1 )
    set /p TG_ARN=<"%TEMP%\tg_arn.txt"
) else (
    echo Exists — updating health check...
    aws elbv2 modify-target-group ^
        --target-group-arn %TG_ARN% ^
        --health-check-path /health ^
        --health-check-interval-seconds 30 ^
        --region %REGION% >nul
)
echo Target group ARN: %TG_ARN%

REM ---------------------------------------------------------------
REM 4. HTTP listener
REM ---------------------------------------------------------------
echo.
echo [4/5] Checking listener...
aws elbv2 describe-listeners ^
    --load-balancer-arn %ALB_ARN% ^
    --query "Listeners[0].ListenerArn" --output text ^
    --region %REGION% > "%TEMP%\listener_arn.txt" 2>nul
set /p LISTENER_ARN=<"%TEMP%\listener_arn.txt"
if "%LISTENER_ARN%"=="None" set LISTENER_ARN=

if "%LISTENER_ARN%"=="" (
    echo Creating...
    aws elbv2 create-listener ^
        --load-balancer-arn %ALB_ARN% ^
        --protocol HTTP ^
        --port 80 ^
        --default-actions Type=forward,TargetGroupArn=%TG_ARN% ^
        --region %REGION% >nul
    if %errorlevel% neq 0 ( echo FAILED & pause & exit /b 1 )
) else (
    echo Exists — updating default action...
    aws elbv2 modify-listener ^
        --listener-arn %LISTENER_ARN% ^
        --default-actions Type=forward,TargetGroupArn=%TG_ARN% ^
        --region %REGION% >nul
)

REM ---------------------------------------------------------------
REM 5. ECS service
REM ---------------------------------------------------------------
echo.
echo [5/5] Updating ECS service with load balancer...
aws ecs update-service ^
    --cluster dendo_cluster ^
    --service dendo_service ^
    --load-balancers "targetGroupArn=%TG_ARN%,containerName=dendo_container,containerPort=80" ^
    --region %REGION% >nul
if %errorlevel% neq 0 ( echo FAILED & pause & exit /b 1 )

REM ---------------------------------------------------------------
REM Done
REM ---------------------------------------------------------------
echo.
echo ALB DNS name:
aws elbv2 describe-load-balancers ^
    --load-balancer-arns %ALB_ARN% ^
    --region %REGION% ^
    --query "LoadBalancers[0].DNSName" --output text

echo.
echo Done. Point your DNS CNAME to the ALB DNS name above.
pause
