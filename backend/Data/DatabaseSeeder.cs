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
            if (context.Customers.Any()) return; // Already seeded

            // Seed Customers (25)
            var customers = new List<Customer>();
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

            // Seed Products (25)
            var products = new List<Product>();
            for (int i = 1; i <= 25; i++)
            {
                products.Add(new Product
                {
                    Id = Guid.NewGuid().ToString(),
                    Name = $"Product {i}",
                    ImagePath = "default.png"
                });
            }
            context.Products.AddRange(products);

            // Seed Fabrics (25)
            var fabrics = new List<Fabric>();
            for (int i = 1; i <= 25; i++)
            {
                fabrics.Add(new Fabric
                {
                    Id = Guid.NewGuid().ToString(),
                    Name = $"Fabric {i}",
                    Category = "Cotton",
                    ImagePath = "fabric.png",
                    UnitPrice = 100 + i
                });
            }
            context.Fabrics.AddRange(fabrics);

            // Seed Orders (25)
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

            // Seed WorkCenters (5)
            var workCenters = new List<WorkCenter>();
            for (int i = 1; i <= 5; i++)
            {
                workCenters.Add(new WorkCenter
                {
                    Id = Guid.NewGuid().ToString(),
                    Name = $"Work Center {i}",
                    Type = "Manufacturing",
                    Status = "Active"
                });
            }
            context.WorkCenters.AddRange(workCenters);

            // Seed Warehouses (2)
            var warehouses = new List<Warehouse>
            {
                new Warehouse { Id = Guid.NewGuid().ToString(), Code = "WH-01", Name = "Central Warehouse", Location = "Kathmandu" },
                new Warehouse { Id = Guid.NewGuid().ToString(), Code = "WH-02", Name = "Regional Warehouse", Location = "Pokhara" }
            };
            context.Warehouses.AddRange(warehouses);

            // Seed Production Plans (25)
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
    }
}
