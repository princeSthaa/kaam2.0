using backend.Data;
using Microsoft.EntityFrameworkCore;
using System.Text.Json.Serialization;
using backend.Service.Customer;
using backend.Service.Order;
using backend.Service.OrderItem;
using backend.Service.Product;
using backend.Service.WorkCenter;
using backend.Service.ProductionPlan;
using backend.Service.ProductionPlanProduct;
using backend.Service.ProductionPlanProductSize;
using backend.Service.ProductionPlanStage;
using backend.Service.Material;
using backend.Service.BillOfMaterial;
using backend.Service.Warehouse;
using backend.Service.WarehouseRoom;
using backend.Service.WarehouseShelf;
using backend.Service.Inventory;
using backend.Service.Outlet;
using backend.Service.OutletDemand;
using backend.Service.Transaction;
using backend.Service.ActivityLog;
using backend.Service.Supplier;
using backend.Service.MaterialRequest;
using backend.Service.MaterialInspection;
using backend.Service.MaterialCategory;
using backend.Service.MaterialType;
using backend.Service.ProductionStage;
using backend.Service.ProductCategory;

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
    options.UseSqlServer(
        builder.Configuration.GetConnectionString("DefaultConnection")
    ));

// Register Services
builder.Services.AddScoped<ICustomerService, CustomerService>();
builder.Services.AddScoped<IOrderService, OrderService>();
builder.Services.AddScoped<IOrderItemService, OrderItemService>();
builder.Services.AddScoped<IProductService, ProductService>();
builder.Services.AddScoped<IWorkCenterService, WorkCenterService>();
builder.Services.AddScoped<IProductionPlanService, ProductionPlanService>();
builder.Services.AddScoped<IProductionPlanProductService, ProductionPlanProductService>();
builder.Services.AddScoped<IProductionPlanProductSizeService, ProductionPlanProductSizeService>();
builder.Services.AddScoped<IProductionPlanStageService, ProductionPlanStageService>();
builder.Services.AddScoped<IMaterialService, MaterialService>();
builder.Services.AddScoped<IBillOfMaterialService, BillOfMaterialService>();
builder.Services.AddScoped<IWarehouseService, WarehouseService>();
builder.Services.AddScoped<IWarehouseRoomService, WarehouseRoomService>();
builder.Services.AddScoped<IWarehouseShelfService, WarehouseShelfService>();
builder.Services.AddScoped<IInventoryService, InventoryService>();
builder.Services.AddScoped<IOutletService, OutletService>();
builder.Services.AddScoped<IOutletDemandService, OutletDemandService>();
builder.Services.AddScoped<ITransactionService, TransactionService>();
builder.Services.AddScoped<IActivityLogService, ActivityLogService>();
builder.Services.AddScoped<ISupplierService, SupplierService>();
builder.Services.AddScoped<IMaterialRequestService, MaterialRequestService>();
builder.Services.AddScoped<IMaterialInspectionService, MaterialInspectionService>();
builder.Services.AddScoped<IMaterialCategoryService, MaterialCategoryService>();
builder.Services.AddScoped<IMaterialTypeService, MaterialTypeService>();
builder.Services.AddScoped<IProductionStageService, ProductionStageService>();
builder.Services.AddScoped<IProductCategoryService, ProductCategoryService>();

var app = builder.Build();

using (var scope = app.Services.CreateScope())
{
    try
    {
        var context = scope.ServiceProvider.GetRequiredService<AppDbContext>();
        SqlScriptRunner.Run(context);
        DatabaseSeeder.Seed(context);
    }
    catch (Exception ex)
    {
        Console.WriteLine($"Database initialization error: {ex.Message}");
    }
}

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

// app.UseHttpsRedirection();
app.UseCors("AllowNextJs");

app.UseStaticFiles();

var mediaDir = Path.Combine(builder.Environment.ContentRootPath, "Media");
if (!Directory.Exists(mediaDir)) Directory.CreateDirectory(mediaDir);

var materialsDir = Path.Combine(mediaDir, "images", "materials");
if (Directory.Exists(materialsDir))
{
    app.UseStaticFiles(new StaticFileOptions
    {
        FileProvider = new Microsoft.Extensions.FileProviders.PhysicalFileProvider(materialsDir),
        RequestPath = "/Media"
    });
}

app.UseStaticFiles(new StaticFileOptions
{
    FileProvider = new Microsoft.Extensions.FileProviders.PhysicalFileProvider(mediaDir),
    RequestPath = "/Media"
});

app.MapControllers();

app.Run();
