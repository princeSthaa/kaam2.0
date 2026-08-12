using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using backend.Dto.PurchaseOrderReceipt;
using backend.Service.PurchaseOrderReceipt;

namespace backend.Controller.PurchaseOrderReceipt
{
    [ApiController]
    [Route("api/purchase-order-receipt")]
    public class PurchaseOrderReceiptController : ControllerBase
    {
        private readonly IPurchaseOrderReceiptService _service;

        public PurchaseOrderReceiptController(IPurchaseOrderReceiptService service, backend.Data.AppDbContext context)
        {
            _service = service;
        }

        [HttpGet]
        public async Task<ActionResult<List<PurchaseOrderReceiptDto>>> GetAll(
            [FromQuery] Guid? id = null,
            [FromQuery] Guid? purchaseOrderId = null,
            [FromQuery] string? receiptNumber = null
        )
        {
            var list = await _service.GetAllAsync(id, purchaseOrderId, receiptNumber);
            return Ok(list);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<PurchaseOrderReceiptDto>> GetById(Guid id)
        {
            var item = await _service.GetByIdAsync(id);
            if (item == null) return NotFound($"Receipt with ID {id} not found.");
            return Ok(item);
        }

        [HttpPost]
        public async Task<ActionResult<PurchaseOrderReceiptDto>> ReceiveMaterials([FromBody] PurchaseOrderReceiptDto dto)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);

            try
            {
                var created = await _service.ReceiveMaterialsAsync(dto);
                return Ok(created);
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(Guid id, [FromBody] PurchaseOrderReceiptDto dto)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);

            var updated = await _service.UpdateReceiptAsync(id, dto);
            return updated ? NoContent() : NotFound($"Receipt with ID {id} not found.");
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(Guid id)
        {
            var deleted = await _service.DeleteReceiptAsync(id);
            return deleted ? NoContent() : NotFound($"Receipt with ID {id} not found.");
        }
    }
}
