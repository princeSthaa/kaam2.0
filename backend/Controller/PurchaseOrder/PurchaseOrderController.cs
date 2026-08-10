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

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(Guid id)
        {
            var deleted = await _service.DeleteAsync(id);
            return deleted ? NoContent() : NotFound($"PurchaseOrder with ID {id} not found.");
        }
    }
}
