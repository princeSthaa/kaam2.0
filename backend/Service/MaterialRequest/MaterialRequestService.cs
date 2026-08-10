using Dapper;
using Microsoft.EntityFrameworkCore;
using backend.Data;
using backend.Dto.MaterialRequest;
using backend.Dto.Supplier;
using backend.Dto.Material;
using backend.Model.Enums;
using backend.Model;

namespace backend.Service.MaterialRequest
{
    public class MaterialRequestService : IMaterialRequestService
    {
        private readonly AppDbContext _context;

        public MaterialRequestService(AppDbContext context)
        {
            _context = context;
        }

        public async Task<List<MaterialRequestDto>> GetAllAsync(
            Guid? id = null,
            Guid? supplierId = null,
            string? status = null,
            string? requestNumber = null
        )
        {
            var connection = _context.Database.GetDbConnection();
            var parameters = new Dapper.DynamicParameters();
            parameters.Add("@Id", id);

            using var multi = await connection.QueryMultipleAsync(
                "sp_GetMaterialRequests",
                parameters,
                commandType: System.Data.CommandType.StoredProcedure
            );

            var requests = (await multi.ReadAsync<MaterialRequestDto>()).ToList();
            var items = (await multi.ReadAsync<MaterialRequestItemDto>()).ToList();

            foreach (var r in requests)
            {
                r.Items = items.Where(i => i.MaterialRequestId == r.Id).ToList();
            }

            // Filtering done in memory

            if (supplierId.HasValue) requests = requests.Where(r => r.SupplierId == supplierId.Value).ToList();
            if (!string.IsNullOrWhiteSpace(status) && Enum.TryParse<backend.Model.Enums.MaterialRequestStatus>(status, true, out var parsedStatus)) requests = requests.Where(r => r.Status == parsedStatus).ToList();
            if (!string.IsNullOrWhiteSpace(requestNumber)) requests = requests.Where(r => r.RequestNumber == requestNumber).ToList();
            return requests;
        }

        public async Task<MaterialRequestDto?> GetByIdAsync(Guid id)
        {
            var results = await GetAllAsync(id: id);
            return results.FirstOrDefault();
        }

        public async Task<MaterialRequestDto> CreateAsync(CreateMaterialRequestDto dto)
        {
            if (dto.Items == null || !dto.Items.Any())
            {
                throw new InvalidOperationException("A material request must contain at least one material item.");
            }

            // 1. Supplier Category Validation
            if (dto.SupplierId.HasValue)
            {
                var supplier = await _context.Suppliers.FindAsync(dto.SupplierId.Value);
                if (supplier == null)
                {
                    throw new InvalidOperationException("Selected supplier does not exist.");
                }

                var allowedCategoryIds = await _context.SupplierMaterialCategories
                    .Where(smc => smc.SupplierId == dto.SupplierId.Value)
                    .Select(smc => smc.MaterialCategoryId)
                    .ToListAsync();

                foreach (var item in dto.Items)
                {
                    var material = await _context.Materials.FindAsync(item.MaterialId);
                    if (material == null)
                    {
                        throw new InvalidOperationException($"Material ID {item.MaterialId} was not found.");
                    }

                    if (material.MaterialCategoryId.HasValue && !allowedCategoryIds.Contains(material.MaterialCategoryId.Value))
                    {
                        throw new InvalidOperationException($"Supplier '{supplier.Name}' does not supply the material category for '{material.Name}'.");
                    }
                }
            }

            // 2. Generate Request Number
            var requestNumber = $"PR-{DateTime.UtcNow:yyyyMMdd}-{new Random().Next(100, 999)}";

            var entity = new backend.Model.MaterialRequest
            {
                Id = Guid.NewGuid(),
                RequestNumber = requestNumber,
                SupplierId = dto.SupplierId,
                Status = dto.Status,
                RequiredDate = dto.RequiredDate == default ? DateTime.UtcNow.AddDays(7) : dto.RequiredDate,
                Notes = dto.Notes ?? string.Empty,
                RequestedBy = dto.RequestedBy ?? string.Empty,
                CreatedAt = DateTime.UtcNow,
                CreatedBy = dto.RequestedBy ?? string.Empty,
                UpdatedAt = DateTime.UtcNow,
                UpdatedBy = dto.RequestedBy ?? string.Empty,
                Items = dto.Items.Select(i => new MaterialRequestItem
                {
                    Id = Guid.NewGuid(),
                    MaterialId = i.MaterialId,
                    RequestedQuantity = i.RequestedQuantity
                }).ToList()
            };

            // 3. Auto-Stock Inflow and Inspection Creation if Created directly with 'Received' Status
            if (entity.Status == MaterialRequestStatus.Received)
            {
                foreach (var item in entity.Items)
                {
                    var inventory = await _context.Inventories
                        .FirstOrDefaultAsync(i => i.MaterialId == item.MaterialId && i.WarehouseShelfId == null);

                    if (inventory == null)
                    {
                        inventory = new backend.Model.Inventory
                        {
                            Id = Guid.NewGuid(),
                            MaterialId = item.MaterialId,
                            Quantity = item.RequestedQuantity,
                            WarehouseShelfId = null,
                            Status = "Staging",
                            CreatedAt = DateTime.UtcNow,
                            UpdatedAt = DateTime.UtcNow
                        };
                        _context.Inventories.Add(inventory);
                    }
                    else
                    {
                        inventory.Quantity += item.RequestedQuantity;
                        inventory.UpdatedAt = DateTime.UtcNow;
                    }
                }
            }

            _context.MaterialRequests.Add(entity);
            await _context.SaveChangesAsync();

            var result = await GetByIdAsync(entity.Id);
            return result!;
        }

        public async Task<bool> UpdateAsync(Guid id, CreateMaterialRequestDto dto)
        {
            var entity = await _context.MaterialRequests
                .Include(r => r.Items)
                .FirstOrDefaultAsync(r => r.Id == id);

            if (entity == null) return false;

            var oldStatus = entity.Status;

            // 1. Supplier Category Validation
            if (dto.SupplierId.HasValue)
            {
                var supplier = await _context.Suppliers.FindAsync(dto.SupplierId.Value);
                if (supplier == null) throw new InvalidOperationException("Selected supplier does not exist.");

                var allowedCategoryIds = await _context.SupplierMaterialCategories
                    .Where(smc => smc.SupplierId == dto.SupplierId.Value)
                    .Select(smc => smc.MaterialCategoryId)
                    .ToListAsync();

                foreach (var item in dto.Items)
                {
                    var material = await _context.Materials.FindAsync(item.MaterialId);
                    if (material == null) throw new InvalidOperationException($"Material ID {item.MaterialId} was not found.");

                    if (material.MaterialCategoryId.HasValue && !allowedCategoryIds.Contains(material.MaterialCategoryId.Value))
                    {
                        throw new InvalidOperationException($"Supplier '{supplier.Name}' does not supply the material category for '{material.Name}'.");
                    }
                }
            }

            entity.SupplierId = dto.SupplierId;
            entity.Status = dto.Status;
            if (dto.RequiredDate != default) entity.RequiredDate = dto.RequiredDate;
            if (dto.Notes != null) entity.Notes = dto.Notes;
            if (dto.RequestedBy != null) entity.RequestedBy = dto.RequestedBy;
            entity.UpdatedAt = DateTime.UtcNow;

            // Replace line items if provided
            if (dto.Items != null && dto.Items.Any())
            {
                _context.MaterialRequestItems.RemoveRange(entity.Items);
                entity.Items = dto.Items.Select(i => new MaterialRequestItem
                {
                    Id = Guid.NewGuid(),
                    MaterialRequestId = entity.Id,
                    MaterialId = i.MaterialId,
                    RequestedQuantity = i.RequestedQuantity
                }).ToList();
            }

            // Stock Inflow & Inspection creation on Status transition to Received
            if (oldStatus != MaterialRequestStatus.Received && entity.Status == MaterialRequestStatus.Received)
            {
                foreach (var item in entity.Items)
                {
                    var inventory = await _context.Inventories
                        .FirstOrDefaultAsync(i => i.MaterialId == item.MaterialId && i.WarehouseShelfId == null);

                    if (inventory == null)
                    {
                        inventory = new backend.Model.Inventory
                        {
                            Id = Guid.NewGuid(),
                            MaterialId = item.MaterialId,
                            Quantity = item.RequestedQuantity,
                            WarehouseShelfId = null,
                            Status = "Staging",
                            CreatedAt = DateTime.UtcNow,
                            UpdatedAt = DateTime.UtcNow
                        };
                        _context.Inventories.Add(inventory);
                    }
                    else
                    {
                        inventory.Quantity += item.RequestedQuantity;
                        inventory.UpdatedAt = DateTime.UtcNow;
                    }
                }
            }

            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> UpdateStatusAsync(Guid id, MaterialRequestStatus status)
        {
            var entity = await _context.MaterialRequests
                .Include(r => r.Items)
                .FirstOrDefaultAsync(r => r.Id == id);

            if (entity == null) return false;

            var oldStatus = entity.Status;
            entity.Status = status;
            entity.UpdatedAt = DateTime.UtcNow;

            // Trigger stock inflow & Inspection creation when transitioning to Received
            if (oldStatus != MaterialRequestStatus.Received && entity.Status == MaterialRequestStatus.Received)
            {
                foreach (var item in entity.Items)
                {
                    var inventory = await _context.Inventories
                        .FirstOrDefaultAsync(i => i.MaterialId == item.MaterialId && i.WarehouseShelfId == null);

                    if (inventory == null)
                    {
                        inventory = new backend.Model.Inventory
                        {
                            Id = Guid.NewGuid(),
                            MaterialId = item.MaterialId,
                            Quantity = item.RequestedQuantity,
                            WarehouseShelfId = null,
                            Status = "Staging",
                            CreatedAt = DateTime.UtcNow,
                            UpdatedAt = DateTime.UtcNow
                        };
                        _context.Inventories.Add(inventory);
                    }
                    else
                    {
                        inventory.Quantity += item.RequestedQuantity;
                        inventory.UpdatedAt = DateTime.UtcNow;
                    }
                }
            }

            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> DeleteAsync(Guid id)
        {
            var entity = await _context.MaterialRequests.FindAsync(id);
            if (entity == null) return false;

            _context.MaterialRequests.Remove(entity);
            await _context.SaveChangesAsync();
            return true;
        }

        private static MaterialRequestDto MapToDto(backend.Model.MaterialRequest r)
        {
            return new MaterialRequestDto
            {
                Id = r.Id,
                RequestNumber = r.RequestNumber,
                SupplierId = r.SupplierId,
                Status = r.Status,
                RequiredDate = r.RequiredDate,
                Notes = r.Notes,
                RequestedBy = r.RequestedBy,
                CreatedAt = r.CreatedAt,
                CreatedBy = r.CreatedBy,
                UpdatedAt = r.UpdatedAt,
                UpdatedBy = r.UpdatedBy,
                Supplier = r.Supplier == null ? null : new SupplierGetDto
                {
                    Id = r.Supplier.Id,
                    SupplierCode = r.Supplier.SupplierCode,
                    Name = r.Supplier.Name,
                    ContactEmail = r.Supplier.ContactEmail,
                    ContactPhone = r.Supplier.ContactPhone,
                    Address = r.Supplier.Address,
                    Status = r.Supplier.Status,
                    Rating = r.Supplier.Rating
                },
                Items = r.Items.Select(i => new MaterialRequestItemDto
                {
                    Id = i.Id,
                    MaterialId = i.MaterialId,
                    RequestedQuantity = i.RequestedQuantity,
                    Material = i.Material == null ? null : new MaterialGetDto
                    {
                        Id = i.Material.Id,
                        MaterialCode = i.Material.MaterialCode,
                        Name = i.Material.Name,
                        AvailableQty = i.Material.AvailableQty,
                        ImagePath = i.Material.ImagePath,
                        CostPerUnit = i.Material.CostPerUnit
                    }
                }).ToList()
            };
        }
    }
}
