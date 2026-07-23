using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Text.Json;
using System.Threading.Tasks;
using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;
using backend.Data;
using backend.Dto.MaterialRequest;
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

        // <crudgen:methods>
        public async Task<List<MaterialRequestDto>> GetAllAsync(
            Guid? id = null,
            string? materialId = null,
            string? materialName = null,
            decimal? requestedQuantity = null,
            string? supplierName = null,
            string? urgency = null,
            DateTime? requiredDate = null,
            string? notes = null,
            string? requestedBy = null,
            string? status = null,
            DateTime? createdAt = null,
            string? createdBy = null,
            DateTime? updatedAt = null,
            string? updatedBy = null
        )
        {
            return await _context.Database
                .SqlQuery<MaterialRequestDto>($@"
                    EXEC sp_GetMaterialRequests

                        @Id = {id},
                        @MaterialId = {materialId},
                        @MaterialName = {materialName},
                        @RequestedQuantity = {requestedQuantity},
                        @SupplierName = {supplierName},
                        @Urgency = {urgency},
                        @RequiredDate = {requiredDate},
                        @Notes = {notes},
                        @RequestedBy = {requestedBy},
                        @Status = {status},
                        @CreatedAt = {createdAt},
                        @CreatedBy = {createdBy},
                        @UpdatedAt = {updatedAt},
                        @UpdatedBy = {updatedBy}
                ")
                .ToListAsync();
        }

        public async Task<MaterialRequestDto?> GetByIdAsync(Guid id)
        {
            var results = await GetAllAsync(id: id);
            return results.FirstOrDefault();
        }

        public async Task<bool> CreateAsync(MaterialRequestDto materialRequestDto)
        {
            if (materialRequestDto.Id == Guid.Empty)
            {
                materialRequestDto.Id = Guid.NewGuid();
            }

            await _context.Database.ExecuteSqlInterpolatedAsync($@"
                EXEC sp_InsertMaterialRequest

                    @Id = {materialRequestDto.Id},
                    @MaterialId = {materialRequestDto.MaterialId},
                    @MaterialName = {materialRequestDto.MaterialName},
                    @RequestedQuantity = {materialRequestDto.RequestedQuantity},
                    @SupplierName = {materialRequestDto.SupplierName},
                    @Urgency = {materialRequestDto.Urgency},
                    @RequiredDate = {materialRequestDto.RequiredDate},
                    @Notes = {materialRequestDto.Notes},
                    @RequestedBy = {materialRequestDto.RequestedBy},
                    @Status = {materialRequestDto.Status},
                    @CreatedAt = {materialRequestDto.CreatedAt},
                    @CreatedBy = {materialRequestDto.CreatedBy},
                    @UpdatedAt = {materialRequestDto.UpdatedAt},
                    @UpdatedBy = {materialRequestDto.UpdatedBy}
            ");

            return true;
        }

        public async Task<bool> UpdateAsync(Guid id, MaterialRequestDto materialRequestDto)
        {

            await _context.Database.ExecuteSqlInterpolatedAsync($@"
                EXEC sp_UpdateMaterialRequest

                    @Id = {materialRequestDto.Id},
                    @MaterialId = {materialRequestDto.MaterialId},
                    @MaterialName = {materialRequestDto.MaterialName},
                    @RequestedQuantity = {materialRequestDto.RequestedQuantity},
                    @SupplierName = {materialRequestDto.SupplierName},
                    @Urgency = {materialRequestDto.Urgency},
                    @RequiredDate = {materialRequestDto.RequiredDate},
                    @Notes = {materialRequestDto.Notes},
                    @RequestedBy = {materialRequestDto.RequestedBy},
                    @Status = {materialRequestDto.Status},
                    @CreatedAt = {materialRequestDto.CreatedAt},
                    @CreatedBy = {materialRequestDto.CreatedBy},
                    @UpdatedAt = {materialRequestDto.UpdatedAt},
                    @UpdatedBy = {materialRequestDto.UpdatedBy}
            ");

            return true;
        }

        public async Task<bool> DeleteAsync(Guid id)
        {
            await _context.Database.ExecuteSqlInterpolatedAsync($@"
                EXEC sp_DeleteMaterialRequest
                    @Id = {id}
            ");

            return true;
        }

        // </crudgen:methods>
    }
}
