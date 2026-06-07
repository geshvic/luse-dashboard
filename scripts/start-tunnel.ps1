$port = 3100
$urlFile = "C:\Users\MUSUK\.openclaw\workspace\luse-dashboard\data\tunnel-url.txt"
$subdomain = "vituliluse-" + (Get-Random -Minimum 100 -Maximum 999)

Write-Host "Starting tunnel on port $port with subdomain $subdomain..."
$proc = Start-Process npx -ArgumentList "--yes","localtunnel","--port","$port","--subdomain","$subdomain" -NoNewWindow -PassThru -RedirectStandardOutput "$env:TEMP\lt-output.txt"

Start-Sleep -Seconds 10
$output = Get-Content "$env:TEMP\lt-output.txt" -Raw 2>$null
if ($output -match 'https://[^\s]+\.loca\.lt') {
    $url = $matches[0]
    $url | Out-File $urlFile
    Write-Host "TUNNEL_URL=$url"
} else {
    Write-Host "Failed to get URL. Check $env:TEMP\lt-output.txt"
}
