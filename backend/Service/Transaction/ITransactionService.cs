using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using backend.Dto.Transaction;
using backend.Model;

namespace backend.Service.Transaction
{
    public interface ITransactionService
    {
        // <crudgen:method-signatures>
        Task<List<TransactionDto>> GetAllAsync(
            Guid? id = null,
            DateTime? timestamp = null,
            string? transactionType = null,
            decimal? amount = null,
            string? paymentMethod = null,
            string? referenceEntity = null,
            string? handledBy = null,
            string? notes = null,
            string? status = null,
            DateTime? createdAt = null,
            string? createdBy = null,
            DateTime? updatedAt = null,
            string? updatedBy = null
        );

        Task<TransactionDto?> GetByIdAsync(Guid id);

        Task<bool> CreateAsync(TransactionDto transactionDto);

        Task<bool> UpdateAsync(Guid id, TransactionDto transactionDto);

        Task<bool> DeleteAsync(Guid id);

        // </crudgen:method-signatures>
    }
}
