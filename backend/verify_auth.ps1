Write-Host "1. Testing Unauthenticated Access to /scan..."
try {
    $response = Invoke-WebRequest -Uri "http://localhost:5000/api/scan" -Method Post -Body '{"target":"127.0.0.1"}' -ContentType "application/json" -ErrorAction Stop
    Write-Host "FAILED: Request should have been unauthorized but got $($response.StatusCode)"
}
catch {
    if ($_.Exception.Response.StatusCode -eq [System.Net.HttpStatusCode]::Unauthorized) {
        Write-Host "SUCCESS: Got 401 Unauthorized as expected."
    }
    else {
        Write-Host "FAILED: Got unexpected error: $($_.Exception.Message)"
    }
}

Write-Host "`n2. Logging in as Admin..."
$loginBody = @{
    username = "admin"
    password = "admin123"
} | ConvertTo-Json

try {
    $loginResponse = Invoke-WebRequest -Uri "http://localhost:5000/api/auth/login" -Method Post -Body $loginBody -ContentType "application/json"
    $token = ($loginResponse.Content | ConvertFrom-Json).access_token.Trim()
    Write-Host "DEBUG: Token: $token"
    Write-Host "SUCCESS: Logged in. Token length: $($token.Length)"
}
catch {
    Write-Host "FAILED: Login failed: $($_.Exception.Message)"
    exit 1
}

Write-Host "`n3. Testing Authenticated Access to /scan..."
try {
    $scanResponse = Invoke-WebRequest -Uri "http://localhost:5000/api/scan" -Method Post -Body '{"target":"127.0.0.1"}' -ContentType "application/json" -Headers @{ "Authorization" = "Bearer $token" }
    if ($scanResponse.StatusCode -eq 200) {
        Write-Host "SUCCESS: Authorized request accepted."
    }
}
catch {
    Write-Host "FAILED: Authenticated request failed: $($_.Exception.Message)"
}
