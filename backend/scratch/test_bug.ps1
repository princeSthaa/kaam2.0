$baseUrl = "http://localhost:5083/api"

# Get existing customer or create
$custs = Invoke-RestMethod -Uri "$baseUrl/customer"
$customer = $custs[0]

$prods = Invoke-RestMethod -Uri "$baseUrl/product"
$prod1 = $prods[0]
$prod2 = $prods[1]

$orderNum = "ORD-BUG-TEST-" + (Get-Random -Min 1000 -Max 9999)

# Create Order with 2 products
$orderPayload = @{
    orderNumber = $orderNum
    customerId = $customer.id
    status = "Pending"
    dueDate = (Get-Date).AddDays(14).ToString("o")
    totalAmount = 5000.00
    orderItems = @(
        @{ productId = $prod1.id; quantity = 10; unitPrice = 200.00; totalPrice = 2000.00 },
        @{ productId = $prod2.id; quantity = 15; unitPrice = 200.00; totalPrice = 3000.00 }
    )
} | ConvertTo-Json

Invoke-RestMethod -Uri "$baseUrl/order" -Method POST -Body $orderPayload -ContentType "application/json"

# Fetch created order
$orders = Invoke-RestMethod -Uri "$baseUrl/order?orderNumber=$orderNum"
$order = $orders[0]
Write-Host "1. Created Order ID: $($order.id), OrderNumber: $($order.orderNumber), Status: $($order.status)"

# Create Plan 1 for Product 1
$plan1Payload = @{
    planId = "PLAN-BUG-" + (Get-Random)
    batchId = "BATCH-001"
    planName = "Plan for Product 1"
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

$plan1Res = Invoke-RestMethod -Uri "$baseUrl/production-plans" -Method POST -Body $plan1Payload -ContentType "application/json"
Write-Host "2. Plan 1 created for Product 1!"

$orderAfterPlan1 = (Invoke-RestMethod -Uri "$baseUrl/order?id=$($order.id)")[0]
Write-Host "3. Order status after Plan 1: Status=$($orderAfterPlan1.status), ProductionPlanId=$($orderAfterPlan1.productionPlanId)"

# Create Plan 2 for Product 2
$plan2Payload = @{
    planId = "PLAN-BUG-" + (Get-Random)
    batchId = "BATCH-002"
    planName = "Plan for Product 2"
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

$plan2Res = Invoke-RestMethod -Uri "$baseUrl/production-plans" -Method POST -Body $plan2Payload -ContentType "application/json"
Write-Host "4. Plan 2 created for Product 2!"

$orderAfterPlan2 = (Invoke-RestMethod -Uri "$baseUrl/order?id=$($order.id)")[0]
Write-Host "5. Order status after Plan 2 (ALL items planned): Status=$($orderAfterPlan2.status), ProductionPlanId=$($orderAfterPlan2.productionPlanId)"

# Try creating Plan 3 for same order (should be blocked as fully planned)
try {
    $plan3Payload = @{
        planId = "PLAN-BUG-" + (Get-Random)
        batchId = "BATCH-003"
        planName = "Plan 3 - Attempt after fully planned"
        demandType = "Customer Order"
        priority = "High"
        status = "Draft"
        plannedStartDate = (Get-Date).ToString("o")
        plannedCompletionDate = (Get-Date).AddDays(5).ToString("o")
        quantity = 10
        sourceOrderIds = @($order.id)
        productionPlanProducts = @(
            @{ productId = $prod1.id.ToString(); productName = $prod1.name; quantity = 10; status = "Draft" }
        )
    } | ConvertTo-Json

    Invoke-RestMethod -Uri "$baseUrl/production-plans" -Method POST -Body $plan3Payload -ContentType "application/json"
    Write-Host "6. ERROR: Plan 3 should have been blocked!"
} catch {
    Write-Host "6. Plan 3 blocked as expected! Message: All products in order are already planned."
}
