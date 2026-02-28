# Create secret (first run only)
aws secretsmanager create-secret --name DENDO_SECRET --region eu-north-1 --secret-string '{"ConnectionStrings__DefaultConnection":"Host=<rds-endpoint>;Port=5432;Database=FirstClaudeDb;Username=postgres;Password=<db-password>","Jwt__Secret":"<long-random-secret>","Jwt__Issuer":"first-claude-proj","Jwt__Audience":"first-claude-proj","DemoUser__Username":"<username>","DemoUser__Password":"<password>"}'


# Update existing secret
aws secretsmanager put-secret-value --secret-id DENDO_SECRET --region eu-north-1 --secret-string '{"ConnectionStrings__DefaultConnection":"Host=<rds-endpoint>;Port=5432;Database=FirstClaudeDb;Username=postgres;Password=<db-password>","Jwt__Secret":"<long-random-secret>","Jwt__Issuer":"first-claude-proj","Jwt__Audience":"first-claude-proj","DemoUser__Username":"<username>","DemoUser__Password":"<password>"}'
