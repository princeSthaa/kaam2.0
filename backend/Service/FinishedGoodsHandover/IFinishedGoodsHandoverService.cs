using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using backend.Dto.FinishedGoodsHandover;
using backend.Model;

namespace backend.Service.FinishedGoodsHandover
{
    public interface IFinishedGoodsHandoverService
    {
        // <crudgen:method-signatures>
        Task<List<FinishedGoodsHandoverDto>> GetAllAsync(
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
        );

        Task<FinishedGoodsHandoverDto?> GetByIdAsync(Guid id);

        Task<bool> CreateAsync(FinishedGoodsHandoverDto finishedGoodsHandoverDto);

        Task<bool> UpdateAsync(Guid id, FinishedGoodsHandoverDto finishedGoodsHandoverDto);

        Task<bool> DeleteAsync(Guid id);

        // </crudgen:method-signatures>
    }
}
