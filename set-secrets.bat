@echo off
REM Fill in the values below, then run:
REM   set-secrets.bat
REM
REM WARNING: do not commit this file with real values filled in.

set DB_HOST=CHANGE_ME
set DB_PASSWORD=CHANGE_ME
set JWT_SECRET=CHANGE_ME
set DEMO_USERNAME=CHANGE_ME
set DEMO_PASSWORD=CHANGE_ME

set "JSON_FILE=%tmp_secret.json"
echo %JSON_FILE%

(
  echo {
  echo   "ConnectionStrings__DefaultConnection": "Host=%DB_HOST%;Port=5432;Database=FirstClaudeDb;Username=postgres;Password=%DB_PASSWORD%",
  echo   "Jwt__Secret": "%JWT_SECRET%",
  echo   "Jwt__Issuer": "first-claude-proj",
  echo   "Jwt__Audience": "first-claude-proj",
  echo   "DemoUser__Username": "%DEMO_USERNAME%",
  echo   "DemoUser__Password": "%DEMO_PASSWORD%"
  echo }
) > "%JSON_FILE%"

aws secretsmanager put-secret-value ^
    --secret-id DENDO_SECRET ^
    --region eu-north-1 ^
    --secret-string "file://%JSON_FILE%"

del "%JSON_FILE%"
echo Secret updated successfully.
