Write-Host "=== 1. GET ALL SUPPLIERS ==="
$all = Invoke-RestMethod -Uri "http://localhost:5083/api/supplier"
Write-Host "Count: $($all.Count)"

Write-Host "=== 2. GET SUPPLIER BY ID 4 ==="
$s4 = Invoke-RestMethod -Uri "http://localhost:5083/api/supplier/4"
Write-Host "Supplier 4 Name: $($s4.name), Email: $($s4.contactEmail)"

Write-Host "=== 3. UPDATE SUPPLIER 4 ==="
$updateObj = @{
    id = 4
    name = "Sunrise Yarns & Fabrics Ltd"
    contactEmail = "sales@sunriseyarns.com"
    contactPhone = "+977-1-4433221"
    address = "Patan, Lalitpur, Nepal"
    status = "Active"
    onTimeDeliveryRate = 95.00
    defectRate = 1.00
    rating = 4.70
    totalOrders = 10
}
$updateJson = $updateObj | ConvertTo-Json
Invoke-RestMethod -Uri "http://localhost:5083/api/supplier/4" -Method PUT -Body $updateJson -ContentType "application/json"

$s4Updated = Invoke-RestMethod -Uri "http://localhost:5083/api/supplier/4"
Write-Host "Updated Name: $($s4Updated.name), Rating: $($s4Updated.rating)"

Write-Host "=== 4. RECALCULATE METRICS FOR SUPPLIER 4 ==="
$recalc = Invoke-RestMethod -Uri "http://localhost:5083/api/supplier/4/recalculate-metrics" -Method POST
Write-Host "Recalculated Rating: $($recalc.rating), TotalOrders: $($recalc.totalOrders), LastEvaluatedAt: $($recalc.lastEvaluatedAt)"

Write-Host "=== 5. DELETE SUPPLIER 4 ==="
Invoke-RestMethod -Uri "http://localhost:5083/api/supplier/4" -Method DELETE
Write-Host "Supplier 4 deleted."

Write-Host "=== 6. VERIFY FINAL COUNT ==="
$finalList = Invoke-RestMethod -Uri "http://localhost:5083/api/supplier"
Write-Host "Final Suppliers Count: $($finalList.Count)"
