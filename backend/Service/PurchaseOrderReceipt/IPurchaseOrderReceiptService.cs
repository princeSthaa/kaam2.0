using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using backend.Dto.PurchaseOrderReceipt;

namespace backend.Service.PurchaseOrderReceipt
{
    public interface IPurchaseOrderReceiptService
    {
        Task<List<PurchaseOrderReceiptDto>> GetAllAsync(
            Guid? id = null,
            Guid? purchaseOrderId = null,
            string? receiptNumber = null
        );

        Task<PurchaseOrderReceiptDto?> GetByIdAsync(Guid id);
        Task<PurchaseOrderReceiptDto?> ReceiveMaterialsAsync(PurchaseOrderReceiptDto dto);
        Task<bool> UpdateReceiptAsync(Guid id, PurchaseOrderReceiptDto dto);
        Task<bool> DeleteReceiptAsync(Guid id);
    }
}
