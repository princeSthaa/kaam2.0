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

            // Seed Products
            var prodImgFiles = new[] { "polo-shirt.jpg", "casual-shirt.jpg", "hotel-uniform.jpg", "school-uniform.jpg", "tracksuit.jpg" };
            if (!context.Products.Any())
            {
                if (System.IO.File.Exists("Data/Store/products.json"))
                {
                    var productsJson = System.IO.File.ReadAllText("Data/Store/products.json");
                    var productsData = System.Text.Json.JsonSerializer.Deserialize<List<Product>>(productsJson, new System.Text.Json.JsonSerializerOptions { PropertyNameCaseInsensitive = true });
                    if (productsData != null) context.Products.AddRange(productsData);
                }
                else
                {
                    var prods = new List<Product>();
                    for (int i = 1; i <= 25; i++)
                    {
                        var imgName = prodImgFiles[(i - 1) % prodImgFiles.Length];
                        prods.Add(new Product
                        {
                            Id = Guid.NewGuid().ToString(),
                            Name = $"Product {i}",
                            ImagePath = $"/Media/images/products/{imgName}"
                        });
                    }
                    context.Products.AddRange(prods);
                }
                context.SaveChanges();
            }

            // Ensure all existing products have valid Media/images/products paths
            var existingProds = context.Products.ToList();
            bool prodsUpdated = false;
            for (int i = 0; i < existingProds.Count; i++)
            {
                if (string.IsNullOrWhiteSpace(existingProds[i].ImagePath) || !existingProds[i].ImagePath.StartsWith("/Media/images/products/"))
                {
                    var imgName = prodImgFiles[i % prodImgFiles.Length];
                    existingProds[i].ImagePath = $"/Media/images/products/{imgName}";
                    prodsUpdated = true;
                }
            }
            if (prodsUpdated) context.SaveChanges();

            // Seed Fabrics
            var fabricImgFiles = new[] { "FAB-001.jpg", "FAB-002.png", "FAB-003.png", "FAB-004.png", "FAB-005.png" };
            if (!context.Fabrics.Any())
            {
                if (System.IO.File.Exists("Data/Store/fabrics.json"))
                {
                    var fabricsJson = System.IO.File.ReadAllText("Data/Store/fabrics.json");
                    var fabricsData = System.Text.Json.JsonSerializer.Deserialize<List<Fabric>>(fabricsJson, new System.Text.Json.JsonSerializerOptions { PropertyNameCaseInsensitive = true });
                    if (fabricsData != null) context.Fabrics.AddRange(fabricsData);
                }
                else
                {
                    var fabs = new List<Fabric>();
                    for (int i = 1; i <= 5; i++)
                    {
                        var imgName = fabricImgFiles[(i - 1) % fabricImgFiles.Length];
                        fabs.Add(new Fabric
                        {
                            Id = Guid.NewGuid().ToString(),
                            Name = $"Fabric {i}",
                            Category = "Cotton Blend",
                            UnitPrice = 250,
                            ImagePath = $"/Media/images/fabrics/{imgName}"
                        });
                    }
                    context.Fabrics.AddRange(fabs);
                }
                context.SaveChanges();
            }

            // Ensure all existing fabrics have valid Media/images/fabrics paths
            var existingFabs = context.Fabrics.ToList();
            bool fabsUpdated = false;
            for (int i = 0; i < existingFabs.Count; i++)
            {
                if (string.IsNullOrWhiteSpace(existingFabs[i].ImagePath) || !existingFabs[i].ImagePath.StartsWith("/Media/images/fabrics/"))
                {
                    var imgName = fabricImgFiles[i % fabricImgFiles.Length];
                    existingFabs[i].ImagePath = $"/Media/images/fabrics/{imgName}";
                    fabsUpdated = true;
                }
            }
            if (fabsUpdated) context.SaveChanges();

            // Re-seed Orders with OrderItems if OrderItems is empty
            if (!context.OrderItems.Any() && context.Orders.Any())
            {
                context.Orders.RemoveRange(context.Orders);
                context.SaveChanges();
            }

            // Seed Orders (25)
            if (!context.Orders.Any())
            {
                var products = context.Products.ToList();
                var fabrics = context.Fabrics.ToList();
                var orders = new List<Order>();

                for (int i = 1; i <= 25; i++)
                {
                    var orderId = Guid.NewGuid().ToString();
                    var prod = products.Count > 0 ? products[(i - 1) % products.Count] : null;
                    var fab = fabrics.Count > 0 ? fabrics[(i - 1) % fabrics.Count] : null;

                    var orderItems = new List<OrderItem>();
                    if (prod != null)
                    {
                        orderItems.Add(new OrderItem
                        {
                            Id = Guid.NewGuid().ToString(),
                            OrderId = orderId,
                            ProductId = prod.Id,
                            Product = prod,
                            FabricId = fab != null ? fab.Id : "",
                            Quantity = 50 * ((i % 5) + 1),
                            UnitPrice = 500,
                            TotalPrice = 500 * 50 * ((i % 5) + 1)
                        });
                    }

                    orders.Add(new Order
                    {
                        Id = orderId,
                        OrderNumber = $"ORD-{i:D4}",
                        Customer = customers[i - 1],
                        Status = backend.Model.Enums.OrderStatus.Pending,
                        TotalAmount = 5000 + (i * 100),
                        DueDate = DateTime.UtcNow.AddDays(i),
                        OrderItems = orderItems
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
                    var allProds = context.Products.ToList();
                    if (allProds.Any())
                    {
                        for (int i = 0; i < allProds.Count; i++)
                        {
                            var prodId = allProds[i].Id;
                            boms.Add(new BillOfMaterial { Id = Guid.NewGuid().ToString(), ProductId = prodId, MaterialId = "MAT-001", QtyPerUnit = 1.5m, WastagePercent = 5 });
                            boms.Add(new BillOfMaterial { Id = Guid.NewGuid().ToString(), ProductId = prodId, MaterialId = "MAT-002", QtyPerUnit = 0.5m, WastagePercent = 2 });
                        }
                    }
                    context.BillOfMaterials.AddRange(boms);
                }
            }

            context.SaveChanges();
        }
    }
}
