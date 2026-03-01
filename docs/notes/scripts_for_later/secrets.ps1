# Create secret (first run only)
aws secretsmanager create-secret --name DENDO_SECRET --region eu-north-1 --secret-string '{"ConnectionStrings__DefaultConnection":"Host=rds-endpoint;Port=5432;Database=FirstClaudeDb;Username=postgres;Password=db-password","Jwt__Secret":"long-random-secret","Jwt__Issuer":"first-claude-proj","Jwt__Audience":"first-claude-proj","DemoUser__Username":"username","DemoUser__Password":"password"}'


# Update existing secret
aws secretsmanager put-secret-value --secret-id DENDO_SECRET --region eu-north-1 --secret-string '{"ConnectionStrings__DefaultConnection":"Host=rds-endpoint;Port=5432;Database=FirstClaudeDb;Username=postgres;Password=db-password","Jwt__Secret":"long-random-secret","Jwt__Issuer":"first-claude-proj","Jwt__Audience":"first-claude-proj","DemoUser__Username":"username","DemoUser__Password":"password"}'




cat > /tmp/dendo-secret.json << 'EOF'
  {
    "ConnectionStrings__DefaultConnection":
  "Host=<rds-endpoint>;Port=5432;Database=FirstClaudeDb;Username=postgres;Password=<db-password>",
    "Jwt__Secret": "<long-random-secret>",
    "Jwt__Issuer": "first-claude-proj",
    "Jwt__Audience": "first-claude-proj",
    "DemoUser__Username": "<username>",
    "DemoUser__Password": "<password>"
  }
  EOF

  aws secretsmanager put-secret-value \
    --secret-id DENDO_SECRET \
    --region eu-north-1 \
    --secret-string file:///tmp/dendo-secret.json

  rm /tmp/dendo-secret.json

  The file:// prefix tells the CLI to read the value from disk, bypassing any shell quoting issues entirely.

  You can verify what's currently stored before overwriting:
  aws secretsmanager get-secret-value \
    --secret-id DENDO_SECRET \
    --region eu-north-1 \
    --query SecretString \
    --output text
