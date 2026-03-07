#!/usr/bin/env bash
# Creates an EFS filesystem for postgres_data and wires it into the ECS setup.
# Run once before the first deploy. Requires AWS CLI v2 and Node.js (no jq needed).
#
# Usage:
#   SUBNET_IDS="subnet-aaa,subnet-bbb" \
#   ECS_SG_ID="sg-xxxxxxxx" \
#   bash .aws/setup-efs.sh

set -euo pipefail

REGION="eu-north-1"
TASK_DEF_FILE=".aws/task-definition.json"
EFS_NAME="dendo_postgres_data"
CLUSTER="dendo_cluster"
SERVICE="dendo_service"

# ── Resolve subnets & security group ─────────────────────────────────────────
if [[ -z "${SUBNET_IDS:-}" || -z "${ECS_SG_ID:-}" ]]; then
  echo "→ Auto-discovering subnets and security group from ECS service..."

  SUBNET_IDS=$(aws ecs describe-services \
    --cluster "$CLUSTER" --services "$SERVICE" \
    --region "$REGION" \
    --query "services[0].networkConfiguration.awsvpcConfiguration.subnets | join(',', @)" \
    --output text)

  ECS_SG_ID=$(aws ecs describe-services \
    --cluster "$CLUSTER" --services "$SERVICE" \
    --region "$REGION" \
    --query "services[0].networkConfiguration.awsvpcConfiguration.securityGroups[0]" \
    --output text)
fi

echo "  Subnets : $SUBNET_IDS"
echo "  SG      : $ECS_SG_ID"

# ── Create EFS filesystem (skip if already exists with same name tag) ────────
if [[ -z "${FS_ID:-}" ]]; then
  FS_ID=$(aws efs describe-file-systems \
    --region "$REGION" \
    --query "FileSystems[?Tags[?Key=='Name'&&Value=='$EFS_NAME']].FileSystemId | [0]" \
    --output text)
fi

if [[ -z "$FS_ID" || "$FS_ID" == "None" ]]; then
  echo "→ Creating EFS filesystem..."
  FS_ID=$(aws efs create-file-system \
    --region "$REGION" \
    --encrypted \
    --tags "Key=Name,Value=$EFS_NAME" \
    --query "FileSystemId" \
    --output text)
  echo "  FileSystemId: $FS_ID"
else
  echo "→ Using existing EFS filesystem: $FS_ID"
fi

echo "→ Waiting for EFS to become available..."
for i in $(seq 1 24); do
  STATE=$(aws efs describe-file-systems --region "$REGION" --file-system-id "$FS_ID" \
    --query "FileSystems[0].LifeCycleState" --output text)
  echo "  State: $STATE"
  [[ "$STATE" == "available" ]] && break
  sleep 5
done

# ── Create security group for EFS mount targets ───────────────────────────────
VPC_ID=$(aws ec2 describe-security-groups \
  --group-ids "$ECS_SG_ID" \
  --region "$REGION" \
  --query "SecurityGroups[0].VpcId" \
  --output text)

echo "→ Creating EFS security group in VPC $VPC_ID..."
EFS_SG_ID=$(aws ec2 describe-security-groups \
  --region "$REGION" \
  --filters "Name=group-name,Values=dendo-efs-sg" "Name=vpc-id,Values=$VPC_ID" \
  --query "SecurityGroups[0].GroupId" \
  --output text)

if [[ -z "$EFS_SG_ID" || "$EFS_SG_ID" == "None" ]]; then
  EFS_SG_ID=$(aws ec2 create-security-group \
    --region "$REGION" \
    --group-name "dendo-efs-sg" \
    --description "NFS access for dendo EFS" \
    --vpc-id "$VPC_ID" \
    --query "GroupId" \
    --output text)
  aws ec2 authorize-security-group-ingress \
    --region "$REGION" \
    --group-id "$EFS_SG_ID" \
    --protocol tcp \
    --port 2049 \
    --source-group "$ECS_SG_ID"
  echo "  EFS SG created: $EFS_SG_ID"
else
  echo "  EFS SG already exists: $EFS_SG_ID"
fi

echo "  EFS SG: $EFS_SG_ID"

# ── Create mount targets (one per subnet) ─────────────────────────────────────
echo "→ Creating EFS mount targets..."
IFS=',' read -ra SUBNETS <<< "$SUBNET_IDS"
for SUBNET in "${SUBNETS[@]}"; do
  EXISTS=$(aws efs describe-mount-targets \
    --region "$REGION" \
    --file-system-id "$FS_ID" \
    --query "MountTargets[?SubnetId=='$SUBNET'].MountTargetId | [0]" \
    --output text)
  if [[ -z "$EXISTS" || "$EXISTS" == "None" ]]; then
    aws efs create-mount-target \
      --region "$REGION" \
      --file-system-id "$FS_ID" \
      --subnet-id "$SUBNET" \
      --security-groups "$EFS_SG_ID"
    echo "  Mount target created in $SUBNET"
  else
    echo "  Mount target already exists in $SUBNET ($EXISTS)"
  fi
done

# ── Patch task-definition.json using Node.js ──────────────────────────────────
echo "→ Updating $TASK_DEF_FILE with FileSystemId=$FS_ID..."
node -e "
  const fs = require('fs');
  const td = JSON.parse(fs.readFileSync('$TASK_DEF_FILE', 'utf8'));
  const vol = td.volumes.find(v => v.name === 'postgres_data');
  vol.efsVolumeConfiguration.fileSystemId = '$FS_ID';
  fs.writeFileSync('$TASK_DEF_FILE', JSON.stringify(td, null, 2) + '\n');
  console.log('  Done.');
"

echo ""
echo "Done. EFS filesystem: $FS_ID"
echo "task-definition.json updated. Commit and push to trigger a deploy."
