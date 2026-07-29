using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Threading.Tasks;
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
            Guid? id = null,
            string? materialId = null,
            string? materialName = null,
            Guid? materialRequestId = null,
            decimal? receivedQuantity = null,
            string? inspectionStatus = null,
            string? notes = null,
            string? inspectorName = null,
            DateTime? createdAt = null,
            string? createdBy = null,
            DateTime? updatedAt = null,
            string? updatedBy = null
        )
        {
            return await _context.Database
                .SqlQuery<MaterialInspectionDto>($@"
                    EXEC sp_GetMaterialInspections

                        @Id = {id},
                        @MaterialId = {materialId},
                        @MaterialName = {materialName},
                        @MaterialRequestId = {materialRequestId},
                        @ReceivedQuantity = {receivedQuantity},
                        @InspectionStatus = {inspectionStatus},
                        @Notes = {notes},
                        @InspectorName = {inspectorName},
                        @CreatedAt = {createdAt},
                        @CreatedBy = {createdBy},
                        @UpdatedAt = {updatedAt},
                        @UpdatedBy = {updatedBy}
                ")
                .ToListAsync();
        }

        public async Task<MaterialInspectionDto?> GetByIdAsync(Guid id)
        {
            var results = await GetAllAsync(id: id);
            return results.FirstOrDefault();
        }

        public async Task<bool> CreateAsync(MaterialInspectionDto materialInspectionDto)
        {
            if (materialInspectionDto.Id == Guid.Empty)
            {
                materialInspectionDto.Id = Guid.NewGuid();
            }

            await _context.Database.ExecuteSqlInterpolatedAsync($@"
                EXEC sp_InsertMaterialInspection

                    @Id = {materialInspectionDto.Id},
                    @MaterialId = {materialInspectionDto.MaterialId},
                    @MaterialName = {materialInspectionDto.MaterialName},
                    @MaterialRequestId = {materialInspectionDto.MaterialRequestId},
                    @ReceivedQuantity = {materialInspectionDto.ReceivedQuantity},
                    @InspectionStatus = {materialInspectionDto.InspectionStatus},
                    @Notes = {materialInspectionDto.Notes},
                    @InspectorName = {materialInspectionDto.InspectorName},
                    @CreatedAt = {materialInspectionDto.CreatedAt},
                    @CreatedBy = {materialInspectionDto.CreatedBy},
                    @UpdatedAt = {materialInspectionDto.UpdatedAt},
                    @UpdatedBy = {materialInspectionDto.UpdatedBy}
            ");

            return true;
        }

        public async Task<bool> UpdateAsync(Guid id, MaterialInspectionDto materialInspectionDto)
        {
            await _context.Database.ExecuteSqlInterpolatedAsync($@"
                EXEC sp_UpdateMaterialInspection

                    @Id = {materialInspectionDto.Id},
                    @MaterialId = {materialInspectionDto.MaterialId},
                    @MaterialName = {materialInspectionDto.MaterialName},
                    @MaterialRequestId = {materialInspectionDto.MaterialRequestId},
                    @ReceivedQuantity = {materialInspectionDto.ReceivedQuantity},
                    @InspectionStatus = {materialInspectionDto.InspectionStatus},
                    @Notes = {materialInspectionDto.Notes},
                    @InspectorName = {materialInspectionDto.InspectorName},
                    @CreatedAt = {materialInspectionDto.CreatedAt},
                    @CreatedBy = {materialInspectionDto.CreatedBy},
                    @UpdatedAt = {materialInspectionDto.UpdatedAt},
                    @UpdatedBy = {materialInspectionDto.UpdatedBy}
            ");

            return true;
        }

        public async Task<bool> DeleteAsync(Guid id)
        {
            await _context.Database.ExecuteSqlInterpolatedAsync($@"
                EXEC sp_DeleteMaterialInspection
                    @Id = {id}
            ");

            return true;
        }
    }
}
