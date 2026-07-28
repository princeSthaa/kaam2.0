using Microsoft.EntityFrameworkCore;
using backend.Model;

namespace backend.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
        {
        }

        // <crudgen:dbsets>
        public DbSet<Customer> Customers { get; set; } = null!;
        public DbSet<Order> Orders { get; set; } = null!;
        public DbSet<OrderItem> OrderItems { get; set; } = null!;
        public DbSet<OrderItemSize> OrderItemSizes { get; set; } = null!;
        public DbSet<OrderItemMaterial> OrderItemMaterials { get; set; } = null!;
        public DbSet<Product> Products { get; set; } = null!;
        public DbSet<WorkCenter> WorkCenters { get; set; } = null!;
        public DbSet<ProductionPlan> ProductionPlans { get; set; } = null!;
        public DbSet<ProductionPlanProduct> ProductionPlanProducts { get; set; } = null!;
        public DbSet<ProductionPlanProductSize> ProductionPlanProductSizes { get; set; } = null!;
        public DbSet<ProductionPlanStage> ProductionPlanStages { get; set; } = null!;
        public DbSet<MaterialType> MaterialTypes { get; set; } = null!;
        public DbSet<MaterialCategory> MaterialCategories { get; set; } = null!;
        public DbSet<Material> Materials { get; set; } = null!;
        public DbSet<BillOfMaterial> BillOfMaterials { get; set; } = null!;
        public DbSet<Warehouse> Warehouses { get; set; } = null!;
        public DbSet<WarehouseRoom> WarehouseRooms { get; set; } = null!;
        public DbSet<WarehouseShelf> WarehouseShelfs { get; set; } = null!;
        public DbSet<Inventory> Inventories { get; set; } = null!;
        public DbSet<Outlet> Outlets { get; set; } = null!;
        public DbSet<OutletDemand> OutletDemands { get; set; } = null!;
        public DbSet<Transaction> Transactions { get; set; } = null!;
        public DbSet<ActivityLog> ActivityLogs { get; set; } = null!;
        public DbSet<MaterialRequest> MaterialRequests { get; set; } = null!;
        public DbSet<MaterialIssue> MaterialIssues { get; set; } = null!;
        public DbSet<MaterialInspection> MaterialInspections { get; set; } = null!;
        public DbSet<FinishedGoodsHandover> FinishedGoodsHandovers { get; set; } = null!;
        public DbSet<CustomerReturn> CustomerReturns { get; set; } = null!;
        // </crudgen:dbsets>

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            modelBuilder.Entity<Material>()
                .HasOne(e => e.MaterialType)
                .WithMany()
                .HasForeignKey(e => e.MaterialTypeId)
                .OnDelete(DeleteBehavior.Restrict)
                .HasConstraintName("FK_Materials_MaterialTypes_MaterialTypeId");

            modelBuilder.Entity<Material>()
                .HasOne(e => e.MaterialCategory)
                .WithMany(e => e.Materials)
                .HasForeignKey(e => e.MaterialCategoryId)
                .OnDelete(DeleteBehavior.Restrict)
                .HasConstraintName("FK_Materials_MaterialCategories_MaterialCategoryId");

            // <crudgen:modelbuilder>
            modelBuilder.Entity<Order>()
                .HasOne(e => e.Customer)
                .WithMany(p => p.Orders)
                .HasForeignKey(e => e.CustomerId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<OrderItem>()
                .HasOne(e => e.Product)
                .WithMany()
                .HasForeignKey(e => e.ProductId)
                .OnDelete(DeleteBehavior.Restrict);
            modelBuilder.Entity<OrderItem>()
                .HasOne(e => e.Order)
                .WithMany(p => p.OrderItems)
                .HasForeignKey(e => e.OrderId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<OrderItemSize>()
                .HasOne(e => e.OrderItem)
                .WithMany(p => p.OrderItemSizes)
                .HasForeignKey(e => e.OrderItemId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<OrderItemMaterial>()
                .HasOne(e => e.Material)
                .WithMany()
                .HasForeignKey(e => e.MaterialId)
                .OnDelete(DeleteBehavior.Restrict);
            modelBuilder.Entity<OrderItemMaterial>()
                .HasOne(e => e.OrderItem)
                .WithMany(p => p.OrderItemMaterials)
                .HasForeignKey(e => e.OrderItemId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<Order>()
                .HasOne(e => e.ProductionPlan)
                .WithMany(p => p.SourceOrders)
                .HasForeignKey(e => e.ProductionPlanId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<ProductionPlanProduct>()
                .HasOne(e => e.ProductionPlan)
                .WithMany(p => p.ProductionPlanProducts)
                .HasForeignKey(e => e.ProductionPlanId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<ProductionPlanProductSize>()
                .HasOne(e => e.ProductionPlanProduct)
                .WithMany(p => p.ProductionPlanProductSizes)
                .HasForeignKey(e => e.ProductionPlanProductId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<ProductionPlanStage>()
                .HasOne(e => e.WorkCenter)
                .WithMany()
                .HasForeignKey(e => e.WorkCenterId)
                .OnDelete(DeleteBehavior.Restrict);
            modelBuilder.Entity<ProductionPlanStage>()
                .HasOne(e => e.ProductionPlan)
                .WithMany(p => p.ProductionPlanStages)
                .HasForeignKey(e => e.ProductionPlanId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<MaterialCategory>()
                .HasOne(e => e.MaterialType)
                .WithMany(p => p.MaterialCategories)
                .HasForeignKey(e => e.MaterialTypeId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<BillOfMaterial>()
                .HasOne(e => e.Product)
                .WithMany()
                .HasForeignKey(e => e.ProductId)
                .OnDelete(DeleteBehavior.Restrict);
            modelBuilder.Entity<BillOfMaterial>()
                .HasOne(e => e.Material)
                .WithMany()
                .HasForeignKey(e => e.MaterialId)
                .OnDelete(DeleteBehavior.Restrict);
            modelBuilder.Entity<WarehouseRoom>()
                .HasOne(e => e.Warehouse)
                .WithMany(p => p.WarehouseRooms)
                .HasForeignKey(e => e.WarehouseId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<WarehouseShelf>()
                .HasOne(e => e.WarehouseRoom)
                .WithMany(p => p.WarehouseShelfs)
                .HasForeignKey(e => e.WarehouseRoomId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<OutletDemand>()
                .HasOne(e => e.Outlet)
                .WithMany(p => p.OutletDemands)
                .HasForeignKey(e => e.OutletId)
                .OnDelete(DeleteBehavior.Cascade);

            // </crudgen:modelbuilder>
        }
    }
}
