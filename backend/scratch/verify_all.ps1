$body = @{
    supplierCode = "SUP-999"
    name = "Test Supplier"
    contactEmail = "test@supplier.com"
    contactPhone = "98000"
    address = "Ktm"
    status = "Active"
    materialCategoryIds = @("48ff206e-0918-4663-ad92-4b7ccad1cb34", "b5b7efde-6654-4e98-9efe-759d2f15a686")
} | ConvertTo-Json

$res = Invoke-RestMethod -Uri "http://localhost:5083/api/supplier" -Method POST -Body $body -ContentType "application/json"
Write-Host "Created Supplier ID: $($res.id)"
Write-Host "Categories count: $($res.materialCategories.Count)"
foreach ($cat in $res.materialCategories) {
    Write-Host " - $($cat.id): $($cat.name)"
}

$updateBody = @{
    supplierCode = "SUP-999-UPD"
    name = "Test Supplier Updated"
    contactEmail = "test@supplier.com"
    contactPhone = "98000"
    address = "Ktm"
    status = "Active"
    materialCategoryIds = @("48ff206e-0918-4663-ad92-4b7ccad1cb34")
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:5083/api/supplier/$($res.id)" -Method PUT -Body $updateBody -ContentType "application/json"

$updated = Invoke-RestMethod -Uri "http://localhost:5083/api/supplier/$($res.id)"
Write-Host "After Update Categories count: $($updated.materialCategories.Count)"
foreach ($cat in $updated.materialCategories) {
    Write-Host " - $($cat.id): $($cat.name)"
}
