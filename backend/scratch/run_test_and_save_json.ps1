# 1. Create Supplier
$supplierPayload = @{
    supplierCode = "SUP-PENDING-TEST"
    name = "Himalayan Silk & Fibers"
    contactEmail = "contact@himalayansilk.com"
    contactPhone = "+977-1-4998877"
    address = "Patan Industrial Estate, Lalitpur"
    status = "Active"
    materialCategoryIds = @()
} | ConvertTo-Json

$supplier = Invoke-RestMethod -Uri "http://localhost:5083/api/supplier" -Method POST -Body $supplierPayload -ContentType "application/json"

# 2. Create 2 Pending / Unfulfilled Material Requests for this Supplier
$req1Payload = @{
    materialId = [Guid]::NewGuid().ToString()
    materialName = "Raw Silk Yarn Grade A"
    requestedQuantity = 300.00
    supplierId = $supplier.id
    supplierName = $supplier.name
    urgency = "High"
    requiredDate = (Get-Date).AddDays(3).ToString("o")
    notes = "Pending fulfillment - Urgent order for boutique collection"
    requestedBy = "Quality Manager"
    status = "Pending"
} | ConvertTo-Json

$req2Payload = @{
    materialId = [Guid]::NewGuid().ToString()
    materialName = "Natural Dye Extract (Indigo)"
    requestedQuantity = 50.00
    supplierId = $supplier.id
    supplierName = $supplier.name
    urgency = "Normal"
    requiredDate = (Get-Date).AddDays(10).ToString("o")
    notes = "Requested - Awaiting supplier dispatch confirmation"
    requestedBy = "Inventory Controller"
    status = "Requested"
} | ConvertTo-Json

$req1 = Invoke-RestMethod -Uri "http://localhost:5083/api/material-request" -Method POST -Body $req1Payload -ContentType "application/json"
$req2 = Invoke-RestMethod -Uri "http://localhost:5083/api/material-request" -Method POST -Body $req2Payload -ContentType "application/json"

# 3. GET Supplier by ID (now returns all requests including pending/unfulfilled)
$supplierWithRequests = Invoke-RestMethod -Uri "http://localhost:5083/api/supplier/$($supplier.id)"

# 4. Format test results object
$testResult = @{
    testName = "Supplier API - Retrieve Pending & Unfulfilled Material Requests"
    timestamp = (Get-Date).ToString("o")
    status = "SUCCESS"
    supplier = $supplierWithRequests
}

$artifactPath = "C:\Users\Prince\.gemini\antigravity-cli\brain\d1d6c110-33eb-438f-85f2-3cb3b855801c\supplier_with_pending_requests_test_results.json"
$testResult | ConvertTo-Json -Depth 10 | Set-Content -Path $artifactPath -Encoding UTF8

Write-Host "Test completed successfully! Output saved to $artifactPath"
