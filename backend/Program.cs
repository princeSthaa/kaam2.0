using backend.Models;
using backend.Data;

var builder = WebApplication.CreateBuilder(args);

// Add CORS policies to allow Next.js frontend
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowNextJs",
        policy => policy
            .WithOrigins("http://localhost:3000", "http://127.0.0.1:3000") // Frontend origin
            .AllowAnyHeader()
            .AllowAnyMethod());
});

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// Register the JSON Repositories as Singletons so memory state is shared
builder.Services.AddSingleton(new JsonRepository<Customer>("customers.json"));
builder.Services.AddSingleton(new JsonRepository<Order>("orders.json"));
builder.Services.AddSingleton(new JsonRepository<Product>("products.json"));
builder.Services.AddSingleton(new JsonRepository<Fabric>("fabrics.json"));

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();
app.UseCors("AllowNextJs");

// --- API Endpoints ---

// Customers
app.MapGet("/api/customers", (JsonRepository<Customer> repo) => Results.Ok(repo.GetAll()))
   .WithName("GetCustomers").WithOpenApi();

app.MapGet("/api/customers/{id:guid}", (Guid id, JsonRepository<Customer> repo) => 
{
    var customer = repo.GetById(id);
    return customer is null ? Results.NotFound() : Results.Ok(customer);
});

app.MapPost("/api/customers", (Customer customer, JsonRepository<Customer> repo) =>
{
    var created = repo.Add(customer);
    return Results.Created($"/api/customers/{created.Id}", created);
});

app.MapPut("/api/customers/{id:guid}", (Guid id, Customer customer, JsonRepository<Customer> repo) =>
{
    customer.Id = id;
    var updated = repo.Update(customer);
    return updated is null ? Results.NotFound() : Results.Ok(updated);
});

app.MapDelete("/api/customers/{id:guid}", (Guid id, JsonRepository<Customer> repo) =>
{
    return repo.Delete(id) ? Results.NoContent() : Results.NotFound();
});

// Orders
app.MapGet("/api/orders", (JsonRepository<Order> repo) => Results.Ok(repo.GetAll()))
   .WithName("GetOrders").WithOpenApi();

app.MapGet("/api/orders/{id:guid}", (Guid id, JsonRepository<Order> repo) => 
{
    var order = repo.GetById(id);
    return order is null ? Results.NotFound() : Results.Ok(order);
});

app.MapPost("/api/orders", (Order order, JsonRepository<Order> repo) =>
{
    var created = repo.Add(order);
    return Results.Created($"/api/orders/{created.Id}", created);
});

app.MapPut("/api/orders/{id:guid}", (Guid id, Order order, JsonRepository<Order> repo) =>
{
    order.Id = id;
    var updated = repo.Update(order);
    return updated is null ? Results.NotFound() : Results.Ok(updated);
});

app.MapGet("/api/products", (JsonRepository<Product> repo) =>
{
    var products = repo.GetAll();
    if (!products.Any())
    {
        // Seed some data if empty
        repo.Add(new Product { Name = "Track Suit V2", Sizes = new List<string> { "XS", "S", "M", "L", "XL" } });
        repo.Add(new Product { Name = "School Uniform Shirt", Sizes = new List<string> { "S", "M", "L" } });
        repo.Add(new Product { Name = "Winter Jacket", Sizes = new List<string> { "M", "L", "XL", "XXL" } });
        products = repo.GetAll();
    }
    return Results.Ok(products);
});

app.MapGet("/api/fabrics", (JsonRepository<Fabric> repo) =>
{
    var fabrics = repo.GetAll();
    if (!fabrics.Any())
    {
        // Seed some data if empty
        repo.Add(new Fabric { Name = "Cotton Blend", Category = "Cotton" });
        repo.Add(new Fabric { Name = "Polyester Mesh", Category = "Synthetics" });
        repo.Add(new Fabric { Name = "Fleece", Category = "Winter" });
        fabrics = repo.GetAll();
    }
    return Results.Ok(fabrics);
});

app.MapDelete("/api/orders/{id:guid}", (Guid id, JsonRepository<Order> repo) =>
{
    return repo.Delete(id) ? Results.NoContent() : Results.NotFound();
});

app.Run();
