using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using backend.Dto.MaterialIssue;
using backend.Model;

namespace backend.Service.MaterialIssue
{
    public interface IMaterialIssueService
    {
        // <crudgen:method-signatures>
        Task<List<MaterialIssueDto>> GetAllAsync(
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
        );

        Task<MaterialIssueDto?> GetByIdAsync(Guid id);

        Task<bool> CreateAsync(MaterialIssueDto materialIssueDto);

        Task<bool> UpdateAsync(Guid id, MaterialIssueDto materialIssueDto);

        Task<bool> DeleteAsync(Guid id);

        // </crudgen:method-signatures>
    }
}
