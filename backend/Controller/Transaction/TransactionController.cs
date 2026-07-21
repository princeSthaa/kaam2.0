using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using backend.Dto.Transaction;
using backend.Model;
using backend.Service.Transaction;
using Microsoft.AspNetCore.Mvc;

namespace backend.Controller.Transaction
{
    [ApiController]
    [Route("api/transaction")]
    public class TransactionController : ControllerBase
    {
        private readonly ITransactionService _TransactionService;

        public TransactionController(ITransactionService TransactionService)
        {
            _TransactionService = TransactionService;
        }

        // <crudgen:actions>
        [HttpGet]
        public async Task<ActionResult<List<TransactionDto>>> GetAll(
            [FromQuery] string? id = null,
            [FromQuery] DateTime? timestamp = null,
            [FromQuery] string? transactionType = null,
            [FromQuery] decimal? amount = null,
            [FromQuery] string? paymentMethod = null,
            [FromQuery] string? referenceEntity = null,
            [FromQuery] string? handledBy = null,
            [FromQuery] string? notes = null,
            [FromQuery] string? status = null,
            [FromQuery] DateTime? createdAt = null,
            [FromQuery] string? createdBy = null,
            [FromQuery] DateTime? updatedAt = null,
            [FromQuery] string? updatedBy = null
        )
        {
            var items = await _TransactionService.GetAllAsync(
                id,
                timestamp,
                transactionType,
                amount,
                paymentMethod,
                referenceEntity,
                handledBy,
                notes,
                status,
                createdAt,
                createdBy,
                updatedAt,
                updatedBy
            );

            return Ok(items);
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] TransactionDto transactionDto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var created = await _TransactionService.CreateAsync(transactionDto);

            if (!created)
            {
                return BadRequest();
            }

            return Ok();
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(string id, [FromBody] TransactionDto transactionDto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var updated = await _TransactionService.UpdateAsync(id, transactionDto);

            if (!updated)
            {
                return NotFound($"Transaction with ID {id} not found.");
            }

            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(string id)
        {
            var deleted = await _TransactionService.DeleteAsync(id);

            if (!deleted)
            {
                return NotFound($"Transaction with ID {id} not found.");
            }

            return NoContent();
        }
        // </crudgen:actions>
    }
}
