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
            string? id = null,
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

        Task<bool> CreateAsync(TransactionDto transactionDto);

        Task<bool> UpdateAsync(string id, TransactionDto transactionDto);

        Task<bool> DeleteAsync(string id);

        // </crudgen:method-signatures>
    }
}
