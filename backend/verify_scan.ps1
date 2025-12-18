# 1. Login
$loginBody = @{ username = "admin"; password = "admin123" } | ConvertTo-Json
try {
    $loginRes = Invoke-WebRequest "http://localhost:5000/api/auth/login" -Method Post -Body $loginBody -ContentType "application/json"
    $token = ($loginRes.Content | ConvertFrom-Json).access_token
    Write-Host "Logged in successfully."
}
catch {
    Write-Host "Login Failed: $($_.Exception.Message)"
    exit
}

# 2. Trigger Real Scan (Localhost)
# We scan 127.0.0.1 as it is safe and fast
Write-Host "Triggering Nmap Scan on 127.0.0.1..."
try {
    $scanRes = Invoke-WebRequest "http://localhost:5000/api/scan" -Method Post -Body '{"target":"127.0.0.1"}' -Headers @{"Authorization" = "Bearer $token" } -ContentType "application/json"
    Write-Host "Scan Response: $($scanRes.Content)"
}
catch {
    Write-Host "Scan Trigger Failed: $($_.Exception.Message)"
}

# 3. Check External Risk (Mock/Real Shodan)
# Using a known Google DNS IP
Write-Host "Checking Shodan for 8.8.8.8..."
try {
    $riskRes = Invoke-WebRequest "http://localhost:5000/api/external-risk" -Method Post -Body '{"ip":"8.8.8.8"}' -Headers @{"Authorization" = "Bearer $token" } -ContentType "application/json"
    Write-Host "Shodan Response: $($riskRes.Content)"
}
catch {
    Write-Host "External Risk Check Failed: $($_.Exception.Message)"
}
