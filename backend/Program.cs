using backend.Data;
using backend.Model;
using Microsoft.EntityFrameworkCore;
using System.Text.Json.Serialization;

var builder = WebApplication.CreateBuilder(args);

// Add CORS policies to allow Next.js frontend
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowNextJs",
        policy => policy
            .WithOrigins("http://localhost:3000", "http://127.0.0.1:3000", "http://localhost:3001", "http://127.0.0.1:3001") // Frontend origins
            .AllowAnyHeader()
            .AllowAnyMethod());
});

builder.Services.AddControllers().AddJsonOptions(options =>
{
    options.JsonSerializerOptions.ReferenceHandler = ReferenceHandler.IgnoreCycles;
    options.JsonSerializerOptions.Converters.Add(new JsonStringEnumConverter());
});

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// Configure EF Core SQL Server Database
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlServer("Server=(localdb)\\MSSQLLocalDB;Database=Kaam2Db;Trusted_Connection=True;MultipleActiveResultSets=true"));

// Register Services
builder.Services.AddScoped<backend.Service.Customer.ICustomerService, backend.Service.Customer.CustomerService>();
builder.Services.AddScoped<backend.Service.Order.IOrderService, backend.Service.Order.OrderService>();
builder.Services.AddScoped<backend.Service.OrderItem.IOrderItemService, backend.Service.OrderItem.OrderItemService>();
builder.Services.AddScoped<backend.Service.Product.IProductService, backend.Service.Product.ProductService>();
builder.Services.AddScoped<backend.Service.Fabric.IFabricService, backend.Service.Fabric.FabricService>();
builder.Services.AddScoped<backend.Service.WorkCenter.IWorkCenterService, backend.Service.WorkCenter.WorkCenterService>();
builder.Services.AddScoped<backend.Service.ProductionPlan.IProductionPlanService, backend.Service.ProductionPlan.ProductionPlanService>();
builder.Services.AddScoped<backend.Service.ProductionPlanProduct.IProductionPlanProductService, backend.Service.ProductionPlanProduct.ProductionPlanProductService>();
builder.Services.AddScoped<backend.Service.ProductionPlanProductSize.IProductionPlanProductSizeService, backend.Service.ProductionPlanProductSize.ProductionPlanProductSizeService>();
builder.Services.AddScoped<backend.Service.ProductionPlanStage.IProductionPlanStageService, backend.Service.ProductionPlanStage.ProductionPlanStageService>();
builder.Services.AddScoped<backend.Service.Material.IMaterialService, backend.Service.Material.MaterialService>();
builder.Services.AddScoped<backend.Service.BillOfMaterial.IBillOfMaterialService, backend.Service.BillOfMaterial.BillOfMaterialService>();
builder.Services.AddScoped<backend.Service.Warehouse.IWarehouseService, backend.Service.Warehouse.WarehouseService>();
builder.Services.AddScoped<backend.Service.WarehouseRoom.IWarehouseRoomService, backend.Service.WarehouseRoom.WarehouseRoomService>();
builder.Services.AddScoped<backend.Service.WarehouseShelf.IWarehouseShelfService, backend.Service.WarehouseShelf.WarehouseShelfService>();
builder.Services.AddScoped<backend.Service.Inventory.IInventoryService, backend.Service.Inventory.InventoryService>();
builder.Services.AddScoped<backend.Service.Outlet.IOutletService, backend.Service.Outlet.OutletService>();
builder.Services.AddScoped<backend.Service.OutletDemand.IOutletDemandService, backend.Service.OutletDemand.OutletDemandService>();
builder.Services.AddScoped<backend.Service.Transaction.ITransactionService, backend.Service.Transaction.TransactionService>();
builder.Services.AddScoped<backend.Service.ActivityLog.IActivityLogService, backend.Service.ActivityLog.ActivityLogService>();

var app = builder.Build();

// Seed Database
using (var scope = app.Services.CreateScope())
{
    var dbContext = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    dbContext.Database.EnsureCreated();
    try
    {
        dbContext.Database.ExecuteSqlRaw("IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('WorkCenters') AND name = 'ProductionLine') ALTER TABLE WorkCenters ADD ProductionLine NVARCHAR(MAX) NULL;");
        dbContext.Database.ExecuteSqlRaw("UPDATE WorkCenters SET ProductionLine = '' WHERE ProductionLine IS NULL;");
    }
    catch (Exception ex)
    {
        Console.WriteLine($"Migration note: {ex.Message}");
    }
    
    // Execute all Stored Procedure scripts from Sql directory
    var sqlDir = Path.Combine(Directory.GetCurrentDirectory(), "Sql");
    if (Directory.Exists(sqlDir))
    {
        foreach (var file in Directory.GetFiles(sqlDir, "*.sql"))
        {
            try
            {
                var sql = File.ReadAllText(file);
                // Split by GO since EF doesn't support GO batches directly
                var batches = sql.Split(new[] { "GO\r\n", "GO\n", "GO " }, StringSplitOptions.RemoveEmptyEntries);
                foreach (var batch in batches)
                {
                    if (!string.IsNullOrWhiteSpace(batch))
                    {
                        dbContext.Database.ExecuteSqlRaw(batch);
                    }
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error executing {file}: {ex.Message}");
            }
        }
    }

    backend.Data.DatabaseSeeder.Seed(dbContext);
}

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();
app.UseCors("AllowNextJs");

app.MapControllers();

app.Run();
