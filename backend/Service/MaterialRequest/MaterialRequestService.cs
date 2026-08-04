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
            var query = _context.MaterialRequests
                .Include(r => r.Supplier)
                .Include(r => r.Items)
                    .ThenInclude(i => i.Material)
                .AsNoTracking()
                .AsQueryable();

            if (id.HasValue) query = query.Where(r => r.Id == id.Value);
            if (supplierId.HasValue) query = query.Where(r => r.SupplierId == supplierId.Value);
            if (!string.IsNullOrWhiteSpace(requestNumber)) query = query.Where(r => r.RequestNumber.Contains(requestNumber));
            if (!string.IsNullOrWhiteSpace(status) && Enum.TryParse<MaterialRequestStatus>(status, true, out var parsedStatus))
            {
                query = query.Where(r => r.Status == parsedStatus);
            }

            var items = await query.OrderByDescending(r => r.CreatedAt).ToListAsync();

            return items.Select(r => MapToDto(r)).ToList();
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
                    var mat = await _context.Materials.FindAsync(item.MaterialId);
                    if (mat != null)
                    {
                        mat.AvailableQty += item.RequestedQuantity;
                    }
                }
                await CreateInspectionIfMissingAsync(entity);
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
                    var mat = await _context.Materials.FindAsync(item.MaterialId);
                    if (mat != null)
                    {
                        mat.AvailableQty += item.RequestedQuantity;
                    }
                }
                await CreateInspectionIfMissingAsync(entity);
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
                    var mat = await _context.Materials.FindAsync(item.MaterialId);
                    if (mat != null)
                    {
                        mat.AvailableQty += item.RequestedQuantity;
                    }
                }
                await CreateInspectionIfMissingAsync(entity);
            }

            await _context.SaveChangesAsync();
            return true;
        }

        private async Task CreateInspectionIfMissingAsync(backend.Model.MaterialRequest entity)
        {
            var exists = await _context.MaterialInspections
                .AnyAsync(mi => mi.MaterialRequestId == entity.Id);

            if (!exists)
            {
                var inspection = new backend.Model.MaterialInspection
                {
                    Id = Guid.NewGuid(),
                    MaterialRequestId = entity.Id,
                    SupplierId = entity.SupplierId,
                    InspectionStatus = "Pending",
                    InspectorName = "System",
                    Notes = entity.Notes ?? string.Empty,
                    CreatedAt = DateTime.UtcNow,
                    CreatedBy = entity.UpdatedBy ?? "System",
                    UpdatedAt = DateTime.UtcNow,
                    UpdatedBy = entity.UpdatedBy ?? "System",
                    Items = entity.Items.Select(item => new backend.Model.MaterialInspectionItem
                    {
                        Id = Guid.NewGuid(),
                        MaterialId = item.MaterialId,
                        ReceivedQuantity = item.RequestedQuantity,
                        InspectionStatus = "Pending",
                        Notes = string.Empty,
                        CreatedAt = DateTime.UtcNow,
                        CreatedBy = entity.UpdatedBy ?? "System",
                        UpdatedAt = DateTime.UtcNow,
                        UpdatedBy = entity.UpdatedBy ?? "System"
                    }).ToList()
                };

                _context.MaterialInspections.Add(inspection);
            }
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
