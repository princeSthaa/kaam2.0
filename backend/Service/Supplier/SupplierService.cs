using Microsoft.EntityFrameworkCore;
using backend.Data;
using backend.Dto.Supplier;
using backend.Model.Enums;


namespace backend.Service.Supplier
{
    public class SupplierService : ISupplierService
    {
        private readonly AppDbContext _context;

        public SupplierService(AppDbContext context)
        {
            _context = context;
        }

        public async Task<List<SupplierDto>> GetAllAsync(
            Guid? id = null,
            string? supplierCode = null,
            string? name = null,
            UserStatus? status = null,
            bool includeDeleted = false
        )
        {
            var query = _context.Suppliers.AsQueryable();

            if (!includeDeleted)
            {
                query = query.Where(s => !s.IsDeleted);
            }

            if (id.HasValue)
            {
                query = query.Where(s => s.Id == id.Value);
            }

            if (!string.IsNullOrWhiteSpace(supplierCode))
            {
                query = query.Where(s => s.SupplierCode == supplierCode);
            }

            if (!string.IsNullOrWhiteSpace(name))
            {
                query = query.Where(s => s.Name.Contains(name));
            }

            if (status.HasValue)
            {
                query = query.Where(s => s.Status == status.Value);
            }

            return await query
                .OrderBy(s => s.Name)
                .Select(s => new SupplierDto
                {
                    Id = s.Id,
                    SupplierCode = s.SupplierCode,
                    Name = s.Name,
                    ContactEmail = s.ContactEmail,
                    ContactPhone = s.ContactPhone,
                    Address = s.Address,
                    Status = s.Status,
                    OnTimeDeliveryRate = s.OnTimeDeliveryRate,
                    DefectRate = s.DefectRate,
                    Rating = s.Rating,
                    TotalOrders = s.TotalOrders,
                    LastEvaluatedAt = s.LastEvaluatedAt,
                    CreatedAt = s.CreatedAt,
                    UpdatedAt = s.UpdatedAt,
                    IsDeleted = s.IsDeleted,
                    DeletedAt = s.DeletedAt
                })
                .ToListAsync();
        }

        public async Task<SupplierDto?> GetByIdAsync(Guid id)
        {
            var s = await _context.Suppliers.FirstOrDefaultAsync(x => x.Id == id && !x.IsDeleted);
            if (s == null) return null;

            return new SupplierDto
            {
                Id = s.Id,
                SupplierCode = s.SupplierCode,
                Name = s.Name,
                ContactEmail = s.ContactEmail,
                ContactPhone = s.ContactPhone,
                Address = s.Address,
                Status = s.Status,
                OnTimeDeliveryRate = s.OnTimeDeliveryRate,
                DefectRate = s.DefectRate,
                Rating = s.Rating,
                TotalOrders = s.TotalOrders,
                LastEvaluatedAt = s.LastEvaluatedAt,
                CreatedAt = s.CreatedAt,
                UpdatedAt = s.UpdatedAt,
                IsDeleted = s.IsDeleted,
                DeletedAt = s.DeletedAt
            };
        }

        public async Task<SupplierDto> CreateAsync(SupplierCreateDto dto)
        {
            var count = await _context.Suppliers.CountAsync();

            var entity = new backend.Model.Supplier
            {
                SupplierCode = $"SUP-{(count + 1):D5}",
                Name = dto.Name,
                ContactEmail = dto.ContactEmail,
                ContactPhone = dto.ContactPhone,
                Address = dto.Address,
                Status = UserStatus.Active,
                OnTimeDeliveryRate = 0,
                DefectRate = 0,
                Rating = 0,
                TotalOrders = 0,
                LastEvaluatedAt = null,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow,
                IsDeleted = false
            };

            _context.Suppliers.Add(entity);
            await _context.SaveChangesAsync();

            return new SupplierDto
            {
                Id = entity.Id,
                SupplierCode = entity.SupplierCode,
                Name = entity.Name,
                ContactEmail = entity.ContactEmail,
                ContactPhone = entity.ContactPhone,
                Address = entity.Address,
                Status = entity.Status,
                OnTimeDeliveryRate = entity.OnTimeDeliveryRate,
                DefectRate = entity.DefectRate,
                Rating = entity.Rating,
                TotalOrders = entity.TotalOrders,
                LastEvaluatedAt = entity.LastEvaluatedAt,
                CreatedAt = entity.CreatedAt,
                UpdatedAt = entity.UpdatedAt,
                IsDeleted = entity.IsDeleted,
                DeletedAt = entity.DeletedAt
            };
        }

        public async Task<bool> UpdateAsync(Guid id, SupplierDto dto)
        {
            var entity = await _context.Suppliers.FirstOrDefaultAsync(s => s.Id == id && !s.IsDeleted);
            if (entity == null) return false;

            entity.SupplierCode = dto.SupplierCode;
            entity.Name = dto.Name;
            entity.ContactEmail = dto.ContactEmail;
            entity.ContactPhone = dto.ContactPhone;
            entity.Address = dto.Address;
            entity.Status = dto.Status;
            entity.OnTimeDeliveryRate = dto.OnTimeDeliveryRate;
            entity.DefectRate = dto.DefectRate;
            entity.Rating = dto.Rating;
            entity.TotalOrders = dto.TotalOrders;
            entity.LastEvaluatedAt = dto.LastEvaluatedAt;
            entity.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> DeleteAsync(Guid id)
        {
            var entity = await _context.Suppliers.FirstOrDefaultAsync(s => s.Id == id && !s.IsDeleted);
            if (entity == null) return false;

            entity.IsDeleted = true;
            entity.DeletedAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<SupplierDto?> RecalculateMetricsAsync(Guid id)
        {
            var supplier = await _context.Suppliers
                .Include(s => s.MaterialRequests)
                .ThenInclude(r => r.MaterialInspections)
                .FirstOrDefaultAsync(s => s.Id == id && !s.IsDeleted);

            if (supplier == null) return null;

            var requests = supplier.MaterialRequests.ToList();

            var inspections = requests
                .SelectMany(r => r.MaterialInspections)
                .ToList();

            int totalOrders = requests.Count;

            decimal onTimeRate = 100.00m;
            if (totalOrders > 0)
            {
                int onTimeCount = requests.Count(r => r.RequiredDate.Date >= r.CreatedAt.Date);
                onTimeRate = Math.Round(((decimal)onTimeCount / totalOrders) * 100m, 2);
            }

            decimal defectRate = 0.00m;
            if (inspections.Count > 0)
            {
                int defectiveCount = inspections.Count(i => 
                    string.Equals(i.InspectionStatus, "Rejected", StringComparison.OrdinalIgnoreCase) ||
                    string.Equals(i.InspectionStatus, "Failed", StringComparison.OrdinalIgnoreCase) ||
                    string.Equals(i.InspectionStatus, "Purchase Return", StringComparison.OrdinalIgnoreCase));
                defectRate = Math.Round(((decimal)defectiveCount / inspections.Count) * 100m, 2);
            }

            decimal qualityScore = Math.Max(0m, 100m - defectRate);
            decimal combinedPercentage = (onTimeRate * 0.60m) + (qualityScore * 0.40m);
            decimal rating = Math.Round((combinedPercentage / 100m) * 5.0m, 2);
            rating = Math.Clamp(rating, 0.0m, 5.0m);

            supplier.TotalOrders = totalOrders;
            supplier.OnTimeDeliveryRate = onTimeRate;
            supplier.DefectRate = defectRate;
            supplier.Rating = rating;
            supplier.LastEvaluatedAt = DateTime.UtcNow;
            supplier.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            return new SupplierDto
            {
                Id = supplier.Id,
                SupplierCode = supplier.SupplierCode,
                Name = supplier.Name,
                ContactEmail = supplier.ContactEmail,
                ContactPhone = supplier.ContactPhone,
                Address = supplier.Address,
                Status = supplier.Status,
                OnTimeDeliveryRate = supplier.OnTimeDeliveryRate,
                DefectRate = supplier.DefectRate,
                Rating = supplier.Rating,
                TotalOrders = supplier.TotalOrders,
                LastEvaluatedAt = supplier.LastEvaluatedAt,
                CreatedAt = supplier.CreatedAt,
                UpdatedAt = supplier.UpdatedAt,
                IsDeleted = supplier.IsDeleted,
                DeletedAt = supplier.DeletedAt
            };
        }
    }
}
