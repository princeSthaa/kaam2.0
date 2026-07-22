using backend.Model;
using System;
using System.Collections.Generic;
using System.Linq;

namespace backend.Data
{
    public static class DatabaseSeeder
    {
        public static void Seed(AppDbContext context)
        {
            var customers = new List<Customer>();
            if (!context.Customers.Any())
            {
                for (int i = 1; i <= 25; i++)
                {
                    customers.Add(new Customer
                    {
                        Id = Guid.NewGuid().ToString(),
                        Name = $"Customer {i}",
                        Email = $"customer{i}@example.com",
                        Phone = $"98000000{i:D2}",
                        Address = $"Address {i}",
                        Type = i % 2 == 0 ? "Retail" : "Wholesale",
                        Company = $"Company {i}",
                        PanVat = $"1000{i:D2}"
                    });
                }
                context.Customers.AddRange(customers);
                context.SaveChanges();
            }
            else
            {
                customers = context.Customers.ToList();
            }

            // Seed Products from products.json
            if (!context.Products.Any())
            {
                var productsJson = System.IO.File.ReadAllText("Data/Store/products.json");
                var productsData = System.Text.Json.JsonSerializer.Deserialize<List<Product>>(productsJson, new System.Text.Json.JsonSerializerOptions { PropertyNameCaseInsensitive = true });
                if (productsData != null)
                {
                    context.Products.AddRange(productsData);
                }
            }

            // Seed Fabrics from fabrics.json
            if (!context.Fabrics.Any())
            {
                var fabricsJson = System.IO.File.ReadAllText("Data/Store/fabrics.json");
                var fabricsData = System.Text.Json.JsonSerializer.Deserialize<List<Fabric>>(fabricsJson, new System.Text.Json.JsonSerializerOptions { PropertyNameCaseInsensitive = true });
                if (fabricsData != null)
                {
                    context.Fabrics.AddRange(fabricsData);
                }
            }

            // Seed Orders (25)
            if (!context.Orders.Any())
            {
                var orders = new List<Order>();
                for (int i = 1; i <= 25; i++)
                {
                    orders.Add(new Order
                    {
                        Id = Guid.NewGuid().ToString(),
                        OrderNumber = $"ORD-{i:D4}",
                        Customer = customers[i - 1],
                        Status = backend.Model.Enums.OrderStatus.Pending,
                        TotalAmount = 5000 + (i * 100),
                        DueDate = DateTime.UtcNow.AddDays(i)
                    });
                }
                context.Orders.AddRange(orders);
                context.SaveChanges();
            }

            // Seed / Upsert WorkCenters from Data/Store/workcenters.json
            if (System.IO.File.Exists("Data/Store/workcenters.json"))
            {
                // Purge legacy dummy records if not referenced by stages
                var legacyDummies = context.WorkCenters.Where(w => w.Name.StartsWith("Work Center ")).ToList();
                if (legacyDummies.Any())
                {
                    foreach (var dummy in legacyDummies)
                    {
                        var isReferenced = context.ProductionPlanStages.Any(s => s.WorkCenterId == dummy.Id);
                        if (!isReferenced)
                        {
                            context.WorkCenters.Remove(dummy);
                        }
                    }
                    context.SaveChanges();
                }

                var workCentersJson = System.IO.File.ReadAllText("Data/Store/workcenters.json");
                var workCentersData = System.Text.Json.JsonSerializer.Deserialize<List<WorkCenter>>(workCentersJson, new System.Text.Json.JsonSerializerOptions { PropertyNameCaseInsensitive = true });
                if (workCentersData != null && workCentersData.Any())
                {
                    var existingMap = context.WorkCenters.ToDictionary(w => w.Id, w => w);
                    var toAdd = new List<WorkCenter>();

                    foreach (var item in workCentersData)
                    {
                        if (existingMap.TryGetValue(item.Id, out var existingWc))
                        {
                            existingWc.Name = item.Name;
                            existingWc.Type = item.Type;
                            existingWc.Status = item.Status;
                            existingWc.ProductionLine = item.ProductionLine;
                        }
                        else
                        {
                            toAdd.Add(item);
                        }
                    }

                    if (toAdd.Any())
                    {
                        context.WorkCenters.AddRange(toAdd);
                    }
                    context.SaveChanges();
                }
            }

            // Seed Warehouses (2)
            var warehouses = new List<Warehouse>();
            if (!context.Warehouses.Any())
            {
                warehouses = new List<Warehouse>
                {
                    new Warehouse { Id = Guid.NewGuid().ToString(), Code = "WH-01", Name = "Central Warehouse", Location = "Kathmandu" },
                    new Warehouse { Id = Guid.NewGuid().ToString(), Code = "WH-02", Name = "Regional Warehouse", Location = "Pokhara" }
                };
                context.Warehouses.AddRange(warehouses);
                context.SaveChanges();
            }
            else
            {
                warehouses = context.Warehouses.ToList();
            }

            // Seed Production Plans (25)
            if (!context.ProductionPlans.Any())
            {
                var plans = new List<ProductionPlan>();
                for (int i = 1; i <= 25; i++)
                {
                    plans.Add(new ProductionPlan
                    {
                        Id = Guid.NewGuid().ToString(),
                        PlanId = $"PP-{i:D4}",
                        BatchId = $"B-{i:D3}",
                        PlanName = $"Production Plan {i}",
                        DemandType = i % 2 == 0 ? "Customer Order" : "In-House Stock",
                        Priority = backend.Model.Enums.PlanPriority.Medium,
                        Status = backend.Model.Enums.PlanStatus.Draft,
                        PlannedStartDate = DateTime.UtcNow,
                        PlannedCompletionDate = DateTime.UtcNow.AddDays(7),
                        Quantity = 100 * i,
                        EstimatedCost = 1000 * i,
                        PlanDate = DateTime.UtcNow,
                        OutputDestination = warehouses[i % 2].Name,
                        RequiredDate = DateTime.UtcNow.AddDays(14),
                        Progress = 0,
                        Blocked = false
                    });
                }
                context.ProductionPlans.AddRange(plans);
                context.SaveChanges();
            }

            // Seed Materials
            if (!context.Materials.Any())
            {
                var materials = new List<Material>
                {
                    new Material { Id = "MAT-001", MaterialCode = "MAT-001", Name = "Dyed Cotton", Type = "Fabric", AvailableQty = 1000, Unit = "m", CostPerUnit = 150 },
                    new Material { Id = "MAT-002", MaterialCode = "MAT-002", Name = "Dyed Thread", Type = "Thread", AvailableQty = 5000, Unit = "spool", CostPerUnit = 25 },
                    new Material { Id = "MAT-003", MaterialCode = "MAT-003", Name = "Buttons", Type = "Accessory", AvailableQty = 10000, Unit = "pcs", CostPerUnit = 5 },
                    new Material { Id = "MAT-004", MaterialCode = "MAT-004", Name = "Zipper", Type = "Accessory", AvailableQty = 2000, Unit = "pcs", CostPerUnit = 15 }
                };
                context.Materials.AddRange(materials);

                // Seed BOMs
                if (!context.BillOfMaterials.Any())
                {
                    var boms = new List<BillOfMaterial>();
                    // T-Shirt (1111...)
                    boms.Add(new BillOfMaterial { Id = Guid.NewGuid().ToString(), ProductId = "11111111-1111-1111-1111-111111111111", MaterialId = "MAT-001", QtyPerUnit = 1.2m, WastagePercent = 5 });
                    boms.Add(new BillOfMaterial { Id = Guid.NewGuid().ToString(), ProductId = "11111111-1111-1111-1111-111111111111", MaterialId = "MAT-002", QtyPerUnit = 0.5m, WastagePercent = 2 });
                    
                    // Polo Shirt (2222...)
                    boms.Add(new BillOfMaterial { Id = Guid.NewGuid().ToString(), ProductId = "22222222-2222-2222-2222-222222222222", MaterialId = "MAT-001", QtyPerUnit = 1.5m, WastagePercent = 5 });
                    boms.Add(new BillOfMaterial { Id = Guid.NewGuid().ToString(), ProductId = "22222222-2222-2222-2222-222222222222", MaterialId = "MAT-002", QtyPerUnit = 0.6m, WastagePercent = 2 });
                    boms.Add(new BillOfMaterial { Id = Guid.NewGuid().ToString(), ProductId = "22222222-2222-2222-2222-222222222222", MaterialId = "MAT-003", QtyPerUnit = 3m, WastagePercent = 0 });

                    // Trousers (3333...)
                    boms.Add(new BillOfMaterial { Id = Guid.NewGuid().ToString(), ProductId = "33333333-3333-3333-3333-333333333333", MaterialId = "MAT-001", QtyPerUnit = 1.8m, WastagePercent = 5 });
                    boms.Add(new BillOfMaterial { Id = Guid.NewGuid().ToString(), ProductId = "33333333-3333-3333-3333-333333333333", MaterialId = "MAT-002", QtyPerUnit = 0.8m, WastagePercent = 2 });
                    boms.Add(new BillOfMaterial { Id = Guid.NewGuid().ToString(), ProductId = "33333333-3333-3333-3333-333333333333", MaterialId = "MAT-003", QtyPerUnit = 1m, WastagePercent = 0 });
                    boms.Add(new BillOfMaterial { Id = Guid.NewGuid().ToString(), ProductId = "33333333-3333-3333-3333-333333333333", MaterialId = "MAT-004", QtyPerUnit = 1m, WastagePercent = 0 });

                    // Hoodie (4444...)
                    boms.Add(new BillOfMaterial { Id = Guid.NewGuid().ToString(), ProductId = "44444444-4444-4444-4444-444444444444", MaterialId = "MAT-001", QtyPerUnit = 2.0m, WastagePercent = 8 });
                    boms.Add(new BillOfMaterial { Id = Guid.NewGuid().ToString(), ProductId = "44444444-4444-4444-4444-444444444444", MaterialId = "MAT-002", QtyPerUnit = 1.0m, WastagePercent = 2 });
                    boms.Add(new BillOfMaterial { Id = Guid.NewGuid().ToString(), ProductId = "44444444-4444-4444-4444-444444444444", MaterialId = "MAT-004", QtyPerUnit = 1m, WastagePercent = 0 });

                    // Kurta (5555...)
                    boms.Add(new BillOfMaterial { Id = Guid.NewGuid().ToString(), ProductId = "55555555-5555-5555-5555-555555555555", MaterialId = "MAT-001", QtyPerUnit = 2.5m, WastagePercent = 5 });
                    boms.Add(new BillOfMaterial { Id = Guid.NewGuid().ToString(), ProductId = "55555555-5555-5555-5555-555555555555", MaterialId = "MAT-002", QtyPerUnit = 0.8m, WastagePercent = 2 });
                    
                    context.BillOfMaterials.AddRange(boms);
                }
            }

            context.SaveChanges();
        }
    }
}
