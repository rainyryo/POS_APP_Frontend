@echo off
REM Azure Static Web Apps デプロイスクリプト

set RESOURCE_GROUP=pos-rg
set APP_NAME=pos-frontend
set LOCATION=japaneast

echo === Azure Static Web Apps デプロイ開始 ===

REM ビルド
echo 1. アプリケーションをビルド中...
call npm run build

REM Static Web Appの作成
echo 2. Static Web Appを作成中...
az staticwebapp create ^
  --name %APP_NAME% ^
  --resource-group %RESOURCE_GROUP% ^
  --location %LOCATION% ^
  --sku Free

echo === デプロイ完了 ===
echo 次のステップ:
echo 1. Azure Portalで Static Web App を開く
echo 2. GitHub連携を設定してデプロイ
echo または
echo 3. SWA CLIを使用してデプロイ

pause