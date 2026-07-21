import json
import os

with open(r'D:\kaam2.0\backend\generator.json', 'r') as f:
    data = json.load(f)

entities = [e['Name'] for e in data['Entities']]

registrations = "\n".join([f'builder.Services.AddScoped<backend.Service.{e}.I{e}Service, backend.Service.{e}.{e}Service>();' for e in entities])

program_cs = f"""using backend.Models;
using backend.Data;
using backend.Model;
using Microsoft.EntityFrameworkCore;
using System.Text.Json.Serialization;

var builder = WebApplication.CreateBuilder(args);

// Add CORS policies to allow Next.js frontend
builder.Services.AddCors(options =>
{{
    options.AddPolicy("AllowNextJs",
        policy => policy
            .WithOrigins("http://localhost:3000", "http://127.0.0.1:3000", "http://localhost:3001", "http://127.0.0.1:3001") // Frontend origins
            .AllowAnyHeader()
            .AllowAnyMethod());
}});

builder.Services.AddControllers().AddJsonOptions(options =>
{{
    options.JsonSerializerOptions.ReferenceHandler = ReferenceHandler.IgnoreCycles;
    options.JsonSerializerOptions.Converters.Add(new JsonStringEnumConverter());
}});

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// Configure EF Core In-Memory Database
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseInMemoryDatabase("Kaam2Database"));

// Register Services
{registrations}

var app = builder.Build();

// Seed Database
using (var scope = app.Services.CreateScope())
{{
    var dbContext = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    dbContext.Database.EnsureCreated();
    backend.Data.DatabaseSeeder.Seed(dbContext);
}}

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{{
    app.UseSwagger();
    app.UseSwaggerUI();
}}

app.UseHttpsRedirection();
app.UseCors("AllowNextJs");

app.MapControllers();

app.Run();
"""

with open(r'D:\kaam2.0\backend\Program.cs', 'w') as f:
    f.write(program_cs)

print("Program.cs generated successfully.")
