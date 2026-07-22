using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Text.Json;
using System.Threading.Tasks;
using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;
using backend.Data;
using backend.Dto.Material;
using backend.Model;

namespace backend.Service.Material
{
    public class MaterialService : IMaterialService
    {
        private readonly AppDbContext _context;

        public MaterialService(AppDbContext context)
        {
            _context = context;
        }

        // <crudgen:methods>
        public async Task<List<MaterialDto>> GetAllAsync(
            string? id = null,
            string? materialCode = null,
            string? name = null,
            string? type = null,
            decimal? availableQty = null,
            string? unit = null,
            decimal? costPerUnit = null,
            DateTime? createdAt = null,
            string? createdBy = null,
            DateTime? updatedAt = null,
            string? updatedBy = null
        )
        {
            return await _context.Database
                .SqlQuery<MaterialDto>($@"
                    EXEC sp_GetMaterials

                        @Id = {id},
                        @MaterialCode = {materialCode},
                        @Name = {name},
                        @Type = {type},
                        @AvailableQty = {availableQty},
                        @Unit = {unit},
                        @CostPerUnit = {costPerUnit},
                        @CreatedAt = {createdAt},
                        @CreatedBy = {createdBy},
                        @UpdatedAt = {updatedAt},
                        @UpdatedBy = {updatedBy}
                ")
                .ToListAsync();
        }

        public async Task<bool> CreateAsync(MaterialDto materialDto)
        {

            await _context.Database.ExecuteSqlInterpolatedAsync($@"
                EXEC sp_InsertMaterial

                    @MaterialCode = {materialDto.MaterialCode},
                    @Name = {materialDto.Name},
                    @Type = {materialDto.Type},
                    @AvailableQty = {materialDto.AvailableQty},
                    @Unit = {materialDto.Unit},
                    @CostPerUnit = {materialDto.CostPerUnit},
                    @CreatedAt = {materialDto.CreatedAt},
                    @CreatedBy = {materialDto.CreatedBy},
                    @UpdatedAt = {materialDto.UpdatedAt},
                    @UpdatedBy = {materialDto.UpdatedBy}
            ");

            return true;
        }

        public async Task<bool> UpdateAsync(string id, MaterialDto materialDto)
        {

            await _context.Database.ExecuteSqlInterpolatedAsync($@"
                EXEC sp_UpdateMaterial

                    @Id = {id},
                    @MaterialCode = {materialDto.MaterialCode},
                    @Name = {materialDto.Name},
                    @Type = {materialDto.Type},
                    @AvailableQty = {materialDto.AvailableQty},
                    @Unit = {materialDto.Unit},
                    @CostPerUnit = {materialDto.CostPerUnit},
                    @CreatedAt = {materialDto.CreatedAt},
                    @CreatedBy = {materialDto.CreatedBy},
                    @UpdatedAt = {materialDto.UpdatedAt},
                    @UpdatedBy = {materialDto.UpdatedBy}
            ");

            return true;
        }

        public async Task<bool> DeleteAsync(string id)
        {
            await _context.Database.ExecuteSqlInterpolatedAsync($@"
                EXEC sp_DeleteMaterial
                    @Id = {id}
            ");

            return true;
        }

        public async Task<bool> RequestSupplierAsync(SupplierMaterialRequestDto dto)
        {
            var mat = await _context.Materials.FirstOrDefaultAsync(m => m.Id == dto.MaterialId || m.MaterialCode == dto.MaterialId);
            var matName = mat?.Name ?? dto.MaterialName;

            var requestEntry = new MaterialRequest
            {
                Id = Guid.NewGuid().ToString(),
                MaterialId = dto.MaterialId,
                MaterialName = matName,
                RequestedQuantity = dto.RequestedQuantity,
                SupplierName = dto.SupplierName,
                Urgency = dto.Urgency,
                RequiredDate = dto.RequiredDate,
                Notes = dto.Notes,
                RequestedBy = dto.RequestedBy,
                Status = "Requested",
                CreatedAt = DateTime.UtcNow,
                CreatedBy = dto.RequestedBy,
                UpdatedAt = DateTime.UtcNow,
                UpdatedBy = dto.RequestedBy
            };
            _context.MaterialRequests.Add(requestEntry);

            var transaction = new backend.Model.Transaction
            {
                Id = Guid.NewGuid().ToString(),
                Timestamp = DateTime.UtcNow,
                TransactionType = "Supplier Request",
                Amount = dto.RequestedQuantity * (mat?.CostPerUnit ?? 0),
                PaymentMethod = "Purchase Demand",
                ReferenceEntity = dto.MaterialId,
                HandledBy = dto.RequestedBy,
                Notes = $"Requested {dto.RequestedQuantity} units of {matName} from {dto.SupplierName}. Urgency: {dto.Urgency}. Notes: {dto.Notes}",
                Status = "Requested",
                CreatedAt = DateTime.UtcNow,
                CreatedBy = dto.RequestedBy,
                UpdatedAt = DateTime.UtcNow,
                UpdatedBy = dto.RequestedBy
            };

            _context.Transactions.Add(transaction);
            await _context.SaveChangesAsync();

            return true;
        }

        public async Task<(bool Success, string Message, decimal RemainingQty)> IssueToFactoryAsync(MaterialIssueDto dto)
        {
            var mat = await _context.Materials.FirstOrDefaultAsync(m => m.Id == dto.MaterialId || m.MaterialCode == dto.MaterialId);
            if (mat == null)
            {
                return (false, "Material not found.", 0);
            }

            if (mat.AvailableQty < dto.IssueQuantity)
            {
                return (false, $"Insufficient stock available. Current available stock: {mat.AvailableQty} {mat.Unit}.", mat.AvailableQty);
            }

            mat.AvailableQty -= dto.IssueQuantity;
            mat.UpdatedAt = DateTime.UtcNow;

            var issueEntry = new MaterialIssue
            {
                Id = Guid.NewGuid().ToString(),
                MaterialId = mat.Id,
                IssueQuantity = dto.IssueQuantity,
                TargetDestination = dto.TargetDestination,
                IssuedTo = dto.IssuedTo,
                Notes = dto.Notes,
                Status = "Completed",
                CreatedAt = DateTime.UtcNow,
                CreatedBy = dto.IssuedTo,
                UpdatedAt = DateTime.UtcNow,
                UpdatedBy = dto.IssuedTo
            };
            _context.MaterialIssues.Add(issueEntry);

            var transaction = new backend.Model.Transaction
            {
                Id = Guid.NewGuid().ToString(),
                Timestamp = DateTime.UtcNow,
                TransactionType = "Material Issue",
                Amount = dto.IssueQuantity * mat.CostPerUnit,
                PaymentMethod = "Factory Transfer",
                ReferenceEntity = mat.Id,
                HandledBy = dto.IssuedTo,
                Notes = $"Issued {dto.IssueQuantity} {mat.Unit} of {mat.Name} to {dto.TargetDestination}. Issued by: {dto.IssuedTo}. Notes: {dto.Notes}",
                Status = "Completed",
                CreatedAt = DateTime.UtcNow,
                CreatedBy = dto.IssuedTo,
                UpdatedAt = DateTime.UtcNow,
                UpdatedBy = dto.IssuedTo
            };

            _context.Transactions.Add(transaction);
            await _context.SaveChangesAsync();

            return (true, $"Successfully issued {dto.IssueQuantity} {mat.Unit} of {mat.Name} to {dto.TargetDestination}.", mat.AvailableQty);
        }

        // </crudgen:methods>
    }
}
