Write-Host "=== 1. GET ALL SUPPLIERS ==="
$all = Invoke-RestMethod -Uri "http://localhost:5083/api/supplier"
Write-Host "Count: $($all.Count)"
$s1 = $all[0]
Write-Host "Supplier 1 ID: $($s1.id), Code: $($s1.supplierCode), Name: $($s1.name)"

Write-Host "=== 2. RECALCULATE METRICS FOR SUPPLIER 1 ==="
$recalc = Invoke-RestMethod -Uri "http://localhost:5083/api/supplier/$($s1.id)/recalculate-metrics" -Method POST
Write-Host "Rating: $($recalc.rating), TotalOrders: $($recalc.totalOrders), OnTimeRate: $($recalc.onTimeDeliveryRate)%"

Write-Host "=== 3. GET MATERIAL REQUESTS ==="
$requests = Invoke-RestMethod -Uri "http://localhost:5083/api/material-request"
Write-Host "Requests count: $($requests.Count), First Request SupplierId: $($requests[0].supplierId)"

Write-Host "=== 4. GET MATERIAL INSPECTIONS ==="
$inspections = Invoke-RestMethod -Uri "http://localhost:5083/api/material-inspection"
Write-Host "Inspections count: $($inspections.Count), First Inspection MaterialRequestId: $($inspections[0].materialRequestId)"
