$baseUrl = "http://localhost:5083/api"
$artifactPath = "C:\Users\Prince\.gemini\antigravity-cli\brain\d1d6c110-33eb-438f-85f2-3cb3b855801c\mia_order_item_planning_results.json"

Write-Host "=== EXECUTION: MIA'S ORDER ITEM PLANNING WORKFLOW ==="

# 1. CREATE CUSTOMER MIA
$miaPayload = @{
    name = "Mia"
    email = "mia@apparel.com"
    phone = "9841000000"
    address = "Lalitpur, Nepal"
    type = "Retail"
} | ConvertTo-Json

$miaCustomer = Invoke-RestMethod -Uri "$baseUrl/customer" -Method POST -Body $miaPayload -ContentType "application/json"
Write-Host "1. Created Customer: Mia (ID: $($miaCustomer.id))"

# 2. GET PRODUCTS FOR ORDER
$products = Invoke-RestMethod -Uri "$baseUrl/product"
$prod1 = $products[0]
$prod2 = $products[1]

# 3. CREATE MIA'S ORDER WITH 2 PRODUCTS (2 ORDER ITEMS)
$miaOrderPayload = @{
    orderNumber = "ORD-MIA-2026-" + (Get-Random -Min 1000 -Max 9999)
    customerId = $miaCustomer.id
    status = "Pending"
    dueDate = (Get-Date).AddDays(10).ToString("o")
    totalAmount = 8500.00
    orderItems = @(
        @{
            productId = $prod1.id
            quantity = 50
            unitPrice = 100.00
            totalPrice = 5000.00
        },
        @{
            productId = $prod2.id
            quantity = 35
            unitPrice = 100.00
            totalPrice = 3500.00
        }
    )
} | ConvertTo-Json

Invoke-RestMethod -Uri "$baseUrl/order" -Method POST -Body $miaOrderPayload -ContentType "application/json"

# Retrieve created order to get OrderItem IDs
$orders = Invoke-RestMethod -Uri "$baseUrl/order?customerId=$($miaCustomer.id)"
$miaOrder = $orders[0]
$item1 = $miaOrder.orderItems[0]
$item2 = $miaOrder.orderItems[1]

Write-Host "2. Created Order for Mia: $($miaOrder.orderNumber) (ID: $($miaOrder.id))"
Write-Host "   - OrderItem 1: $($item1.product.name) (Qty: $($item1.quantity), ItemID: $($item1.id))"
Write-Host "   - OrderItem 2: $($item2.product.name) (Qty: $($item2.quantity), ItemID: $($item2.id))"

# 4. CREATE PRODUCTION PLAN FOR ONLY 1 PRODUCT (ORDER ITEM #1)
$planPayload = @{
    planId = "PLAN-MIA-" + (Get-Random -Min 1000 -Max 9999)
    batchId = "BATCH-MIA-01"
    planName = "Production Plan for Mia's First Product ($($item1.product.name))"
    demandType = "Customer Order"
    priority = "High"
    status = "Draft"
    plannedStartDate = (Get-Date).ToString("o")
    plannedCompletionDate = (Get-Date).AddDays(4).ToString("o")
    quantity = $item1.quantity
    sourceOrderIds = @($miaOrder.id)
    productionPlanProducts = @(
        @{
            orderItemId = $item1.id
            orderNo = $miaOrder.orderNumber
            productId = $item1.productId.ToString()
            productName = $item1.product.name
            quantity = $item1.quantity
            status = "Draft"
        }
    )
} | ConvertTo-Json

Invoke-RestMethod -Uri "$baseUrl/production-plans" -Method POST -Body $planPayload -ContentType "application/json"
Write-Host "3. Created Production Plan for ONLY OrderItem 1!"

# 5. FETCH UPDATED ORDER DETAILS & PRODUCTION PLAN DETAILS
$updatedOrder = (Invoke-RestMethod -Uri "$baseUrl/order?id=$($miaOrder.id)")[0]
$plans = Invoke-RestMethod -Uri "$baseUrl/production-plans"
$createdPlan = $plans | Where-Object { $_.planName -like "*Mia's First Product*" } | Select-Object -First 1

# 6. SAVE COMPLETE JSON RESULT ARTIFACT
$finalResults = @{
    workflow = "OrderItem Level Production Planning for Customer Mia"
    timestamp = (Get-Date).ToString("o")
    customer = $miaCustomer
    createdOrderPayload = ($miaOrderPayload | ConvertFrom-Json)
    createdOrderResponse = $updatedOrder
    createdProductionPlanPayload = ($planPayload | ConvertFrom-Json)
    createdProductionPlanResponse = $createdPlan
    verificationSummary = @{
        totalOrderItemsInMiaOrder = $updatedOrder.orderItems.Count
        plannedItems = @(
            @{
                orderItemId = $item1.id
                productName = $item1.product.name
                planningStatus = "PLANNED into Production Plan ID $($createdPlan.id)"
            }
        )
        unplannedItemsAvailableForNextPlan = @(
            @{
                orderItemId = $item2.id
                productName = $item2.product.name
                planningStatus = "UNPLANNED / AVAILABLE for Next Production Plan"
            }
        )
    }
}

$finalResults | ConvertTo-Json -Depth 10 | Set-Content -Path $artifactPath -Encoding UTF8
Write-Host "=== WORKFLOW COMPLETED SUCCESSFULLY! JSON SAVED TO $artifactPath ==="
