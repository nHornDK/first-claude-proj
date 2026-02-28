@echo off
REM Fill in the values below, then run:
REM   set-secrets.bat
REM
REM WARNING: do not commit this file with real values filled in.

set DB_HOST=postgres
set DB_PASSWORD=Xk#9mP$vL2qN@8rT3

set JWT_SECRET="Yd$8cZ!3pX%tG6sW"
set DEMO_USERNAME="admin"
set DEMO_PASSWORD="wJs5nR@2bF#mK7hQ"

set "JSON_FILE=%tmp_secret.json"
echo %JSON_FILE%

(
  echo {
  echo   "ConnectionStrings__DefaultConnection": "Host=%DB_HOST%;Port=5432;Database=FirstClaudeDb;Username=postgres;Password=%DB_PASSWORD%",
  echo   "Jwt__Secret": %JWT_SECRET%,
  echo   "Jwt__Issuer": "first-claude-proj",
  echo   "Jwt__Audience": "first-claude-proj",
  echo   "DemoUser__Username": %DEMO_USERNAME%,
  echo   "DemoUser__Password": %DEMO_PASSWORD%,
  echo   "POSTGRES_USER": "postgres",
  echo   "POSTGRES_PASSWORD": "postgres",
  echo   "POSTGRES_DB": "FirstClaudeDb"
  echo }
) > "%JSON_FILE%"

aws secretsmanager put-secret-value ^
    --secret-id DENDO_SECRET ^
    --region eu-north-1 ^
    --secret-string "file://%JSON_FILE%"

del "%JSON_FILE%"
echo Secret updated successfully.
