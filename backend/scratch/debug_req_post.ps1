try {
    $supId = "cd84dd40-ef36-4f91-b8b4-741528a7d2dd"
    $reqBody = @{
        materialId = [Guid]::NewGuid().ToString()
        materialName = "Organic Raw Cotton Yarn"
        requestedQuantity = 750.50
        supplierId = $supId
        supplierName = "Kathmandu Yarn"
        urgency = "High"
        requiredDate = (Get-Date).AddDays(7).ToString("o")
        notes = "Required for summer collection production batch #4"
        requestedBy = "Ramesh Sharma (Procurement Officer)"
        status = "Requested"
    } | ConvertTo-Json

    $res = Invoke-RestMethod -Uri "http://localhost:5083/api/material-request" -Method POST -Body $reqBody -ContentType "application/json"
    Write-Host "Material Request POST Success!"
} catch {
    $stream = $_.Exception.Response.GetResponseStream()
    $reader = New-Object System.IO.StreamReader($stream)
    Write-Host "HTTP status: $($_.Exception.Response.StatusCode)"
    Write-Host "Error Body: $($reader.ReadToEnd())"
}
