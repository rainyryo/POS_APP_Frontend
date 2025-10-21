@echo off
REM Azure Web App (Node.js) デプロイスクリプト

set RESOURCE_GROUP=pos-rg
set APP_NAME=pos-frontend-app
set LOCATION=japaneast

echo === Azure Web App デプロイ開始 ===

REM App Service Plan作成（既に作成済みの場合はスキップ）
echo 1. App Service Planを作成中...
az appservice plan create --name %APP_NAME%-plan --resource-group %RESOURCE_GROUP% --sku B1 --is-linux

REM Web App作成
echo 2. Web Appを作成中...
az webapp create --name %APP_NAME% --resource-group %RESOURCE_GROUP% --plan %APP_NAME%-plan --runtime "NODE:18-lts"

REM 環境変数設定
echo 3. 環境変数を設定中...
az webapp config appsettings set --name %APP_NAME% --resource-group %RESOURCE_GROUP% --settings NEXT_PUBLIC_API_URL="https://pos-api-backend.azurewebsites.net"

REM デプロイ
echo 4. アプリケーションをデプロイ中...
az webapp up --name %APP_NAME% --resource-group %RESOURCE_GROUP% --runtime "NODE:18-lts"

echo === デプロイ完了 ===
echo URL: https://%APP_NAME%.azurewebsites.net

pause