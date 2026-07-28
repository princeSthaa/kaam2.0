using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using backend.Dto.OrderItemMaterial;
using backend.Model;
using backend.Service.OrderItemMaterial;
using Microsoft.AspNetCore.Mvc;

namespace backend.Controller.OrderItemMaterial
{
    [ApiController]
    [Route("api/order-item-material")]
    public class OrderItemMaterialController : ControllerBase
    {
        private readonly IOrderItemMaterialService _OrderItemMaterialService;

        public OrderItemMaterialController(IOrderItemMaterialService OrderItemMaterialService)
        {
            _OrderItemMaterialService = OrderItemMaterialService;
        }

        // <crudgen:actions>
        [HttpGet("{id}")] 
        public async Task<ActionResult<OrderItemMaterialGetDto>> GetById(Guid id)
        {
            var item = await _OrderItemMaterialService.GetByIdAsync(id);

            if (item == null)
            {
                return NotFound($"OrderItemMaterial with ID {id} not found.");
            }

            return Ok(item);
        }

        [HttpGet]
        public async Task<ActionResult<List<OrderItemMaterialGetDto>>> GetAll(
            [FromQuery] Guid? id = null,
            [FromQuery] decimal? requiredQuantity = null,
            [FromQuery] string? unit = null,
            [FromQuery] DateTime? createdAt = null,
            [FromQuery] string? createdBy = null,
            [FromQuery] DateTime? updatedAt = null,
            [FromQuery] string? updatedBy = null,
            [FromQuery] Guid? orderItemId = null
        )
        {
            var items = await _OrderItemMaterialService.GetAllAsync(
                id,
                requiredQuantity,
                unit,
                createdAt,
                createdBy,
                updatedAt,
                updatedBy,
                orderItemId
            );

            return Ok(items);
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] OrderItemMaterialDto orderItemMaterialDto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var created = await _OrderItemMaterialService.CreateAsync(orderItemMaterialDto);

            if (!created)
            {
                return BadRequest();
            }

            return Ok();
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(Guid id, [FromBody] OrderItemMaterialDto orderItemMaterialDto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var updated = await _OrderItemMaterialService.UpdateAsync(id, orderItemMaterialDto);

            if (!updated)
            {
                return NotFound($"OrderItemMaterial with ID {id} not found.");
            }

            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(Guid id)
        {
            var deleted = await _OrderItemMaterialService.DeleteAsync(id);

            if (!deleted)
            {
                return NotFound($"OrderItemMaterial with ID {id} not found.");
            }

            return NoContent();
        }
        // </crudgen:actions>
    }
}
