using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Text.Json;
using System.Threading.Tasks;
using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;
using backend.Data;
using backend.Dto.Transaction;
using backend.Model;

namespace backend.Service.Transaction
{
    public class TransactionService : ITransactionService
    {
        private readonly AppDbContext _context;

        public TransactionService(AppDbContext context)
        {
            _context = context;
        }

        // <crudgen:methods>
        public async Task<List<TransactionDto>> GetAllAsync(
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
        )
        {
            return await _context.Database
                .SqlQuery<TransactionDto>($@"
                    EXEC sp_GetTransactions

                        @Id = {id},
                        @Timestamp = {timestamp},
                        @TransactionType = {transactionType},
                        @Amount = {amount},
                        @PaymentMethod = {paymentMethod},
                        @ReferenceEntity = {referenceEntity},
                        @HandledBy = {handledBy},
                        @Notes = {notes},
                        @Status = {status},
                        @CreatedAt = {createdAt},
                        @CreatedBy = {createdBy},
                        @UpdatedAt = {updatedAt},
                        @UpdatedBy = {updatedBy}
                ")
                .ToListAsync();
        }

        public async Task<TransactionDto?> GetByIdAsync(Guid id)
        {
            var results = await GetAllAsync(id: id);
            return results.FirstOrDefault();
        }

        public async Task<bool> CreateAsync(TransactionDto transactionDto)
        {
            if (transactionDto.Id == Guid.Empty)
            {
                transactionDto.Id = Guid.NewGuid();
            }

            await _context.Database.ExecuteSqlInterpolatedAsync($@"
                EXEC sp_InsertTransaction

                    @Id = {transactionDto.Id},
                    @Timestamp = {transactionDto.Timestamp},
                    @TransactionType = {transactionDto.TransactionType},
                    @Amount = {transactionDto.Amount},
                    @PaymentMethod = {transactionDto.PaymentMethod},
                    @ReferenceEntity = {transactionDto.ReferenceEntity},
                    @HandledBy = {transactionDto.HandledBy},
                    @Notes = {transactionDto.Notes},
                    @Status = {transactionDto.Status},
                    @CreatedAt = {transactionDto.CreatedAt},
                    @CreatedBy = {transactionDto.CreatedBy},
                    @UpdatedAt = {transactionDto.UpdatedAt},
                    @UpdatedBy = {transactionDto.UpdatedBy}
            ");

            return true;
        }

        public async Task<bool> UpdateAsync(Guid id, TransactionDto transactionDto)
        {

            await _context.Database.ExecuteSqlInterpolatedAsync($@"
                EXEC sp_UpdateTransaction

                    @Id = {transactionDto.Id},
                    @Timestamp = {transactionDto.Timestamp},
                    @TransactionType = {transactionDto.TransactionType},
                    @Amount = {transactionDto.Amount},
                    @PaymentMethod = {transactionDto.PaymentMethod},
                    @ReferenceEntity = {transactionDto.ReferenceEntity},
                    @HandledBy = {transactionDto.HandledBy},
                    @Notes = {transactionDto.Notes},
                    @Status = {transactionDto.Status},
                    @CreatedAt = {transactionDto.CreatedAt},
                    @CreatedBy = {transactionDto.CreatedBy},
                    @UpdatedAt = {transactionDto.UpdatedAt},
                    @UpdatedBy = {transactionDto.UpdatedBy}
            ");

            return true;
        }

        public async Task<bool> DeleteAsync(Guid id)
        {
            await _context.Database.ExecuteSqlInterpolatedAsync($@"
                EXEC sp_DeleteTransaction
                    @Id = {id}
            ");

            return true;
        }

        // </crudgen:methods>
    }
}
