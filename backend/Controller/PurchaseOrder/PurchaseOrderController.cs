using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using backend.Dto.PurchaseOrder;
using backend.Model.Enums;
using backend.Service.PurchaseOrder;

namespace backend.Controller.PurchaseOrder
{
    [ApiController]
    [Route("api/purchase-order")]
    public class PurchaseOrderController : ControllerBase
    {
        private readonly IPurchaseOrderService _service;

        public PurchaseOrderController(IPurchaseOrderService service)
        {
            _service = service;
        }

        [HttpGet]
        public async Task<ActionResult<List<PurchaseOrderGetDto>>> GetAll(
            [FromQuery] Guid? id = null,
            [FromQuery] string? orderNumber = null,
            [FromQuery] OrderStatus? status = null,
            [FromQuery] Guid? supplierId = null,
            [FromQuery] Guid? materialCategoryId = null
        )
        {
            var list = await _service.GetAllAsync(id, orderNumber, status, supplierId, materialCategoryId);
            return Ok(list);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<PurchaseOrderGetDto>> GetById(Guid id)
        {
            var item = await _service.GetByIdAsync(id);
            if (item == null)
            {
                return NotFound($"PurchaseOrder with ID {id} not found.");
            }
            return Ok(item);
        }

        [HttpPost]
        public async Task<ActionResult<PurchaseOrderGetDto>> Create([FromBody] PurchaseOrderDto dto)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);

            try
            {
                var created = await _service.CreateAsync(dto);
                if (created == null) return BadRequest();
                return Ok(created);
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(Guid id, [FromBody] PurchaseOrderDto dto)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);

            try
            {
                var updated = await _service.UpdateAsync(id, dto);
                return updated ? NoContent() : NotFound($"PurchaseOrder with ID {id} not found.");
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPut("{id}/status")]
        public async Task<IActionResult> UpdateStatus(Guid id, [FromBody] backend.Dto.PurchaseOrder.PurchaseOrderStatusUpdateDto dto)
        {
            try
            {
                var po = await _service.GetByIdAsync(id);
                if (po == null) return NotFound($"PurchaseOrder with ID {id} not found.");

                if (!Enum.TryParse<OrderStatus>(dto.Status, true, out var newStatus))
                {
                    return BadRequest("Invalid status.");
                }

                var updateDto = new PurchaseOrderDto
                {
                    Id = po.Id,
                    OrderNumber = po.OrderNumber,
                    Status = newStatus,
                    SupplierId = po.SupplierId,
                    MaterialCategoryId = po.MaterialCategoryId,
                    ShippingMethod = po.ShippingMethod,
                    ShippingAddress = po.ShippingAddress,
                    PaymentTerms = po.PaymentTerms,
                    ExpectedDeliveryDate = po.ExpectedDeliveryDate,
                    Items = po.Items.Select(i => new backend.Dto.PurchaseOrder.PurchaseOrderItemDto
                    {
                        Id = i.Id,
                        MaterialId = i.MaterialId,
                        OrderedQuantity = i.OrderedQuantity,
                        UnitPrice = i.UnitPrice
                    }).ToList()
                };

                var updated = await _service.UpdateAsync(id, updateDto);
                if (updated)
                {
                    var updatedPo = await _service.GetByIdAsync(id);
                    return Ok(updatedPo);
                }
                return NotFound();
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(Guid id)
        {
            var deleted = await _service.DeleteAsync(id);
            return deleted ? NoContent() : NotFound($"PurchaseOrder with ID {id} not found.");
        }
    }
}
