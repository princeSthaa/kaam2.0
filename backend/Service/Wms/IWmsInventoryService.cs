using System;
using System.Threading.Tasks;

namespace backend.Service.Wms
{
    public interface IWmsInventoryService
    {
        Task PutAwayInventoryAsync(Guid stagingInventoryId, Guid targetWarehouseShelfId, decimal quantity, string handledBy);
        Task TransferInventoryAsync(Guid sourceInventoryId, Guid targetWarehouseShelfId, decimal quantity, string handledBy);
    }
}
