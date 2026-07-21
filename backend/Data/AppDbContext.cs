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
        public DbSet<Product> Products { get; set; } = null!;
        public DbSet<Fabric> Fabrics { get; set; } = null!;
        public DbSet<WorkCenter> WorkCenters { get; set; } = null!;
        public DbSet<ProductionPlan> ProductionPlans { get; set; } = null!;
        public DbSet<ProductionPlanProduct> ProductionPlanProducts { get; set; } = null!;
        public DbSet<ProductionPlanProductSize> ProductionPlanProductSizes { get; set; } = null!;
        public DbSet<ProductionPlanStage> ProductionPlanStages { get; set; } = null!;
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
        // </crudgen:dbsets>

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);
            
            // <crudgen:modelbuilder>
            modelBuilder.Entity<Customer>().HasKey(e => e.Id);
            modelBuilder.Entity<Customer>().Property(e => e.Name).IsRequired();
            modelBuilder.Entity<Customer>().Property(e => e.Email).IsRequired();
            modelBuilder.Entity<Customer>().Property(e => e.Phone).IsRequired();
            modelBuilder.Entity<Customer>().Property(e => e.Address).IsRequired();
            modelBuilder.Entity<Customer>().Property(e => e.Type).IsRequired();
            modelBuilder.Entity<Customer>().Property(e => e.CreatedAt).IsRequired();

            modelBuilder.Entity<Order>().HasKey(e => e.Id);
            modelBuilder.Entity<Order>().Property(e => e.CreatedAt).IsRequired();
            modelBuilder.Entity<Order>().HasOne(e => e.Customer).WithMany(p => p.Orders).HasForeignKey(e => e.CustomerId).OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<OrderItem>().HasKey(e => e.Id);
            modelBuilder.Entity<OrderItem>().HasOne(e => e.Product).WithMany().HasForeignKey(e => e.ProductId).OnDelete(DeleteBehavior.Restrict);
            modelBuilder.Entity<OrderItem>().HasOne(e => e.Fabric).WithMany().HasForeignKey(e => e.FabricId).OnDelete(DeleteBehavior.Restrict);
            modelBuilder.Entity<OrderItem>().Property(e => e.CreatedAt).IsRequired();
            modelBuilder.Entity<OrderItem>().HasOne(e => e.Order).WithMany(p => p.OrderItems).HasForeignKey(e => e.OrderId).OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<Product>().HasKey(e => e.Id);
            modelBuilder.Entity<Product>().Property(e => e.Name).IsRequired();
            modelBuilder.Entity<Product>().Property(e => e.CreatedAt).IsRequired();

            modelBuilder.Entity<Fabric>().HasKey(e => e.Id);
            modelBuilder.Entity<Fabric>().Property(e => e.Name).IsRequired();
            modelBuilder.Entity<Fabric>().Property(e => e.CreatedAt).IsRequired();

            modelBuilder.Entity<WorkCenter>().HasKey(e => e.Id);
            modelBuilder.Entity<WorkCenter>().Property(e => e.Name).IsRequired();
            modelBuilder.Entity<WorkCenter>().Property(e => e.CreatedAt).IsRequired();

            modelBuilder.Entity<ProductionPlan>().HasKey(e => e.Id);
            modelBuilder.Entity<ProductionPlan>().Property(e => e.PlanId).IsRequired();
            modelBuilder.Entity<ProductionPlan>().Property(e => e.CreatedAt).IsRequired();

            modelBuilder.Entity<ProductionPlanProduct>().HasKey(e => e.Id);
            modelBuilder.Entity<ProductionPlanProduct>().Property(e => e.CreatedAt).IsRequired();
            modelBuilder.Entity<ProductionPlanProduct>().HasOne(e => e.ProductionPlan).WithMany(p => p.ProductionPlanProducts).HasForeignKey(e => e.ProductionPlanId).OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<ProductionPlanProductSize>().HasKey(e => e.Id);
            modelBuilder.Entity<ProductionPlanProductSize>().Property(e => e.CreatedAt).IsRequired();
            modelBuilder.Entity<ProductionPlanProductSize>().Property(e => e.Size).HasConversion<string>();
            modelBuilder.Entity<ProductionPlanProductSize>().HasOne(e => e.ProductionPlanProduct).WithMany(p => p.ProductionPlanProductSizes).HasForeignKey(e => e.ProductionPlanProductId).OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<ProductionPlanStage>().HasKey(e => e.Id);
            modelBuilder.Entity<ProductionPlanStage>().HasOne(e => e.WorkCenter).WithMany().HasForeignKey(e => e.WorkCenterId).OnDelete(DeleteBehavior.Restrict);
            modelBuilder.Entity<ProductionPlanStage>().Property(e => e.CreatedAt).IsRequired();
            modelBuilder.Entity<ProductionPlanStage>().HasOne(e => e.ProductionPlan).WithMany(p => p.ProductionPlanStages).HasForeignKey(e => e.ProductionPlanId).OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<Material>().HasKey(e => e.Id);
            modelBuilder.Entity<Material>().Property(e => e.MaterialCode).IsRequired();
            modelBuilder.Entity<Material>().Property(e => e.Name).IsRequired();
            modelBuilder.Entity<Material>().Property(e => e.CreatedAt).IsRequired();

            modelBuilder.Entity<BillOfMaterial>().HasKey(e => e.Id);
            modelBuilder.Entity<BillOfMaterial>().HasOne(e => e.Product).WithMany().HasForeignKey(e => e.ProductId).OnDelete(DeleteBehavior.Restrict);
            modelBuilder.Entity<BillOfMaterial>().HasOne(e => e.Material).WithMany().HasForeignKey(e => e.MaterialId).OnDelete(DeleteBehavior.Restrict);
            modelBuilder.Entity<BillOfMaterial>().Property(e => e.CreatedAt).IsRequired();

            modelBuilder.Entity<Warehouse>().HasKey(e => e.Id);
            modelBuilder.Entity<Warehouse>().Property(e => e.Code).IsRequired();
            modelBuilder.Entity<Warehouse>().Property(e => e.Name).IsRequired();
            modelBuilder.Entity<Warehouse>().Property(e => e.CreatedAt).IsRequired();

            modelBuilder.Entity<WarehouseRoom>().HasKey(e => e.Id);
            modelBuilder.Entity<WarehouseRoom>().Property(e => e.Name).IsRequired();
            modelBuilder.Entity<WarehouseRoom>().Property(e => e.CreatedAt).IsRequired();
            modelBuilder.Entity<WarehouseRoom>().HasOne(e => e.Warehouse).WithMany(p => p.WarehouseRooms).HasForeignKey(e => e.WarehouseId).OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<WarehouseShelf>().HasKey(e => e.Id);
            modelBuilder.Entity<WarehouseShelf>().Property(e => e.Code).IsRequired();
            modelBuilder.Entity<WarehouseShelf>().Property(e => e.CreatedAt).IsRequired();
            modelBuilder.Entity<WarehouseShelf>().HasOne(e => e.WarehouseRoom).WithMany(p => p.WarehouseShelfs).HasForeignKey(e => e.WarehouseRoomId).OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<Inventory>().HasKey(e => e.Id);
            modelBuilder.Entity<Inventory>().Property(e => e.SKU).IsRequired();
            modelBuilder.Entity<Inventory>().Property(e => e.ItemName).IsRequired();
            modelBuilder.Entity<Inventory>().Property(e => e.CreatedAt).IsRequired();

            modelBuilder.Entity<Outlet>().HasKey(e => e.Id);
            modelBuilder.Entity<Outlet>().Property(e => e.Name).IsRequired();
            modelBuilder.Entity<Outlet>().Property(e => e.CreatedAt).IsRequired();

            modelBuilder.Entity<OutletDemand>().HasKey(e => e.Id);
            modelBuilder.Entity<OutletDemand>().Property(e => e.DemandNumber).IsRequired();
            modelBuilder.Entity<OutletDemand>().Property(e => e.CreatedAt).IsRequired();
            modelBuilder.Entity<OutletDemand>().HasOne(e => e.Outlet).WithMany(p => p.OutletDemands).HasForeignKey(e => e.OutletId).OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<Transaction>().HasKey(e => e.Id);
            modelBuilder.Entity<Transaction>().Property(e => e.Timestamp).IsRequired();
            modelBuilder.Entity<Transaction>().Property(e => e.CreatedAt).IsRequired();

            modelBuilder.Entity<ActivityLog>().HasKey(e => e.Id);
            modelBuilder.Entity<ActivityLog>().Property(e => e.Title).IsRequired();
            modelBuilder.Entity<ActivityLog>().Property(e => e.CreatedAt).IsRequired();

            // </crudgen:modelbuilder>
        }
    }
}
