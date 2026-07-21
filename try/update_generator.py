import json

with open(r'D:\kaam2.0\backend\generator.json', 'r') as f:
    data = json.load(f)

# Update Enums
for enum in data.get('Enums', []):
    if enum['Name'] == 'PlanStatus':
        # Add new statuses
        for s in ["OnHold", "Blocked", "Cancelled"]:
            if s not in enum['Values']:
                enum['Values'].append(s)
    elif enum['Name'] == 'PlanPriority':
        # Add new priorities
        for p in ["Urgent", "Critical", "Seasonal"]:
            if p not in enum['Values']:
                enum['Values'].append(p)

# Helper to find entity
def get_entity(name):
    for e in data.get('Entities', []):
        if e['Name'] == name:
            return e
    return None

def add_property(entity, prop):
    # Check if exists
    for p in entity.get('Properties', []):
        if p['Name'] == prop['Name']:
            return
    entity['Properties'].append(prop)

# Update Customer
customer = get_entity('Customer')
if customer:
    add_property(customer, { "Name": "Company", "Type": "string" })
    add_property(customer, { "Name": "PanVat", "Type": "string" })

# Update Order
order = get_entity('Order')
if order:
    add_property(order, { "Name": "DueDate", "Type": "datetime" })

# Update OrderItem
order_item = get_entity('OrderItem')
if order_item:
    add_property(order_item, { "Name": "TotalPrice", "Type": "decimal" })
    add_property(order_item, { "Name": "Discount", "Type": "decimal" })

# Update ProductionPlan
pp = get_entity('ProductionPlan')
if pp:
    add_property(pp, { "Name": "PlanDate", "Type": "datetime" })
    add_property(pp, { "Name": "OutputDestination", "Type": "string" })
    add_property(pp, { "Name": "RequiredDate", "Type": "datetime" })
    add_property(pp, { "Name": "Progress", "Type": "decimal" })
    add_property(pp, { "Name": "Blocked", "Type": "bool" })

# Update ProductionPlanProduct
ppp = get_entity('ProductionPlanProduct')
if ppp:
    add_property(ppp, { "Name": "PlannedStartDate", "Type": "datetime" })
    add_property(ppp, { "Name": "PlannedCompletionDate", "Type": "datetime" })
    add_property(ppp, { "Name": "Priority", "Type": "PlanPriority" })
    add_property(ppp, { "Name": "ProductionNotes", "Type": "string" })

# Update ProductionPlanStage
pps = get_entity('ProductionPlanStage')
if pps:
    add_property(pps, { "Name": "ActualStartDate", "Type": "datetime" })
    add_property(pps, { "Name": "ActualEndDate", "Type": "datetime" })
    add_property(pps, { "Name": "Remarks", "Type": "string" })

# Add entirely new entities
new_entities = [
    {
      "Name": "Material",
      "Annotations": [ "Table(\"Materials\")" ],
      "Properties": [
        { "Name": "Id", "Type": "string", "IsPrimaryKey": True },
        { "Name": "MaterialCode", "Type": "string", "Required": True },
        { "Name": "Name", "Type": "string", "Required": True },
        { "Name": "Type", "Type": "string" },
        { "Name": "AvailableQty", "Type": "decimal" },
        { "Name": "Unit", "Type": "string" },
        { "Name": "CostPerUnit", "Type": "decimal" }
      ]
    },
    {
      "Name": "BillOfMaterial",
      "Annotations": [ "Table(\"BillOfMaterials\")" ],
      "Properties": [
        { "Name": "Id", "Type": "string", "IsPrimaryKey": True },
        { "Name": "Product", "Type": "Product" },
        { "Name": "Material", "Type": "Material" },
        { "Name": "QtyPerUnit", "Type": "decimal" },
        { "Name": "WastagePercent", "Type": "decimal" }
      ]
    },
    {
      "Name": "Warehouse",
      "Annotations": [ "Table(\"Warehouses\")" ],
      "Properties": [
        { "Name": "Id", "Type": "string", "IsPrimaryKey": True },
        { "Name": "Code", "Type": "string", "Required": True },
        { "Name": "Name", "Type": "string", "Required": True },
        { "Name": "Location", "Type": "string" }
      ],
      "Children": ["WarehouseRoom"]
    },
    {
      "Name": "WarehouseRoom",
      "Parent": "Warehouse",
      "Annotations": [ "Table(\"WarehouseRooms\")" ],
      "Properties": [
        { "Name": "Id", "Type": "string", "IsPrimaryKey": True },
        { "Name": "Name", "Type": "string", "Required": True },
        { "Name": "Floor", "Type": "string" }
      ],
      "Children": ["WarehouseShelf"]
    },
    {
      "Name": "WarehouseShelf",
      "Parent": "WarehouseRoom",
      "Annotations": [ "Table(\"WarehouseShelves\")" ],
      "Properties": [
        { "Name": "Id", "Type": "string", "IsPrimaryKey": True },
        { "Name": "Code", "Type": "string", "Required": True },
        { "Name": "Capacity", "Type": "string" }
      ]
    },
    {
      "Name": "Inventory",
      "Annotations": [ "Table(\"Inventories\")" ],
      "Properties": [
        { "Name": "Id", "Type": "string", "IsPrimaryKey": True },
        { "Name": "SKU", "Type": "string", "Required": True },
        { "Name": "ItemName", "Type": "string", "Required": True },
        { "Name": "Type", "Type": "string" },
        { "Name": "Quantity", "Type": "decimal" },
        { "Name": "Location", "Type": "string" },
        { "Name": "Status", "Type": "string" }
      ]
    },
    {
      "Name": "Outlet",
      "Annotations": [ "Table(\"Outlets\")" ],
      "Properties": [
        { "Name": "Id", "Type": "string", "IsPrimaryKey": True },
        { "Name": "Name", "Type": "string", "Required": True },
        { "Name": "Location", "Type": "string" },
        { "Name": "Code", "Type": "string" }
      ],
      "Children": ["OutletDemand"]
    },
    {
      "Name": "OutletDemand",
      "Parent": "Outlet",
      "Annotations": [ "Table(\"OutletDemands\")" ],
      "Properties": [
        { "Name": "Id", "Type": "string", "IsPrimaryKey": True },
        { "Name": "DemandNumber", "Type": "string", "Required": True },
        { "Name": "Status", "Type": "string" },
        { "Name": "DueDate", "Type": "datetime" }
      ]
    },
    {
      "Name": "Transaction",
      "Annotations": [ "Table(\"Transactions\")" ],
      "Properties": [
        { "Name": "Id", "Type": "string", "IsPrimaryKey": True },
        { "Name": "Timestamp", "Type": "datetime", "Required": True },
        { "Name": "TransactionType", "Type": "string" },
        { "Name": "Amount", "Type": "decimal" },
        { "Name": "PaymentMethod", "Type": "string" },
        { "Name": "ReferenceEntity", "Type": "string" },
        { "Name": "HandledBy", "Type": "string" },
        { "Name": "Notes", "Type": "string" },
        { "Name": "Status", "Type": "string" }
      ]
    },
    {
      "Name": "ActivityLog",
      "Annotations": [ "Table(\"ActivityLogs\")" ],
      "Properties": [
        { "Name": "Id", "Type": "string", "IsPrimaryKey": True },
        { "Name": "Title", "Type": "string", "Required": True },
        { "Name": "Text", "Type": "string" },
        { "Name": "Timestamp", "Type": "datetime" },
        { "Name": "EntityId", "Type": "string" },
        { "Name": "EntityType", "Type": "string" }
      ]
    }
]

for new_entity in new_entities:
    if not get_entity(new_entity['Name']):
        data['Entities'].append(new_entity)

with open(r'D:\kaam2.0\backend\generator.json', 'w') as f:
    json.dump(data, f, indent=2)

print("Updated generator.json successfully.")
