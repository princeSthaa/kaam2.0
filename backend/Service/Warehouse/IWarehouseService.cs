using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using backend.Dto.Warehouse;
using backend.Model;

namespace backend.Service.Warehouse
{
    public interface IWarehouseService
    {
        // <crudgen:method-signatures>
        Task<List<WarehouseDto>> GetAllAsync(
            string? id = null,
            string? code = null,
            string? name = null,
            string? location = null,
            DateTime? createdAt = null,
            string? createdBy = null,
            DateTime? updatedAt = null,
            string? updatedBy = null
        );

        Task<bool> CreateAsync(WarehouseDto warehouseDto);

        Task<bool> UpdateAsync(string id, WarehouseDto warehouseDto);

        Task<bool> DeleteAsync(string id);

        Task<(bool Success, string Message)> ProcessSupplierInspectionAsync(SupplierInspectionDto dto);

        Task<(bool Success, string Message)> AcceptFinishedGoodsAsync(FinishedGoodsAcceptanceDto dto);

        Task<(bool Success, string Message)> InitiateProductSaleAsync(ProductSaleDispatchDto dto);

        Task<(bool Success, string Message)> ProcessCustomerReturnAsync(CustomerReturnDto dto);

        Task<object> GetKpisAsync();

        Task<object> GetShelvesPreviewAsync();

        Task<object> GetStockAsync();

        Task<object> GetVisualizationDataAsync();

        // </crudgen:method-signatures>
    }
}
