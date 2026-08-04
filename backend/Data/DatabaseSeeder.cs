using backend.Model;
using backend.Model.Enums;
using System;
using System.Collections.Generic;
using System.Linq;
using Microsoft.EntityFrameworkCore;

namespace backend.Data
{
    public static class DatabaseSeeder
    {
        public static void Seed(AppDbContext context)
        {
            try
            {
                context.Database.ExecuteSqlRaw(@"
                    IF NOT EXISTS (
                        SELECT 1 FROM sys.columns 
                        WHERE object_id = OBJECT_ID(N'[ProductionPlanProducts]') 
                        AND name = 'OrderItemId'
                    )
                    BEGIN
                        ALTER TABLE [ProductionPlanProducts] ADD [OrderItemId] UNIQUEIDENTIFIER NULL;
                    END

                    IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID(N'[Products]') AND name = 'SKU')
                    BEGIN
                        ALTER TABLE [Products] ADD [SKU] NVARCHAR(50) NULL;
                    END

                    IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID(N'[Products]') AND name = 'isActive')
                    BEGIN
                        ALTER TABLE [Products] ADD [isActive] BIT NOT NULL DEFAULT 1;
                    END

                    IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID(N'[Products]') AND name = 'ProductCategoryId')
                    BEGIN
                        ALTER TABLE [Products] ADD [ProductCategoryId] UNIQUEIDENTIFIER NULL;
                    END
                ");
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Migration note: {ex.Message}");
            }

            if (!context.ProductionStages.Any())
            {
                var defaultStages = new[] { "Cutting", "Stitching", "Quality Check", "Ironing & Packaging" };
                foreach (var stageName in defaultStages)
                {
                    context.ProductionStages.Add(new ProductionStage { Id = Guid.NewGuid(), Name = stageName, isActive = true });
                }
                context.SaveChanges();
            }

            if (!context.ProductCategories.Any())
            {
                var categories = new[] 
                {
                    ("CAT-SHIRTS", "Shirts"),
                    ("CAT-TROUSERS", "Trousers"),
                    ("CAT-UNIFORMS", "School & Corporate Uniforms"),
                    ("CAT-ACCESSORIES", "Accessories")
                };
                var now = DateTime.UtcNow;
                foreach (var (code, name) in categories)
                {
                    context.ProductCategories.Add(new ProductCategory 
                    { 
                        Id = Guid.NewGuid(), 
                        CategoryCode = code, 
                        Name = name, 
                        isActive = true,
                        CreatedAt = now,
                        UpdatedAt = now
                    });
                }
                context.SaveChanges();
            }

            var customers = new List<Customer>();
            if (!context.Customers.Any())
            {
                for (int i = 1; i <= 25; i++)
                {
                    customers.Add(new Customer
                    {
                        Id = Guid.NewGuid(),
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
                    var defaultCategory = context.ProductCategories.FirstOrDefault();
                    var categoryId = defaultCategory?.Id ?? Guid.NewGuid();
                    var now = DateTime.UtcNow;

                    for (int i = 1; i <= 25; i++)
                    {
                        var imgName = prodImgFiles[(i - 1) % prodImgFiles.Length];
                        prods.Add(new Product
                        {
                            Id = Guid.NewGuid(),
                            SKU = $"SKU-PROD-{i:D3}",
                            Name = $"Product {i}",
                            isActive = true,
                            ProductCategoryId = categoryId,
                            ImagePath = $"/Media/images/products/{imgName}",
                            CreatedAt = now,
                            UpdatedAt = now
                        });
                    }
                    context.Products.AddRange(prods);
                }
                context.SaveChanges();
            }
    
            // Ensure all existing products have valid relative Media/images/products paths
            var existingProds = context.Products.ToList();
            bool prodsUpdated = false;
            for (int i = 0; i < existingProds.Count; i++)
            {
                if (!string.IsNullOrWhiteSpace(existingProds[i].ImagePath))
                {
                    var relative = backend.Helpers.ImagePathHelper.ToRelativePath(existingProds[i].ImagePath);
                    if (existingProds[i].ImagePath != relative)
                    {
                        existingProds[i].ImagePath = relative;
                        prodsUpdated = true;
                    }
                }
                if (string.IsNullOrWhiteSpace(existingProds[i].ImagePath) || !existingProds[i].ImagePath.StartsWith("/Media/images/products/"))
                {
                    var imgName = prodImgFiles[i % prodImgFiles.Length];
                    existingProds[i].ImagePath = $"/Media/images/products/{imgName}";
                    prodsUpdated = true;
                }
            }
            if (prodsUpdated) context.SaveChanges();
        
            // Ensure all existing ProductionPlanProducts have relative ProductImage paths
            var existingPlanProds = context.ProductionPlanProducts.ToList();
            bool planProdsUpdated = false;
            for (int i = 0; i < existingPlanProds.Count; i++)
            {
                if (!string.IsNullOrWhiteSpace(existingPlanProds[i].ProductImage))
                {
                    var relative = backend.Helpers.ImagePathHelper.ToRelativePath(existingPlanProds[i].ProductImage);
                    if (existingPlanProds[i].ProductImage != relative)
                    {
                        existingPlanProds[i].ProductImage = relative;
                        planProdsUpdated = true;
                    }
                }
            }
            if (planProdsUpdated) context.SaveChanges();

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
                var materials = context.Materials.ToList();
                var orders = new List<Order>();

                for (int i = 1; i <= 25; i++)
                {
                    var orderId = Guid.NewGuid();
                    var prod = products.Count > 0 ? products[(i - 1) % products.Count] : null;

                    if (prod == null)
                        continue;

                    var orderItems = new List<OrderItem>();

                    var orderItemId = Guid.NewGuid();

                    orderItems.Add(new OrderItem
                    {
                        Id = orderItemId,
                        OrderId = orderId,
                        ProductId = prod.Id,
                        Product = prod,
                        Quantity = 50 * ((i % 5) + 1),
                        UnitPrice = 500,
                        TotalPrice = 500 * 50 * ((i % 5) + 1),

                        OrderItemMaterials = materials
                            .Take(2)
                            .Select(m => new OrderItemMaterial
                            {
                                Id = Guid.NewGuid(),
                                MaterialId = m.Id,
                                RequiredQuantity = 10,
                                OrderItemId = orderItemId
                            })
                            .ToList()
                    });

                    orders.Add(new Order
                    {
                        Id = orderId,
                        OrderNumber = $"ORD-{i:D4}",
                        Customer = customers.Count > 0 ? customers[(i - 1) % customers.Count] : null!,
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
                    new Warehouse { Id = Guid.NewGuid(), Code = "WH-01", Name = "Central Warehouse", Location = "Kathmandu" },
                    new Warehouse { Id = Guid.NewGuid(), Code = "WH-02", Name = "Regional Warehouse", Location = "Pokhara" }
                };
                context.Warehouses.AddRange(warehouses);
                context.SaveChanges();
            }
            else
            {
                warehouses = context.Warehouses.ToList();
            }

            // Seed WarehouseRooms
            if (!context.WarehouseRooms.Any() && warehouses.Any())
            {
                var mainWh = warehouses.First();
                var rooms = new List<WarehouseRoom>
                {
                    new WarehouseRoom { Id = Guid.NewGuid(), Name = "Room A - Raw Fabrics", Floor = "Ground Floor", WarehouseId = mainWh.Id },
                    new WarehouseRoom { Id = Guid.NewGuid(), Name = "Room B - Finished Garments", Floor = "Ground Floor", WarehouseId = mainWh.Id },
                    new WarehouseRoom { Id = Guid.NewGuid(), Name = "Room C - Accessories & Trims", Floor = "1st Floor", WarehouseId = mainWh.Id },
                    new WarehouseRoom { Id = Guid.NewGuid(), Name = "Room D - Returns & Quarantine", Floor = "1st Floor", WarehouseId = mainWh.Id }
                };
                context.WarehouseRooms.AddRange(rooms);
                context.SaveChanges();

                // Seed WarehouseShelves
                if (!context.WarehouseShelfs.Any())
                {
                    var shelves = new List<WarehouseShelf>();
                    for (int level = 1; level <= 4; level++)
                    {
                        for (int pos = 1; pos <= 4; pos++)
                        {
                            shelves.Add(new WarehouseShelf
                            {
                                Id = Guid.NewGuid(),
                                Code = $"A-{level}0{pos}",
                                Capacity = "1000",
                                WarehouseRoomId = rooms.First().Id
                            });
                        }
                    }
                    context.WarehouseShelfs.AddRange(shelves);
                    context.SaveChanges();
                }
            }

            // Seed Production Plans (25)
            if (!context.ProductionPlans.Any())
            {
                var plans = new List<ProductionPlan>();
                for (int i = 1; i <= 25; i++)
                {
                    plans.Add(new ProductionPlan
                    {
                        Id = Guid.NewGuid(),
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

            // 1. Seed MaterialTypes & MaterialCategories safely
            var fabricType = context.MaterialTypes.FirstOrDefault(t => t.Name == "Fabric");
            if (fabricType == null)
            {
                fabricType = new MaterialType { Id = Guid.NewGuid(), Name = "Fabric" };
                context.MaterialTypes.Add(fabricType);
            }

            var threadType = context.MaterialTypes.FirstOrDefault(t => t.Name == "Thread");
            if (threadType == null)
            {
                threadType = new MaterialType { Id = Guid.NewGuid(), Name = "Thread" };
                context.MaterialTypes.Add(threadType);
            }

            var accessoryType = context.MaterialTypes.FirstOrDefault(t => t.Name == "Accessory");
            if (accessoryType == null)
            {
                accessoryType = new MaterialType { Id = Guid.NewGuid(), Name = "Accessory" };
                context.MaterialTypes.Add(accessoryType);
            }

            context.SaveChanges();

            // Seed MaterialCategories
            var cottonCat = context.MaterialCategories.FirstOrDefault(c => c.Name == "Cotton");
            if (cottonCat == null)
            {
                cottonCat = new MaterialCategory { Id = Guid.NewGuid(), Name = "Cotton", MaterialTypeId = fabricType.Id };
                context.MaterialCategories.Add(cottonCat);
            }

            var denimCat = context.MaterialCategories.FirstOrDefault(c => c.Name == "Denim");
            if (denimCat == null)
            {
                denimCat = new MaterialCategory { Id = Guid.NewGuid(), Name = "Denim", MaterialTypeId = fabricType.Id };
                context.MaterialCategories.Add(denimCat);
            }

            var polyCat = context.MaterialCategories.FirstOrDefault(c => c.Name == "Polyester");
            if (polyCat == null)
            {
                polyCat = new MaterialCategory { Id = Guid.NewGuid(), Name = "Polyester", MaterialTypeId = fabricType.Id };
                context.MaterialCategories.Add(polyCat);
            }

            var silkCat = context.MaterialCategories.FirstOrDefault(c => c.Name == "Silk");
            if (silkCat == null)
            {
                silkCat = new MaterialCategory { Id = Guid.NewGuid(), Name = "Silk", MaterialTypeId = fabricType.Id };
                context.MaterialCategories.Add(silkCat);
            }

            var linenCat = context.MaterialCategories.FirstOrDefault(c => c.Name == "Linen");
            if (linenCat == null)
            {
                linenCat = new MaterialCategory { Id = Guid.NewGuid(), Name = "Linen", MaterialTypeId = fabricType.Id };
                context.MaterialCategories.Add(linenCat);
            }

            var trimCat = context.MaterialCategories.FirstOrDefault(c => c.Name == "Trims & Fasteners");
            if (trimCat == null)
            {
                trimCat = new MaterialCategory { Id = Guid.NewGuid(), Name = "Trims & Fasteners", MaterialTypeId = accessoryType.Id };
                context.MaterialCategories.Add(trimCat);
            }

            context.SaveChanges();

            // 2. Seed Materials
            if (context.Materials.Any())
            {
                context.MaterialInspections.RemoveRange(context.MaterialInspections);
                context.MaterialRequestItems.RemoveRange(context.MaterialRequestItems);
                context.MaterialRequests.RemoveRange(context.MaterialRequests);
                context.BillOfMaterials.RemoveRange(context.BillOfMaterials);
                context.Materials.RemoveRange(context.Materials);
                context.SaveChanges();
            }

                var freshMaterials = new List<Material>
                {
                    new Material
                    {
                        Id = Guid.NewGuid(),
                        MaterialCode = "FAB-001",
                        Name = "100% Organic Cotton (220 GSM)",
                        MaterialTypeId = fabricType.Id,
                        MaterialCategoryId = cottonCat.Id,
                        AvailableQty = 1500,
                        CostPerUnit = 180,
                        ImagePath = "/Media/images/materials/Fabric/Cotton/MAT-001.jpg",
                        CreatedAt = DateTime.UtcNow,
                        UpdatedAt = DateTime.UtcNow,
                    },
                    new Material
                    {
                        Id = Guid.NewGuid(),
                        MaterialCode = "FAB-002",
                        Name = "Heavyweight Combed Cotton (280 GSM)",
                        MaterialTypeId = fabricType.Id,
                        MaterialCategoryId = cottonCat.Id,
                        AvailableQty = 1200,
                        CostPerUnit = 220,
                        ImagePath = "/Media/images/materials/Fabric/Cotton/MAT-001.jpg",
                        CreatedAt = DateTime.UtcNow,
                        UpdatedAt = DateTime.UtcNow,
                    },
                    new Material
                    {
                        Id = Guid.NewGuid(),
                        MaterialCode = "FAB-003",
                        Name = "Raw Indigo Denim Twill (14 oz)",
                        MaterialTypeId = fabricType.Id,
                        MaterialCategoryId = denimCat.Id,
                        AvailableQty = 900,
                        CostPerUnit = 310,
                        ImagePath = "/Media/images/materials/Fabric/Denim/MAT-001.jpg",
                        CreatedAt = DateTime.UtcNow,
                        UpdatedAt = DateTime.UtcNow,
                    },
                    new Material
                    {
                        Id = Guid.NewGuid(),
                        MaterialCode = "FAB-004",
                        Name = "Washed Stretch Denim (11 oz)",
                        MaterialTypeId = fabricType.Id,
                        MaterialCategoryId = denimCat.Id,
                        AvailableQty = 1100,
                        CostPerUnit = 290,
                        ImagePath = "/Media/images/materials/Fabric/Denim/MAT-001.jpg",
                        CreatedAt = DateTime.UtcNow,
                        UpdatedAt = DateTime.UtcNow,
                    },
                    new Material
                    {
                        Id = Guid.NewGuid(),
                        MaterialCode = "FAB-005",
                        Name = "Breathable Athletic Polyester Mesh",
                        MaterialTypeId = fabricType.Id,
                        MaterialCategoryId = polyCat.Id,
                        AvailableQty = 2000,
                        CostPerUnit = 140,
                        ImagePath = "/Media/images/materials/Fabric/Polyester/MAT-001.jpg",
                        CreatedAt = DateTime.UtcNow,
                        UpdatedAt = DateTime.UtcNow,
                    },
                    new Material
                    {
                        Id = Guid.NewGuid(),
                        MaterialCode = "FAB-006",
                        Name = "Microfiber Moisture Wicking Fabric",
                        MaterialTypeId = fabricType.Id,
                        MaterialCategoryId = polyCat.Id,
                        AvailableQty = 1800,
                        CostPerUnit = 160,
                        ImagePath = "/Media/images/materials/Fabric/Polyester/MAT-001.jpg",
                        CreatedAt = DateTime.UtcNow,
                        UpdatedAt = DateTime.UtcNow,
                    },
                    new Material
                    {
                        Id = Guid.NewGuid(),
                        MaterialCode = "FAB-007",
                        Name = "Pure Mulberry Silk Satin",
                        MaterialTypeId = fabricType.Id,
                        MaterialCategoryId = silkCat.Id,
                        AvailableQty = 500,
                        CostPerUnit = 650,
                        ImagePath = "/Media/images/materials/Fabric/Silk/MAT-001.jpg",
                        CreatedAt = DateTime.UtcNow,
                        UpdatedAt = DateTime.UtcNow,
                    },
                    new Material
                    {
                        Id = Guid.NewGuid(),
                        MaterialCode = "FAB-008",
                        Name = "Premium French Linen Slub",
                        MaterialTypeId = fabricType.Id,
                        MaterialCategoryId = linenCat.Id,
                        AvailableQty = 750,
                        CostPerUnit = 380,
                        ImagePath = "/Media/images/materials/Fabric/Linen/MAT-001.jpg",
                        CreatedAt = DateTime.UtcNow,
                        UpdatedAt = DateTime.UtcNow,
                    },
                    new Material
                    {
                        Id = Guid.NewGuid(),
                        MaterialCode = "MAT-002",
                        Name = "Polyester Sewing Thread",
                        MaterialTypeId = threadType.Id,
                        MaterialCategoryId = polyCat.Id,
                        AvailableQty = 5000,
                        CostPerUnit = 25,
                        ImagePath = "/Media/images/materials/Thread/Polyester/MAT-001.jpg",
                        CreatedAt = DateTime.UtcNow,
                        UpdatedAt = DateTime.UtcNow,
                    },
                    new Material
                    {
                        Id = Guid.NewGuid(),
                        MaterialCode = "MAT-003",
                        Name = "Brass Metallic Buttons",
                        MaterialTypeId = accessoryType.Id,
                        MaterialCategoryId = trimCat.Id,
                        AvailableQty = 10000,
                        CostPerUnit = 5,
                        ImagePath = "/Media/images/materials/Accessory/Trims & Fasteners/MAT-001.jpg",
                        CreatedAt = DateTime.UtcNow,
                        UpdatedAt = DateTime.UtcNow,
                    }
                };

                context.Materials.AddRange(freshMaterials);
                context.SaveChanges();

                // 3. Seed BOMs
                if (!context.BillOfMaterials.Any())
                {
                    var boms = new List<BillOfMaterial>();
                    var allProds = context.Products.ToList();

                    if (allProds.Any())
                    {
                        foreach (var product in allProds)
                        {
                            boms.Add(new BillOfMaterial
                            {
                                Id = Guid.NewGuid(),
                                ProductId = product.Id,
                                MaterialId = freshMaterials[0].Id,
                                QtyPerUnit = 1.5m,
                                WastagePercent = 5
                            });

                            boms.Add(new BillOfMaterial
                            {
                                Id = Guid.NewGuid(),
                                ProductId = product.Id,
                                MaterialId = freshMaterials[1].Id,
                                QtyPerUnit = 0.5m,
                                WastagePercent = 2
                            });
                        }
                    }

                    context.BillOfMaterials.AddRange(boms);
                    context.SaveChanges();
                }
       
            // Seed Suppliers (3)
            var suppliers = new List<Supplier>();
            if (!context.Suppliers.Any())
            {
                suppliers = new List<Supplier>
                {
                    new Supplier
                    {
                        Id = Guid.NewGuid(),
                        SupplierCode = "SUP-001",
                        Name = "Everest Textiles Ltd",
                        ContactEmail = "contact@everesttextiles.com",
                        ContactPhone = "+977-1-4351234",
                        Address = "Balaju Industrial Area, Kathmandu",
                        Status = UserStatus.Active,
                        OnTimeDeliveryRate = 96.50m,
                        DefectRate = 1.20m,
                        Rating = 4.80m,
                        TotalOrders = 45,
                        LastEvaluatedAt = DateTime.UtcNow,
                        CreatedAt = DateTime.UtcNow.AddMonths(-12),
                        UpdatedAt = DateTime.UtcNow
                    },
                    new Supplier
                    {
                        Id = Guid.NewGuid(),
                        SupplierCode = "SUP-002",
                        Name = "Himalayan Yarns & Fabrics",
                        ContactEmail = "info@himalayanyarns.com",
                        ContactPhone = "+977-1-5524321",
                        Address = "Patan Industrial Estate, Lalitpur",
                        Status = UserStatus.Active,
                        OnTimeDeliveryRate = 92.00m,
                        DefectRate = 2.50m,
                        Rating = 4.35m,
                        TotalOrders = 30,
                        LastEvaluatedAt = DateTime.UtcNow,
                        CreatedAt = DateTime.UtcNow.AddMonths(-10),
                        UpdatedAt = DateTime.UtcNow
                    },
                    new Supplier
                    {
                        Id = Guid.NewGuid(),
                        SupplierCode = "SUP-003",
                        Name = "Nepal Accessories Pvt Ltd",
                        ContactEmail = "sales@nepalaccessories.com",
                        ContactPhone = "+977-21-523456",
                        Address = "Biratnagar Park, Morang",
                        Status = UserStatus.Active,
                        OnTimeDeliveryRate = 98.00m,
                        DefectRate = 0.80m,
                        Rating = 4.90m,
                        TotalOrders = 60,
                        LastEvaluatedAt = DateTime.UtcNow,
                        CreatedAt = DateTime.UtcNow.AddMonths(-18),
                        UpdatedAt = DateTime.UtcNow
                    }
                };
                context.Suppliers.AddRange(suppliers);
                context.SaveChanges();
            }
            else
            {
                suppliers = context.Suppliers.ToList();
            }

            // Seed SupplierMaterialCategories
            if (!context.SupplierMaterialCategories.Any() && suppliers.Any() && context.MaterialCategories.Any())
            {
                var cats = context.MaterialCategories.Take(3).ToList();
                var s1 = suppliers.First();
                var s2 = suppliers.Skip(1).FirstOrDefault() ?? s1;

                var joins = new List<SupplierMaterialCategory>();
                if (cats.Count > 0) joins.Add(new SupplierMaterialCategory { SupplierId = s1.Id, MaterialCategoryId = cats[0].Id });
                if (cats.Count > 1) joins.Add(new SupplierMaterialCategory { SupplierId = s1.Id, MaterialCategoryId = cats[1].Id });
                if (cats.Count > 2) joins.Add(new SupplierMaterialCategory { SupplierId = s2.Id, MaterialCategoryId = cats[2].Id });

                if (joins.Any())
                {
                    context.SupplierMaterialCategories.AddRange(joins);
                    context.SaveChanges();
                }
            }

            // Seed MaterialRequests
            var requests = new List<MaterialRequest>();
            if (!context.MaterialRequests.Any())
            {
                var s1 = suppliers.FirstOrDefault(s => s.Name == "Everest Textiles Ltd") ?? suppliers.FirstOrDefault();
                var s3 = suppliers.FirstOrDefault(s => s.Name == "Nepal Accessories Pvt Ltd") ?? suppliers.LastOrDefault();
                var m1 = context.Materials.FirstOrDefault();
                var m2 = context.Materials.OrderBy(m => m.Id).LastOrDefault();

                var req1 = new MaterialRequest
                {
                    Id = Guid.NewGuid(),
                    RequestNumber = "PR-20260802-001",
                    SupplierId = s1?.Id,
                    Status = MaterialRequestStatus.Draft,
                    RequiredDate = DateTime.UtcNow.AddDays(3),
                    Notes = "Shortage for upcoming production batch",
                    RequestedBy = "Warehouse Manager",
                    CreatedAt = DateTime.UtcNow,
                    CreatedBy = "Warehouse Manager",
                    UpdatedAt = DateTime.UtcNow,
                    UpdatedBy = "Warehouse Manager",
                    Items = new List<MaterialRequestItem>()
                };
                if (m1 != null) req1.Items.Add(new MaterialRequestItem { Id = Guid.NewGuid(), MaterialId = m1.Id, RequestedQuantity = 500 });

                var req2 = new MaterialRequest
                {
                    Id = Guid.NewGuid(),
                    RequestNumber = "PR-20260802-002",
                    SupplierId = s3?.Id,
                    Status = MaterialRequestStatus.Ordered,
                    RequiredDate = DateTime.UtcNow.AddDays(5),
                    Notes = "Routine raw material requisition",
                    RequestedBy = "Stock Controller",
                    CreatedAt = DateTime.UtcNow,
                    CreatedBy = "Stock Controller",
                    UpdatedAt = DateTime.UtcNow,
                    UpdatedBy = "Stock Controller",
                    Items = new List<MaterialRequestItem>()
                };
                if (m2 != null) req2.Items.Add(new MaterialRequestItem { Id = Guid.NewGuid(), MaterialId = m2.Id, RequestedQuantity = 1000 });

                requests = new List<MaterialRequest> { req1, req2 };
                context.MaterialRequests.AddRange(requests);
                context.SaveChanges();
            }
            else
            {
                requests = context.MaterialRequests.Include(r => r.Items).ToList();
            }

            // Seed MaterialIssues
            if (!context.MaterialIssues.Any())
            {
                context.MaterialIssues.AddRange(new List<MaterialIssue>
                {
                    new MaterialIssue { Id = Guid.NewGuid(), MaterialId = Guid.NewGuid().ToString(), IssueQuantity = 200, TargetDestination = "Factory Stitching Line 1", IssuedTo = "Ram Bahadur (Supervisor)", Notes = "Issued for Production Plan PP-0001", Status = "Completed", CreatedAt = DateTime.UtcNow, CreatedBy = "Ram Bahadur (Supervisor)", UpdatedAt = DateTime.UtcNow, UpdatedBy = "Ram Bahadur (Supervisor)" }
                });
            }

            // Seed MaterialInspections
            if (!context.MaterialInspections.Any() && requests.Any())
            {
                var r1 = requests.First();
                var item1 = r1.Items.FirstOrDefault();

                if (item1 != null)
                {
                    var insp1 = new MaterialInspection
                    {
                        Id = Guid.NewGuid(),
                        MaterialRequestId = r1.Id,
                        InspectionStatus = "Completed",
                        Notes = "Passed quality test",
                        InspectorName = "Suresh Quality Audit",
                        CreatedAt = DateTime.UtcNow,
                        CreatedBy = "Suresh Quality Audit",
                        UpdatedAt = DateTime.UtcNow,
                        UpdatedBy = "Suresh Quality Audit",
                        Items = new List<MaterialInspectionItem>
                        {
                            new MaterialInspectionItem
                            {
                                Id = Guid.NewGuid(),
                                MaterialId = item1.MaterialId,
                                ReceivedQuantity = item1.RequestedQuantity,
                                InspectionStatus = "Approved",
                                Notes = "Batch verified",
                                CreatedAt = DateTime.UtcNow,
                                CreatedBy = "Suresh Quality Audit",
                                UpdatedAt = DateTime.UtcNow,
                                UpdatedBy = "Suresh Quality Audit"
                            }
                        }
                    };
                    context.MaterialInspections.Add(insp1);
                    context.SaveChanges();
                }
            }

            // Seed FinishedGoodsHandovers
            if (!context.FinishedGoodsHandovers.Any())
            {
                context.FinishedGoodsHandovers.AddRange(new List<FinishedGoodsHandover>
                {
                    new FinishedGoodsHandover { Id = Guid.NewGuid(), ProductId = Guid.NewGuid().ToString(), ProductName = "Polo Shirt", SKU = "SKU-POLO-01", Quantity = 100, SourceFactoryLine = "Stitching Floor A", Location = "Central Warehouse Rack A", AcceptedBy = "Warehouse Manager", Status = "Accepted", CreatedAt = DateTime.UtcNow, CreatedBy = "Warehouse Manager", UpdatedAt = DateTime.UtcNow, UpdatedBy = "Warehouse Manager" }
                });
            }

            // Seed CustomerReturns
            if (!context.CustomerReturns.Any())
            {
                context.CustomerReturns.AddRange(new List<CustomerReturn>
                {
                    new CustomerReturn { Id = Guid.NewGuid(), OrderNumber = "ORD-0001", CustomerName = "Customer 1", ProductId = Guid.NewGuid().ToString(), ReturnedQuantity = 2, Reason = "Damaged / Defective", Notes = "Fabric seam torn on delivery", ProcessedBy = "Returns Desk", CreatedAt = DateTime.UtcNow, CreatedBy = "Returns Desk", UpdatedAt = DateTime.UtcNow, UpdatedBy = "Returns Desk" }
                });
            }

            context.SaveChanges();
        }
    }
}
