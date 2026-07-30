$baseUrl = "http://localhost:5083/api"

Write-Host "=== TEST: ORDER ITEM PLANNING LIFECYCLE & DUPLICATE PROTECTION ==="

# 1. Get Customer or create Mia
$miaPayload = @{ name = "Mia Test 2"; email = "mia3@apparel.com"; phone = "9841000000"; address = "Lalitpur"; type = "Retail" } | ConvertTo-Json
$customer = Invoke-RestMethod -Uri "$baseUrl/customer" -Method POST -Body $miaPayload -ContentType "application/json"
Write-Host "1. Customer ID: $($customer.id)"

# 2. Get 2 products
$products = Invoke-RestMethod -Uri "$baseUrl/product"
$prod1 = $products[0]
$prod2 = $products[1]

# 3. Create Order with 2 OrderItems
$orderNum = "ORD-TEST-" + (Get-Random -Min 1000 -Max 9999)
$orderPayload = @{
    orderNumber = $orderNum
    customerId = $customer.id
    status = "Pending"
    dueDate = (Get-Date).AddDays(10).ToString("o")
    totalAmount = 8500.00
    orderItems = @(
        @{ productId = $prod1.id; quantity = 50; unitPrice = 100.00; totalPrice = 5000.00 },
        @{ productId = $prod2.id; quantity = 35; unitPrice = 100.00; totalPrice = 3500.00 }
    )
} | ConvertTo-Json

Invoke-RestMethod -Uri "$baseUrl/order" -Method POST -Body $orderPayload -ContentType "application/json"

$order = (Invoke-RestMethod -Uri "$baseUrl/order?orderNumber=$orderNum")[0]
$item1 = $order.orderItems[0]
$item2 = $order.orderItems[1]

Write-Host "2. Created Order: $($order.orderNumber) (ID: $($order.id))"
Write-Host "   - Item 1 ID: $($item1.id) ($($item1.product.name))"
Write-Host "   - Item 2 ID: $($item2.id) ($($item2.product.name))"

# 4. Create Plan 1 for Item 1
$plan1Payload = @{
    planId = "PLAN-ITEM1-" + (Get-Random)
    batchId = "BATCH-01"
    planName = "Plan for Item 1"
    demandType = "Customer Order"
    priority = "High"
    status = "Draft"
    plannedStartDate = (Get-Date).ToString("o")
    plannedCompletionDate = (Get-Date).AddDays(4).ToString("o")
    quantity = 50
    sourceOrderIds = @($order.id)
    productionPlanProducts = @(
        @{
            orderItemId = $item1.id
            orderNo = $order.orderNumber
            productId = $item1.productId.ToString()
            productName = $item1.product.name
            quantity = 50
            status = "Draft"
        }
    )
} | ConvertTo-Json

Invoke-RestMethod -Uri "$baseUrl/production-plans" -Method POST -Body $plan1Payload -ContentType "application/json"
Write-Host "3. Plan 1 created successfully for Item 1!"

$orderAfterPlan1 = (Invoke-RestMethod -Uri "$baseUrl/order?id=$($order.id)")[0]
Write-Host "   - Order status after Plan 1: Status=$($orderAfterPlan1.status), ProductionPlanId=$($orderAfterPlan1.productionPlanId)"

# 5. CREATE PLAN 2 FOR ITEM 2
$plan2Payload = @{
    planId = "PLAN-ITEM2-" + (Get-Random)
    batchId = "BATCH-02"
    planName = "Plan for Item 2"
    demandType = "Customer Order"
    priority = "High"
    status = "Draft"
    plannedStartDate = (Get-Date).ToString("o")
    plannedCompletionDate = (Get-Date).AddDays(4).ToString("o")
    quantity = 35
    sourceOrderIds = @($order.id)
    productionPlanProducts = @(
        @{
            orderItemId = $item2.id
            orderNo = $order.orderNumber
            productId = $item2.productId.ToString()
            productName = $item2.product.name
            quantity = 35
            status = "Draft"
        }
    )
} | ConvertTo-Json

Invoke-RestMethod -Uri "$baseUrl/production-plans" -Method POST -Body $plan2Payload -ContentType "application/json"
Write-Host "4. Plan 2 created successfully for Item 2!"

$orderAfterPlan2 = (Invoke-RestMethod -Uri "$baseUrl/order?id=$($order.id)")[0]
Write-Host "   - Order status after Plan 2 (ALL items planned): Status=$($orderAfterPlan2.status), ProductionPlanId=$($orderAfterPlan2.productionPlanId)"

# 6. ATTEMPT DUPLICATE PLAN FOR ITEM 1 (SHOULD BE REJECTED)
$plan3Payload = @{
    planId = "PLAN-DUP-" + (Get-Random)
    batchId = "BATCH-03"
    planName = "Duplicate Plan Attempt for Item 1"
    demandType = "Customer Order"
    priority = "High"
    status = "Draft"
    plannedStartDate = (Get-Date).ToString("o")
    plannedCompletionDate = (Get-Date).AddDays(4).ToString("o")
    quantity = 50
    sourceOrderIds = @($order.id)
    productionPlanProducts = @(
        @{
            orderItemId = $item1.id
            orderNo = $order.orderNumber
            productId = $item1.productId.ToString()
            productName = $item1.product.name
            quantity = 50
            status = "Draft"
        }
    )
} | ConvertTo-Json

try {
    Invoke-RestMethod -Uri "$baseUrl/production-plans" -Method POST -Body $plan3Payload -ContentType "application/json"
    Write-Host "5. ERROR: Plan 3 duplicate should have been rejected!"
} catch {
    $stream = $_.Exception.Response.GetResponseStream()
    $reader = New-Object System.IO.StreamReader($stream)
    Write-Host "5. SUCCESS: Duplicate Plan 3 rejected as expected!"
    Write-Host "   - Status Code: $($_.Exception.Response.StatusCode)"
    Write-Host "   - Rejected Message: $($reader.ReadToEnd())"
}
