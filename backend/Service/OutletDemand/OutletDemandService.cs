using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Text.Json;
using System.Threading.Tasks;
using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;
using backend.Data;
using backend.Dto.OutletDemand;
using backend.Model;

namespace backend.Service.OutletDemand
{
    public class OutletDemandService : IOutletDemandService
    {
        private readonly AppDbContext _context;

        public OutletDemandService(AppDbContext context)
        {
            _context = context;
        }

        // <crudgen:methods>
        public async Task<List<OutletDemandDto>> GetAllAsync(
            Guid? id = null,
            string? demandNumber = null,
            string? status = null,
            DateTime? dueDate = null,
            DateTime? createdAt = null,
            string? createdBy = null,
            DateTime? updatedAt = null,
            string? updatedBy = null,
            Guid? outletId = null
        )
        {
            return await _context.Database
                .SqlQuery<OutletDemandDto>($@"
                    EXEC sp_GetOutletDemands

                        @Id = {id},
                        @DemandNumber = {demandNumber},
                        @Status = {status},
                        @DueDate = {dueDate},
                        @CreatedAt = {createdAt},
                        @CreatedBy = {createdBy},
                        @UpdatedAt = {updatedAt},
                        @UpdatedBy = {updatedBy},
                        @OutletId = {outletId}
                ")
                .ToListAsync();
        }

        public async Task<OutletDemandDto?> GetByIdAsync(Guid id)
        {
            var results = await GetAllAsync(id: id);
            return results.FirstOrDefault();
        }

        public async Task<bool> CreateAsync(OutletDemandDto outletDemandDto)
        {
            if (outletDemandDto.Id == Guid.Empty)
            {
                outletDemandDto.Id = Guid.NewGuid();
            }

            await _context.Database.ExecuteSqlInterpolatedAsync($@"
                EXEC sp_InsertOutletDemand

                    @Id = {outletDemandDto.Id},
                    @DemandNumber = {outletDemandDto.DemandNumber},
                    @Status = {outletDemandDto.Status},
                    @DueDate = {outletDemandDto.DueDate},
                    @CreatedAt = {outletDemandDto.CreatedAt},
                    @CreatedBy = {outletDemandDto.CreatedBy},
                    @UpdatedAt = {outletDemandDto.UpdatedAt},
                    @UpdatedBy = {outletDemandDto.UpdatedBy},
                    @OutletId = {outletDemandDto.OutletId}
            ");

            return true;
        }

        public async Task<bool> UpdateAsync(Guid id, OutletDemandDto outletDemandDto)
        {

            await _context.Database.ExecuteSqlInterpolatedAsync($@"
                EXEC sp_UpdateOutletDemand

                    @Id = {outletDemandDto.Id},
                    @DemandNumber = {outletDemandDto.DemandNumber},
                    @Status = {outletDemandDto.Status},
                    @DueDate = {outletDemandDto.DueDate},
                    @CreatedAt = {outletDemandDto.CreatedAt},
                    @CreatedBy = {outletDemandDto.CreatedBy},
                    @UpdatedAt = {outletDemandDto.UpdatedAt},
                    @UpdatedBy = {outletDemandDto.UpdatedBy},
                    @OutletId = {outletDemandDto.OutletId}
            ");

            return true;
        }

        public async Task<bool> DeleteAsync(Guid id)
        {
            await _context.Database.ExecuteSqlInterpolatedAsync($@"
                EXEC sp_DeleteOutletDemand
                    @Id = {id}
            ");

            return true;
        }

        // </crudgen:methods>
    }
}

