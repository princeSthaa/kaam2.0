$suppliers = Invoke-RestMethod -Uri "http://localhost:5083/api/supplier"
$validCatId = ""
foreach ($s in $suppliers) {
    if ($s.materialCategories.Count -gt 0) {
        $validCatId = $s.materialCategories[0].id
        break
    }
}
Write-Host "Found valid MaterialCategory ID: $validCatId"

# POST Supplier with valid category ID or empty list
$supplierPostPayload = @{
    supplierCode = "SUP-2026-100"
    name = "Kathmandu Yarn & Threads Pvt Ltd"
    contactEmail = "sales@ktmyarn.com.np"
    contactPhone = "+977-1-4781234"
    address = "Balaju Industrial Area, Kathmandu"
    status = "Active"
    materialCategoryIds = if ($validCatId) { @($validCatId) } else { @() }
}
$supplierJson = $supplierPostPayload | ConvertTo-Json
$createdSupplier = Invoke-RestMethod -Uri "http://localhost:5083/api/supplier" -Method POST -Body $supplierJson -ContentType "application/json"
Write-Host "1. POST /api/supplier -> Created Supplier ID: $($createdSupplier.id)"
Write-Host "   Code: $($createdSupplier.supplierCode)"
Write-Host "   Name: $($createdSupplier.name)"

# POST MaterialRequest linked to createdSupplier.id
$materialRequestPostPayload = @{
    materialId = [Guid]::NewGuid().ToString()
    materialName = "Organic Raw Cotton Yarn"
    requestedQuantity = 750.50
    supplierId = $createdSupplier.id
    supplierName = $createdSupplier.name
    urgency = "High"
    requiredDate = (Get-Date).AddDays(7).ToString("o")
    notes = "Required for summer collection production batch #4"
    requestedBy = "Ramesh Sharma (Procurement Officer)"
    status = "Requested"
}
$requestJson = $materialRequestPostPayload | ConvertTo-Json
$createdRequest = Invoke-RestMethod -Uri "http://localhost:5083/api/material-request" -Method POST -Body $requestJson -ContentType "application/json"
Write-Host "2. POST /api/material-request -> Success!"

# GET all material requests to verify linkage
$allRequests = Invoke-RestMethod -Uri "http://localhost:5083/api/material-request"
$linkedRequest = $allRequests | Where-Object { $_.supplierId -eq $createdSupplier.id }
Write-Host "3. Linked Request verified -> Material: $($linkedRequest.materialName), SupplierId: $($linkedRequest.supplierId)"

# Recalculate metrics for supplier
$recalculated = Invoke-RestMethod -Uri "http://localhost:5083/api/supplier/$($createdSupplier.id)/recalculate-metrics" -Method POST
Write-Host "4. Supplier Metrics Recalculated -> TotalOrders: $($recalculated.totalOrders), Rating: $($recalculated.rating)"
