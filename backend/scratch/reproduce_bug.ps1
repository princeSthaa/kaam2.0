$baseUrl = "http://localhost:5083/api"

Write-Host "=== TEST: REPRODUCING MULTI-PRODUCT ORDER PRODUCTION PLAN BUG ==="

# 1. Get or Create Customer
$custPayload = @{ name = "Test Multi-Item Customer"; email = "multi@customer.com"; phone = "9800000000"; address = "Ktm"; status = "Active" } | ConvertTo-Json
$customer = Invoke-RestMethod -Uri "$baseUrl/customer" -Method POST -Body $custPayload -ContentType "application/json"
Write-Host "1. Created Customer ID: $($customer.id)"

# 2. Get Products
$products = Invoke-RestMethod -Uri "$baseUrl/product"
if ($products.Count -lt 2) {
    Write-Host "Need at least 2 products in DB to test."
    exit
}
$prod1 = $products[0]
$prod2 = $products[1]

# 3. Create Order with 2 Products
$orderPayload = @{
    orderNumber = "ORD-BUG-TEST-001"
    customerId = $customer.id
    status = "Pending"
    dueDate = (Get-Date).AddDays(14).ToString("o")
    totalAmount = 5000.00
    orderItems = @(
        @{ productId = $prod1.id; quantity = 10; unitPrice = 200.00; totalPrice = 2000.00 },
        @{ productId = $prod2.id; quantity = 15; unitPrice = 200.00; totalPrice = 3000.00 }
    )
} | ConvertTo-Json

$order = Invoke-RestMethod -Uri "$baseUrl/order" -Method POST -Body $orderPayload -ContentType "application/json"
Write-Host "2. Created Order ID: $($order.id), OrderNumber: $($order.orderNumber)"

# 4. Create Plan 1 for Product 1 from this Order
$plan1Payload = @{
    planId = "PLAN-001"
    batchId = "BATCH-001"
    planName = "Plan for Product 1 Only"
    demandType = "Customer Order"
    priority = "High"
    status = "Draft"
    plannedStartDate = (Get-Date).ToString("o")
    plannedCompletionDate = (Get-Date).AddDays(5).ToString("o")
    quantity = 10
    sourceOrderIds = @($order.id)
    productionPlanProducts = @(
        @{
            productId = $prod1.id.ToString()
            productName = $prod1.name
            quantity = 10
            status = "Draft"
        }
    )
} | ConvertTo-Json

try {
    $plan1 = Invoke-RestMethod -Uri "$baseUrl/production-plan" -Method POST -Body $plan1Payload -ContentType "application/json"
    Write-Host "3. Created Production Plan 1 for Product 1 successfully!"
} catch {
    Write-Host "Failed to create Plan 1: $($_.Exception.Message)"
}

# Check Order Status after Plan 1
$orderAfterPlan1 = Invoke-RestMethod -Uri "$baseUrl/order/$($order.id)"
Write-Host "Order status after Plan 1 created: Status=$($orderAfterPlan1.status), ProductionPlanId=$($orderAfterPlan1.productionPlanId)"

# 5. NOW TRY TO CREATE PLAN 2 FOR PRODUCT 2 FROM THE SAME ORDER!
$plan2Payload = @{
    planId = "PLAN-002"
    batchId = "BATCH-002"
    planName = "Plan for Product 2 from same order"
    demandType = "Customer Order"
    priority = "High"
    status = "Draft"
    plannedStartDate = (Get-Date).ToString("o")
    plannedCompletionDate = (Get-Date).AddDays(5).ToString("o")
    quantity = 15
    sourceOrderIds = @($order.id)
    productionPlanProducts = @(
        @{
            productId = $prod2.id.ToString()
            productName = $prod2.name
            quantity = 15
            status = "Draft"
        }
    )
} | ConvertTo-Json

try {
    $plan2 = Invoke-RestMethod -Uri "$baseUrl/production-plan" -Method POST -Body $plan2Payload -ContentType "application/json"
    Write-Host "4. SUCCESS! Created Production Plan 2 for Product 2 from same order!"
} catch {
    Write-Host "4. FAILED to create Plan 2 for Product 2! Error: $($_.Exception.Message)"
    $stream = $_.Exception.Response.GetResponseStream()
    $reader = New-Object System.IO.StreamReader($stream)
    Write-Host "Response Body: $($reader.ReadToEnd())"
}
