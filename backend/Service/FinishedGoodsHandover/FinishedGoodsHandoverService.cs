using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Text.Json;
using System.Threading.Tasks;
using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;
using backend.Data;
using backend.Dto.FinishedGoodsHandover;
using backend.Model;

namespace backend.Service.FinishedGoodsHandover
{
    public class FinishedGoodsHandoverService : IFinishedGoodsHandoverService
    {
        private readonly AppDbContext _context;

        public FinishedGoodsHandoverService(AppDbContext context)
        {
            _context = context;
        }

        // <crudgen:methods>
        public async Task<List<FinishedGoodsHandoverDto>> GetAllAsync(
            Guid? id = null,
            string? productId = null,
            string? productName = null,
            string? sKU = null,
            int? quantity = null,
            string? sourceFactoryLine = null,
            string? location = null,
            string? acceptedBy = null,
            string? status = null,
            DateTime? createdAt = null,
            string? createdBy = null,
            DateTime? updatedAt = null,
            string? updatedBy = null
        )
        {
            return await _context.Database
                .SqlQuery<FinishedGoodsHandoverDto>($@"
                    EXEC sp_GetFinishedGoodsHandovers

                        @Id = {id},
                        @ProductId = {productId},
                        @ProductName = {productName},
                        @SKU = {sKU},
                        @Quantity = {quantity},
                        @SourceFactoryLine = {sourceFactoryLine},
                        @Location = {location},
                        @AcceptedBy = {acceptedBy},
                        @Status = {status},
                        @CreatedAt = {createdAt},
                        @CreatedBy = {createdBy},
                        @UpdatedAt = {updatedAt},
                        @UpdatedBy = {updatedBy}
                ")
                .ToListAsync();
        }

        public async Task<FinishedGoodsHandoverDto?> GetByIdAsync(Guid id)
        {
            var results = await GetAllAsync(id: id);
            return results.FirstOrDefault();
        }

        public async Task<bool> CreateAsync(FinishedGoodsHandoverDto finishedGoodsHandoverDto)
        {
            if (finishedGoodsHandoverDto.Id == Guid.Empty)
            {
                finishedGoodsHandoverDto.Id = Guid.NewGuid();
            }

            await _context.Database.ExecuteSqlInterpolatedAsync($@"
                EXEC sp_InsertFinishedGoodsHandover

                    @Id = {finishedGoodsHandoverDto.Id},
                    @ProductId = {finishedGoodsHandoverDto.ProductId},
                    @ProductName = {finishedGoodsHandoverDto.ProductName},
                    @SKU = {finishedGoodsHandoverDto.SKU},
                    @Quantity = {finishedGoodsHandoverDto.Quantity},
                    @SourceFactoryLine = {finishedGoodsHandoverDto.SourceFactoryLine},
                    @Location = {finishedGoodsHandoverDto.Location},
                    @AcceptedBy = {finishedGoodsHandoverDto.AcceptedBy},
                    @Status = {finishedGoodsHandoverDto.Status},
                    @CreatedAt = {finishedGoodsHandoverDto.CreatedAt},
                    @CreatedBy = {finishedGoodsHandoverDto.CreatedBy},
                    @UpdatedAt = {finishedGoodsHandoverDto.UpdatedAt},
                    @UpdatedBy = {finishedGoodsHandoverDto.UpdatedBy}
            ");

            return true;
        }

        public async Task<bool> UpdateAsync(Guid id, FinishedGoodsHandoverDto finishedGoodsHandoverDto)
        {

            await _context.Database.ExecuteSqlInterpolatedAsync($@"
                EXEC sp_UpdateFinishedGoodsHandover

                    @Id = {finishedGoodsHandoverDto.Id},
                    @ProductId = {finishedGoodsHandoverDto.ProductId},
                    @ProductName = {finishedGoodsHandoverDto.ProductName},
                    @SKU = {finishedGoodsHandoverDto.SKU},
                    @Quantity = {finishedGoodsHandoverDto.Quantity},
                    @SourceFactoryLine = {finishedGoodsHandoverDto.SourceFactoryLine},
                    @Location = {finishedGoodsHandoverDto.Location},
                    @AcceptedBy = {finishedGoodsHandoverDto.AcceptedBy},
                    @Status = {finishedGoodsHandoverDto.Status},
                    @CreatedAt = {finishedGoodsHandoverDto.CreatedAt},
                    @CreatedBy = {finishedGoodsHandoverDto.CreatedBy},
                    @UpdatedAt = {finishedGoodsHandoverDto.UpdatedAt},
                    @UpdatedBy = {finishedGoodsHandoverDto.UpdatedBy}
            ");

            return true;
        }

        public async Task<bool> DeleteAsync(Guid id)
        {
            await _context.Database.ExecuteSqlInterpolatedAsync($@"
                EXEC sp_DeleteFinishedGoodsHandover
                    @Id = {id}
            ");

            return true;
        }

        // </crudgen:methods>
    }
}
