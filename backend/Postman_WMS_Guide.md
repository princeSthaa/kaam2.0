# Procurement & WMS Testing Guide

This guide walks you through the exact end-to-end workflow to test the new Procurement -> Material Inspection -> Warehouse Management System (WMS) functionality in Postman.

## Prerequisites & Base Variables
Ensure your backend is running locally on its standard port (e.g. `https://localhost:5001` or `http://localhost:5000`). Substitute `{{baseUrl}}` with your actual URL.

Here are actual IDs retrieved from your database:
* **SupplierId**: `603fc36d-d319-49a5-a3d2-730ae7aa7a26`
* **MaterialId**: `f24a21a2-762b-4527-9580-ae4cd8866bd8`

---

## Step 1: Create a Warehouse Shelf
Since you need a physical shelf to put away items, first ensure you have a `Warehouse`, `WarehouseRoom`, and `WarehouseShelf` created. You can do this via your standard CRUD endpoints or directly in SQL. 

> **Note:** Make sure to save the generated `WarehouseShelfId` from this step. We will refer to it as `{{ShelfId}}`.

---

## Step 2: Create a Purchase Order

**POST** `{{baseUrl}}/api/purchase-order`

**Body (JSON)**:
```json
{
  "supplierId": "603fc36d-d319-49a5-a3d2-730ae7aa7a26",
  "orderNumber": "PO-TEST-001",
  "expectedDeliveryDate": "2026-08-15T00:00:00Z",
  "items": [
    {
      "materialId": "f24a21a2-762b-4527-9580-ae4cd8866bd8",
      "orderedQuantity": 100,
      "unitPrice": 50.00
    }
  ]
}
```
* **Action:** Send the request and copy the `Id` of the created Purchase Order. We will refer to it as `{{PO_Id}}`.
* **Action:** Copy the `Id` of the created Purchase Order Item inside the response. We will refer to it as `{{PO_ItemId}}`.

---

## Step 3: Receive the Purchase Order
When the truck arrives, create a receipt for the delivery.

**POST** `{{baseUrl}}/api/purchase-order-receipt`

**Body (JSON)**:
```json
{
  "purchaseOrderId": "{{PO_Id}}",
  "receiptNumber": "REC-TEST-001",
  "receiptDate": "2026-08-09T00:00:00Z",
  "items": [
    {
      "purchaseOrderItemId": "{{PO_ItemId}}",
      "materialId": "f24a21a2-762b-4527-9580-ae4cd8866bd8",
      "receivedQuantity": 100
    }
  ]
}
```
* **Action:** Sending this request automatically creates a `MaterialInspection` in the background. Note the receipt `Id` or query the DB to find the newly created `MaterialInspection` Id. We will refer to it as `{{InspectionId}}`. 
* **Action:** Also find the `MaterialInspectionItemId` inside that inspection. We will refer to it as `{{InspectionItemId}}`.

---

## Step 4: Perform the Material Inspection
Inspect the material. In this example, we accept 80 units and reject 20 units.

**PUT** `{{baseUrl}}/api/material-inspection/{{InspectionId}}`

**Body (JSON)**:
```json
{
  "items": [
    {
      "id": "{{InspectionItemId}}",
      "acceptedQuantity": 80,
      "rejectedQuantity": 20
    }
  ]
}
```

**What happens here:**
* **80 units** go to `Inventory` with `Status = "Staging"` and `WarehouseShelfId = null`.
* **20 units** go to `SupplierReturns`.

---

## Step 5: Find the Staging Inventory ID
Before putting away the items, you need the ID of the staging inventory record that was just created.

**GET** `{{baseUrl}}/api/inventory`
*(Or query the database `Inventories` table for `Status = 'Staging'` and `WarehouseShelfId IS NULL`)*

* **Action:** Copy the `Id` of this staging inventory record. We will refer to it as `{{StagingInventoryId}}`.

---

## Step 6: WMS Put-Away (New Feature!)
Now, move the staging items to the actual physical shelf in your warehouse.

**POST** `{{baseUrl}}/api/wmsinventory/putaway/{{StagingInventoryId}}`

**Body (JSON)**:
```json
{
  "targetWarehouseShelfId": "{{ShelfId}}",
  "quantity": 80
}
```

**What happens here:**
* The 80 units in Staging are decremented/removed.
* A new `Inventory` record is created (or updated) for `WarehouseShelfId` = `{{ShelfId}}` with `Status = "Available"`.
* An `InventoryMovement` log is recorded in the database tracking the physical put-away!

---

## Step 7: (Optional) WMS Transfer
If you want to move 30 units from this shelf to another shelf:

**POST** `{{baseUrl}}/api/wmsinventory/transfer/{{SourceInventoryId}}`
*(Where `SourceInventoryId` is the ID of the inventory record sitting on the current shelf)*

**Body (JSON)**:
```json
{
  "targetWarehouseShelfId": "{{NewShelfId}}",
  "quantity": 30
}
```
