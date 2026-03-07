param(
    [string]$Cluster   = "dendo_cluster",
    [string]$Service   = "dendo_service",
    [string]$Container = "postgres"
)

$taskArn = aws ecs list-tasks `
    --cluster $Cluster `
    --service-name $Service `
    --query "taskArns[0]" `
    --output text
write-host "Found taskArn: $taskArn"
if (-not $taskArn -or $taskArn -eq "None") {
    Write-Error "No running tasks found in cluster=$Cluster service=$Service"
    exit 1
}
Write-Host "aws ecs update-service --cluster $CLUSTER --service $Service --task ""$taskArn"" --force-new-deployment --enable-execute-command"

Write-Host "Connecting to task: $taskArn"

Write-Host "aws ecs execute-command --cluster $Cluster --task ""$taskArn"" --container $Container --interactive --command ""/bin/sh"""
aws ecs execute-command `
    --cluster $Cluster `
    --task $taskArn `
    --container $Container `
    --interactive `
    --command "/bin/sh"
