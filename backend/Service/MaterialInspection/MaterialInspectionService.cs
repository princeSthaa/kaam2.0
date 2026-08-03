using Microsoft.EntityFrameworkCore;
using backend.Data;
using backend.Dto.MaterialInspection;

namespace backend.Service.MaterialInspection
{
    public class MaterialInspectionService : IMaterialInspectionService
    {
        private readonly AppDbContext _context;

        public MaterialInspectionService(AppDbContext context)
        {
            _context = context;
        }

        public async Task<List<MaterialInspectionDto>> GetAllAsync( 
            Guid? materialRequestId = null,
            string? inspectionStatus = null
        )
        {
            var query = _context.MaterialInspections
                .Include(i => i.Supplier)
                .Include(i => i.MaterialRequest)
                    .ThenInclude(r => r!.Supplier)
                .Include(i => i.Items)
                    .ThenInclude(item => item.Material)
                .AsNoTracking()
                .AsQueryable();

            if (materialRequestId.HasValue)
            {
                query = query.Where(i => i.MaterialRequestId == materialRequestId.Value);
            }

            if (!string.IsNullOrWhiteSpace(inspectionStatus))
            {
                query = query.Where(i => i.InspectionStatus == inspectionStatus);
            }

            var entities = await query.ToListAsync();
            return entities.Select(MapToDto).ToList();
        }

        public async Task<MaterialInspectionDto?> GetByIdAsync(Guid id)
        {
            var entity = await _context.MaterialInspections
                .Include(i => i.Supplier)
                .Include(i => i.MaterialRequest)
                    .ThenInclude(r => r!.Supplier)
                .Include(i => i.Items)
                    .ThenInclude(item => item.Material)
                .AsNoTracking()
                .FirstOrDefaultAsync(i => i.Id == id);

            return entity == null ? null : MapToDto(entity);
        }

        public async Task<bool> UpdateInspectionAsync(Guid id, UpdateMaterialInspectionDto dto)
        {
            var entity = await _context.MaterialInspections.FindAsync(id);
            if (entity == null) return false;

            if (!string.IsNullOrWhiteSpace(dto.InspectionStatus))
            {
                entity.InspectionStatus = dto.InspectionStatus;
            }
            if (dto.InspectorName != null)
            {
                entity.InspectorName = dto.InspectorName;
            }
            if (dto.Notes != null)
            {
                entity.Notes = dto.Notes;
            }
            entity.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> UpdateInspectionItemAsync(Guid itemId, UpdateMaterialInspectionItemDto dto)
        {
            var item = await _context.MaterialInspectionItems
                .Include(i => i.MaterialInspection)
                    .ThenInclude(mi => mi.Items)
                .FirstOrDefaultAsync(i => i.Id == itemId);

            if (item == null) return false;

            if (dto.ReceivedQuantity.HasValue)
            {
                item.ReceivedQuantity = dto.ReceivedQuantity.Value;
            }
            if (!string.IsNullOrWhiteSpace(dto.InspectionStatus))
            {
                item.InspectionStatus = dto.InspectionStatus;
            }
            if (dto.Notes != null)
            {
                item.Notes = dto.Notes;
            }
            item.UpdatedAt = DateTime.UtcNow;

            // Recalculate parent Header InspectionStatus
            if (item.MaterialInspection != null)
            {
                var allItems = item.MaterialInspection.Items.ToList();
                if (allItems.All(i => i.InspectionStatus == "Approved"))
                {
                    item.MaterialInspection.InspectionStatus = "Completed";
                }
                else if (allItems.Any(i => i.InspectionStatus == "Approved" || i.InspectionStatus == "Rejected"))
                {
                    item.MaterialInspection.InspectionStatus = "InProgress";
                }
                item.MaterialInspection.UpdatedAt = DateTime.UtcNow;
            }

            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> DeleteAsync(Guid id)
        {
            var entity = await _context.MaterialInspections.FindAsync(id);
            if (entity == null) return false;

            _context.MaterialInspections.Remove(entity);
            await _context.SaveChangesAsync();
            return true;
        }

        private static MaterialInspectionDto MapToDto(backend.Model.MaterialInspection i)
        {
            return new MaterialInspectionDto
            {
                Id = i.Id,
                MaterialRequestId = i.MaterialRequestId,
                RequestNumber = i.MaterialRequest?.RequestNumber ?? string.Empty,
                SupplierId = i.SupplierId ?? i.MaterialRequest?.SupplierId,
                SupplierCode = i.Supplier?.SupplierCode ?? i.MaterialRequest?.Supplier?.SupplierCode ?? string.Empty,
                SupplierName = i.Supplier?.Name ?? i.MaterialRequest?.Supplier?.Name ?? string.Empty,
                InspectionStatus = i.InspectionStatus,
                InspectorName = i.InspectorName,
                Notes = i.Notes,
                CreatedAt = i.CreatedAt,
                CreatedBy = i.CreatedBy,
                UpdatedAt = i.UpdatedAt,
                UpdatedBy = i.UpdatedBy,
                Items = i.Items?.Select(item => new MaterialInspectionItemDto
                {
                    Id = item.Id,
                    MaterialInspectionId = item.MaterialInspectionId,
                    MaterialId = item.MaterialId,
                    MaterialCode = item.Material?.MaterialCode ?? string.Empty,
                    MaterialName = item.Material?.Name ?? string.Empty,
                    Unit = item.Material?.Unit ?? string.Empty,
                    ReceivedQuantity = item.ReceivedQuantity,
                    InspectionStatus = item.InspectionStatus,
                    Notes = item.Notes,
                    CreatedAt = item.CreatedAt,
                    UpdatedAt = item.UpdatedAt
                }).ToList() ?? new List<MaterialInspectionItemDto>()
            };
        }
    }
}
