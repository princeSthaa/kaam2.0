using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using backend.Data;
using backend.Dto.Supplier;
using backend.Model;
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
            var query = _context.Suppliers
                .Include(s => s.SupplierMaterialCategories)
                    .ThenInclude(sm => sm.MaterialCategory)
                .Include(s => s.MaterialRequests)
                    .ThenInclude(mr => mr.Items)
                .AsQueryable();

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
                .Select(s => MapToDto(s))
                .ToListAsync();
        }

        public async Task<SupplierDto?> GetByIdAsync(Guid id)
        {
            var supplier = await _context.Suppliers
                .Include(s => s.SupplierMaterialCategories)
                    .ThenInclude(sm => sm.MaterialCategory)
                .Include(s => s.MaterialRequests)
                    .ThenInclude(mr => mr.Items)
                .FirstOrDefaultAsync(s => s.Id == id && !s.IsDeleted);

            if (supplier == null) return null;

            return MapToDto(supplier);
        }

        public async Task<SupplierDto> CreateAsync(SupplierCreateDto createDto)
        {
            // Validate that all specified MaterialCategoryIds exist
            if (createDto.MaterialCategoryIds != null && createDto.MaterialCategoryIds.Any())
            {
                var distinctCategoryIds = createDto.MaterialCategoryIds.Distinct().ToList();
                var existingCount = await _context.MaterialCategories
                    .CountAsync(mc => distinctCategoryIds.Contains(mc.Id));

                if (existingCount != distinctCategoryIds.Count)
                {
                    throw new ArgumentException("One or more specified Material Category IDs do not exist.");
                }
            }

            var supplierId = Guid.NewGuid();
            var supplierCode = string.IsNullOrWhiteSpace(createDto.SupplierCode)
                ? $"SUP-{new Random().Next(1000, 9999)}"
                : createDto.SupplierCode;

            var entity = new backend.Model.Supplier
            {
                Id = supplierId,
                SupplierCode = supplierCode,
                Name = createDto.Name,
                ContactEmail = createDto.ContactEmail,
                ContactPhone = createDto.ContactPhone,
                Address = createDto.Address,
                Status = createDto.Status,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow,
                IsDeleted = false
            };

            if (createDto.MaterialCategoryIds != null && createDto.MaterialCategoryIds.Any())
            {
                foreach (var catId in createDto.MaterialCategoryIds.Distinct())
                {
                    entity.SupplierMaterialCategories.Add(new SupplierMaterialCategory
                    {
                        SupplierId = supplierId,
                        MaterialCategoryId = catId
                    });
                }
            }

            _context.Suppliers.Add(entity);
            await _context.SaveChangesAsync();

            return (await GetByIdAsync(supplierId))!;
        }

        public async Task<bool> UpdateAsync(Guid id, SupplierUpdateDto updateDto)
        {
            var supplier = await _context.Suppliers
                .Include(s => s.SupplierMaterialCategories)
                .FirstOrDefaultAsync(s => s.Id == id && !s.IsDeleted);

            if (supplier == null) return false;

            if (updateDto.MaterialCategoryIds != null)
            {
                var distinctCategoryIds = updateDto.MaterialCategoryIds.Distinct().ToList();
                if (distinctCategoryIds.Any())
                {
                    var existingCount = await _context.MaterialCategories
                        .CountAsync(mc => distinctCategoryIds.Contains(mc.Id));

                    if (existingCount != distinctCategoryIds.Count)
                    {
                        throw new ArgumentException("One or more specified Material Category IDs do not exist.");
                    }
                }

                // Remove mappings no longer selected
                var currentCategoryIds = supplier.SupplierMaterialCategories.Select(sm => sm.MaterialCategoryId).ToList();
                var toRemove = supplier.SupplierMaterialCategories
                    .Where(sm => !distinctCategoryIds.Contains(sm.MaterialCategoryId))
                    .ToList();

                foreach (var item in toRemove)
                {
                    supplier.SupplierMaterialCategories.Remove(item);
                }

                // Add newly selected mappings
                var toAdd = distinctCategoryIds
                    .Where(catId => !currentCategoryIds.Contains(catId))
                    .Select(catId => new SupplierMaterialCategory
                    {
                        SupplierId = id,
                        MaterialCategoryId = catId
                    });

                foreach (var item in toAdd)
                {
                    supplier.SupplierMaterialCategories.Add(item);
                }
            }

            if (!string.IsNullOrWhiteSpace(updateDto.SupplierCode))
            {
                supplier.SupplierCode = updateDto.SupplierCode;
            }

            supplier.Name = updateDto.Name;
            supplier.ContactEmail = updateDto.ContactEmail;
            supplier.ContactPhone = updateDto.ContactPhone;
            supplier.Address = updateDto.Address;
            supplier.Status = updateDto.Status;
            supplier.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> DeleteAsync(Guid id)
        {
            var supplier = await _context.Suppliers.FirstOrDefaultAsync(s => s.Id == id && !s.IsDeleted);
            if (supplier == null) return false;

            supplier.IsDeleted = true;
            supplier.DeletedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<SupplierDto?> RecalculateMetricsAsync(Guid id)
        {
            var supplier = await _context.Suppliers
                .Include(s => s.SupplierMaterialCategories)
                    .ThenInclude(sm => sm.MaterialCategory)
                .Include(s => s.MaterialRequests)
                    .ThenInclude(r => r.MaterialInspection)
                        .ThenInclude(mi => mi!.Items)
                .FirstOrDefaultAsync(s => s.Id == id && !s.IsDeleted);

            if (supplier == null) return null;

            var requests = supplier.MaterialRequests.ToList();
            var inspectionItems = requests
                .Where(r => r.MaterialInspection != null)
                .SelectMany(r => r.MaterialInspection!.Items)
                .ToList();

            int totalOrders = requests.Count;

            decimal onTimeRate = 100.00m;
            if (totalOrders > 0)
            {
                int onTimeCount = requests.Count(r => r.RequiredDate.Date >= r.CreatedAt.Date);
                onTimeRate = Math.Round(((decimal)onTimeCount / totalOrders) * 100m, 2);
            }

            decimal defectRate = 0.00m;
            if (inspectionItems.Count > 0)
            {
                int defectiveCount = inspectionItems.Count(i =>
                    string.Equals(i.InspectionStatus, "Rejected", StringComparison.OrdinalIgnoreCase) ||
                    string.Equals(i.InspectionStatus, "Failed", StringComparison.OrdinalIgnoreCase) ||
                    string.Equals(i.InspectionStatus, "Purchase Return", StringComparison.OrdinalIgnoreCase));
                defectRate = Math.Round(((decimal)defectiveCount / inspectionItems.Count) * 100m, 2);
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

            return MapToDto(supplier);
        }

        private static SupplierDto MapToDto(backend.Model.Supplier s)
        {
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
                DeletedAt = s.DeletedAt,
                MaterialCategories = s.SupplierMaterialCategories
                    .Where(sm => sm.MaterialCategory != null)
                    .Select(sm => new SupplierCategoryResponseDto
                    {
                        Id = sm.MaterialCategory.Id,
                        Name = sm.MaterialCategory.Name
                    })
                    .ToList(),
                MaterialRequests = s.MaterialRequests
                    .Select(mr => new SupplierMaterialRequestResponseDto
                    {
                        Id = mr.Id,
                        MaterialId = mr.Items.FirstOrDefault()?.MaterialId.ToString() ?? string.Empty,
                        RequestedQuantity = mr.Items.Sum(i => i.RequestedQuantity),
                        RequiredDate = mr.RequiredDate,
                        Notes = mr.Notes,
                        RequestedBy = mr.RequestedBy,
                    })
                    .ToList()
            };
        }
    }
}
