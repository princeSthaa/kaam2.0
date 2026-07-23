using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Text.Json;
using System.Threading.Tasks;
using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;
using backend.Data;
using backend.Dto.MaterialIssue;
using backend.Model;

namespace backend.Service.MaterialIssue
{
    public class MaterialIssueService : IMaterialIssueService
    {
        private readonly AppDbContext _context;

        public MaterialIssueService(AppDbContext context)
        {
            _context = context;
        }

        // <crudgen:methods>
        public async Task<List<MaterialIssueDto>> GetAllAsync(
            Guid? id = null,
            string? materialId = null,
            decimal? issueQuantity = null,
            string? targetDestination = null,
            string? issuedTo = null,
            string? notes = null,
            string? status = null,
            DateTime? createdAt = null,
            string? createdBy = null,
            DateTime? updatedAt = null,
            string? updatedBy = null
        )
        {
            return await _context.Database
                .SqlQuery<MaterialIssueDto>($@"
                    EXEC sp_GetMaterialIssues

                        @Id = {id},
                        @MaterialId = {materialId},
                        @IssueQuantity = {issueQuantity},
                        @TargetDestination = {targetDestination},
                        @IssuedTo = {issuedTo},
                        @Notes = {notes},
                        @Status = {status},
                        @CreatedAt = {createdAt},
                        @CreatedBy = {createdBy},
                        @UpdatedAt = {updatedAt},
                        @UpdatedBy = {updatedBy}
                ")
                .ToListAsync();
        }

        public async Task<MaterialIssueDto?> GetByIdAsync(Guid id)
        {
            var results = await GetAllAsync(id: id);
            return results.FirstOrDefault();
        }

        public async Task<bool> CreateAsync(MaterialIssueDto materialIssueDto)
        {
            if (materialIssueDto.Id == Guid.Empty)
            {
                materialIssueDto.Id = Guid.NewGuid();
            }

            await _context.Database.ExecuteSqlInterpolatedAsync($@"
                EXEC sp_InsertMaterialIssue

                    @Id = {materialIssueDto.Id},
                    @MaterialId = {materialIssueDto.MaterialId},
                    @IssueQuantity = {materialIssueDto.IssueQuantity},
                    @TargetDestination = {materialIssueDto.TargetDestination},
                    @IssuedTo = {materialIssueDto.IssuedTo},
                    @Notes = {materialIssueDto.Notes},
                    @Status = {materialIssueDto.Status},
                    @CreatedAt = {materialIssueDto.CreatedAt},
                    @CreatedBy = {materialIssueDto.CreatedBy},
                    @UpdatedAt = {materialIssueDto.UpdatedAt},
                    @UpdatedBy = {materialIssueDto.UpdatedBy}
            ");

            return true;
        }

        public async Task<bool> UpdateAsync(Guid id, MaterialIssueDto materialIssueDto)
        {

            await _context.Database.ExecuteSqlInterpolatedAsync($@"
                EXEC sp_UpdateMaterialIssue

                    @Id = {materialIssueDto.Id},
                    @MaterialId = {materialIssueDto.MaterialId},
                    @IssueQuantity = {materialIssueDto.IssueQuantity},
                    @TargetDestination = {materialIssueDto.TargetDestination},
                    @IssuedTo = {materialIssueDto.IssuedTo},
                    @Notes = {materialIssueDto.Notes},
                    @Status = {materialIssueDto.Status},
                    @CreatedAt = {materialIssueDto.CreatedAt},
                    @CreatedBy = {materialIssueDto.CreatedBy},
                    @UpdatedAt = {materialIssueDto.UpdatedAt},
                    @UpdatedBy = {materialIssueDto.UpdatedBy}
            ");

            return true;
        }

        public async Task<bool> DeleteAsync(Guid id)
        {
            await _context.Database.ExecuteSqlInterpolatedAsync($@"
                EXEC sp_DeleteMaterialIssue
                    @Id = {id}
            ");

            return true;
        }

        // </crudgen:methods>
    }
}
