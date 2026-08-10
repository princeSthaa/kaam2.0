using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using backend.Dto.PurchaseOrder;
using backend.Service.PurchaseOrder;

namespace backend.Controller.PurchaseOrder
{
    [ApiController]
    [Route("api/purchase-order-item")]
    public class PurchaseOrderItemController : ControllerBase
    {
        private readonly IPurchaseOrderService _service;

        public PurchaseOrderItemController(IPurchaseOrderService service)
        {
            _service = service;
        }

        [HttpGet("order/{purchaseOrderId}")]
        public async Task<ActionResult<List<PurchaseOrderItemDto>>> GetByPurchaseOrderId(Guid purchaseOrderId)
        {
            var items = await _service.GetItemsByPurchaseOrderIdAsync(purchaseOrderId);
            return Ok(items);
        }

        [HttpPost("{purchaseOrderId}")]
        public async Task<ActionResult<PurchaseOrderItemDto>> AddItem(Guid purchaseOrderId, [FromBody] PurchaseOrderItemDto itemDto)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);

            var added = await _service.AddItemAsync(purchaseOrderId, itemDto);
            if (added == null) return NotFound($"PurchaseOrder with ID {purchaseOrderId} not found.");

            return Ok(added);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateItem(Guid id, [FromBody] PurchaseOrderItemDto itemDto)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);

            var updated = await _service.UpdateItemAsync(id, itemDto);
            return updated ? NoContent() : NotFound($"PurchaseOrderItem with ID {id} not found.");
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteItem(Guid id)
        {
            var deleted = await _service.DeleteItemAsync(id);
            return deleted ? NoContent() : NotFound($"PurchaseOrderItem with ID {id} not found.");
        }
    }
}
