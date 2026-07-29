using Microsoft.EntityFrameworkCore;
using backend.Data;
using backend.Dto.Supplier;

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
            string? name = null,
            string? status = null
        )
        {
            var query = _context.Suppliers.AsQueryable();

            if (id.HasValue)
            {
                query = query.Where(s => s.Id == id.Value);
            }

            if (!string.IsNullOrWhiteSpace(name))
            {
                query = query.Where(s => s.Name.Contains(name));
            }

            if (!string.IsNullOrWhiteSpace(status))
            {
                query = query.Where(s => s.Status == status);
            }

            return await query
                .OrderBy(s => s.Name)
                .Select(s => new SupplierDto
                {
                    Id = s.Id,
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
                    UpdatedAt = s.UpdatedAt
                })
                .ToListAsync();
        }

        public async Task<SupplierDto?> GetByIdAsync(Guid id)
        {
            var s = await _context.Suppliers.FirstOrDefaultAsync(x => x.Id == id);
            if (s == null) return null;

            return new SupplierDto
            {
                Id = s.Id,
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
                UpdatedAt = s.UpdatedAt
            };
        }

        public async Task<SupplierDto> CreateAsync(SupplierDto dto)
        {
            var entity = new backend.Model.Supplier
            {
                Name = dto.Name,
                ContactEmail = dto.ContactEmail,
                ContactPhone = dto.ContactPhone,
                Address = dto.Address,
                Status = string.IsNullOrWhiteSpace(dto.Status) ? "Active" : dto.Status,
                OnTimeDeliveryRate = dto.OnTimeDeliveryRate,
                DefectRate = dto.DefectRate,
                Rating = dto.Rating,
                TotalOrders = dto.TotalOrders,
                LastEvaluatedAt = dto.LastEvaluatedAt,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            _context.Suppliers.Add(entity);
            await _context.SaveChangesAsync();

            dto.Id = entity.Id;
            dto.CreatedAt = entity.CreatedAt;
            dto.UpdatedAt = entity.UpdatedAt;
            return dto;
        }

        public async Task<bool> UpdateAsync(Guid id, SupplierDto dto)
        {
            var entity = await _context.Suppliers.FirstOrDefaultAsync(s => s.Id == id);
            if (entity == null) return false;

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
            var entity = await _context.Suppliers.FirstOrDefaultAsync(s => s.Id == id);
            if (entity == null) return false;

            _context.Suppliers.Remove(entity);
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<SupplierDto?> RecalculateMetricsAsync(Guid id)
        {
            var supplier = await _context.Suppliers
                .Include(s => s.MaterialRequests)
                .Include(s => s.MaterialInspections)
                .FirstOrDefaultAsync(s => s.Id == id);

            if (supplier == null) return null;

            // 1. Total Orders count from MaterialRequests (matched by SupplierId or Name)
            var requests = await _context.MaterialRequests
                .Where(r => r.SupplierId == supplier.Id || r.SupplierName == supplier.Name)
                .ToListAsync();

            var inspections = await _context.MaterialInspections
                .Where(i => i.SupplierId == supplier.Id || i.SupplierName == supplier.Name)
                .ToListAsync();

            int totalOrders = requests.Count;

            // 2. On-Time Delivery Rate (%)
            decimal onTimeRate = 100.00m;
            if (totalOrders > 0)
            {
                int onTimeCount = requests.Count(r => r.RequiredDate.Date >= r.CreatedAt.Date);
                onTimeRate = Math.Round(((decimal)onTimeCount / totalOrders) * 100m, 2);
            }

            // 3. Defect Rate (%)
            decimal defectRate = 0.00m;
            if (inspections.Count > 0)
            {
                int defectiveCount = inspections.Count(i => 
                    string.Equals(i.InspectionStatus, "Rejected", StringComparison.OrdinalIgnoreCase) ||
                    string.Equals(i.InspectionStatus, "Failed", StringComparison.OrdinalIgnoreCase) ||
                    string.Equals(i.InspectionStatus, "Purchase Return", StringComparison.OrdinalIgnoreCase));
                defectRate = Math.Round(((decimal)defectiveCount / inspections.Count) * 100m, 2);
            }

            // 4. Rating calculation (out of 5.0)
            // Weighting: 60% On-Time Delivery, 40% Quality (100 - DefectRate)
            decimal qualityScore = Math.Max(0m, 100m - defectRate);
            decimal combinedPercentage = (onTimeRate * 0.60m) + (qualityScore * 0.40m);
            decimal rating = Math.Round((combinedPercentage / 100m) * 5.0m, 2);
            rating = Math.Clamp(rating, 0.0m, 5.0m);

            // Update Supplier entity
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
                UpdatedAt = supplier.UpdatedAt
            };
        }
    }
}
