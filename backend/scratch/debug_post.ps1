try {
    $b = @{
        supplierCode = "SUP-999"
        name = "Kathmandu Yarn"
        contactEmail = "test@yarn.com"
        contactPhone = "98000"
        address = "Ktm"
        status = "Active"
        materialCategoryIds = @()
    } | ConvertTo-Json

    $res = Invoke-RestMethod -Uri "http://localhost:5083/api/supplier" -Method POST -Body $b -ContentType "application/json"
    Write-Host "Success! ID: $($res.id)"
} catch {
    $stream = $_.Exception.Response.GetResponseStream()
    $reader = New-Object System.IO.StreamReader($stream)
    Write-Host "HTTP status: $($_.Exception.Response.StatusCode)"
    Write-Host "Error Body: $($reader.ReadToEnd())"
}
