using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Text.Json;
using System.Threading.Tasks;
using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;
using backend.Data;
using backend.Dto.BillOfMaterial;
using backend.Model;

namespace backend.Service.BillOfMaterial
{
    public class BillOfMaterialService : IBillOfMaterialService
    {
        private readonly AppDbContext _context;

        public BillOfMaterialService(AppDbContext context)
        {
            _context = context;
        }

        // <crudgen:methods>
        public async Task<List<BillOfMaterialDto>> GetAllAsync(
            string? id = null,
            decimal? qtyPerUnit = null,
            decimal? wastagePercent = null,
            DateTime? createdAt = null,
            string? createdBy = null,
            DateTime? updatedAt = null,
            string? updatedBy = null
        )
        {
            return await _context.Database
                .SqlQuery<BillOfMaterialDto>($@"
                    EXEC sp_GetBillOfMaterials

                        @Id = {id},
                        @QtyPerUnit = {qtyPerUnit},
                        @WastagePercent = {wastagePercent},
                        @CreatedAt = {createdAt},
                        @CreatedBy = {createdBy},
                        @UpdatedAt = {updatedAt},
                        @UpdatedBy = {updatedBy}
                ")
                .ToListAsync();
        }

        public async Task<bool> CreateAsync(BillOfMaterialDto billOfMaterialDto)
        {

            await _context.Database.ExecuteSqlInterpolatedAsync($@"
                EXEC sp_InsertBillOfMaterial

                    @QtyPerUnit = {billOfMaterialDto.QtyPerUnit},
                    @WastagePercent = {billOfMaterialDto.WastagePercent},
                    @CreatedAt = {billOfMaterialDto.CreatedAt},
                    @CreatedBy = {billOfMaterialDto.CreatedBy},
                    @UpdatedAt = {billOfMaterialDto.UpdatedAt},
                    @UpdatedBy = {billOfMaterialDto.UpdatedBy},
                    @ProductId = {billOfMaterialDto.ProductId},
                    @MaterialId = {billOfMaterialDto.MaterialId}
            ");

            return true;
        }

        public async Task<bool> UpdateAsync(string id, BillOfMaterialDto billOfMaterialDto)
        {

            await _context.Database.ExecuteSqlInterpolatedAsync($@"
                EXEC sp_UpdateBillOfMaterial

                    @Id = {id},
                    @QtyPerUnit = {billOfMaterialDto.QtyPerUnit},
                    @WastagePercent = {billOfMaterialDto.WastagePercent},
                    @CreatedAt = {billOfMaterialDto.CreatedAt},
                    @CreatedBy = {billOfMaterialDto.CreatedBy},
                    @UpdatedAt = {billOfMaterialDto.UpdatedAt},
                    @UpdatedBy = {billOfMaterialDto.UpdatedBy},
                    @ProductId = {billOfMaterialDto.ProductId},
                    @MaterialId = {billOfMaterialDto.MaterialId}
            ");

            return true;
        }

        public async Task<bool> DeleteAsync(string id)
        {
            await _context.Database.ExecuteSqlInterpolatedAsync($@"
                EXEC sp_DeleteBillOfMaterial
                    @Id = {id}
            ");

            return true;
        }

        // </crudgen:methods>
    }
}
