#!/usr/bin/env bash
# Connect to a running ECS task via execute-command.
# Usage: ./scripts/ecs-exec.sh [cluster] [service] [container]
#
# Prerequisites:
# - AWS CLI v2 + SSM Session Manager plugin installed
# - Task started with enableExecuteCommand: true
# - Task IAM role has ssmmessages:* permissions
CLUSTER="${1:-dendo_cluster}"
SERVICE="${2:-dendo_service}"
CONTAINER="${3:-dendo_container}"

# aws ecs update-service --cluster "$CLUSTER" --service "$CONTAINER" --enable-execute-command --region eu-north-1

aws ecs update-service --cluster "$CLUSTER" --service "$dendo_service" --force-new-deployment --enable-execute-command

TASK_ARN=$(aws ecs list-tasks \
 --cluster "$CLUSTER" \
 --service-name "$SERVICE" \
 --query 'taskArns[0]' \
 --output text)
# aws ecs update-service --cluster "$CLUSTER" --service "$CONTAINER" --task "$TASK_ARN" --enable-execute-command --region eu-north-1


if [ -z "$TASK_ARN" ] || [ "$TASK_ARN" = "None" ]; then
 echo "No running tasks found in cluster=$CLUSTER service=$SERVICE" >&2
 exit 1
fi

echo "Connecting to task: $TASK_ARN"
aws ecs execute-command \
 --cluster "$CLUSTER" \
 --task "$TASK_ARN" \
 --container "$CONTAINER" \
 --interactive \
 --command "/bin/sh"

 
# aws ecs execute-command --cluster dendo_cluster --task arn:aws:ecs:eu-north-1:654862558684:task/dendo_cluster/be4065bfa44448b598512b411b263975 --container dendo_container --interactive --command "/bin/sh"