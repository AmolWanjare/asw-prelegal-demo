Write-Host "Stopping Prelegal..."
docker stop prelegal-app 2>$null; $null
docker rm prelegal-app 2>$null; $null
Write-Host "Prelegal stopped."
