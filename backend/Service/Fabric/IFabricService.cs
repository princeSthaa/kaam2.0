using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using backend.Dto.Fabric;
using backend.Model;

namespace backend.Service.Fabric
{
    public interface IFabricService
    {
        // <crudgen:method-signatures>
        Task<List<FabricDto>> GetAllAsync(
            string? id = null,
            string? name = null,
            string? category = null,
            string? imagePath = null,
            decimal? unitPrice = null,
            DateTime? createdAt = null,
            string? createdBy = null,
            DateTime? updatedAt = null,
            string? updatedBy = null
        );

        Task<bool> CreateAsync(FabricDto fabricDto);

        Task<bool> UpdateAsync(string id, FabricDto fabricDto);

        Task<bool> DeleteAsync(string id);

        // </crudgen:method-signatures>
    }
}
