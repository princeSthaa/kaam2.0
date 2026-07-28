using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using backend.Dto.OrderItemSize;
using backend.Model;
using backend.Model.Enums;
using backend.Service.OrderItemSize;
using Microsoft.AspNetCore.Mvc;

namespace backend.Controller.OrderItemSize
{
    [ApiController]
    [Route("api/order-item-size")]
    public class OrderItemSizeController : ControllerBase
    {
        private readonly IOrderItemSizeService _OrderItemSizeService;

        public OrderItemSizeController(IOrderItemSizeService OrderItemSizeService)
        {
            _OrderItemSizeService = OrderItemSizeService;
        }

        // <crudgen:actions>
        [HttpGet("{id}")] 
        public async Task<ActionResult<OrderItemSizeGetDto>> GetById(Guid id)
        {
            var item = await _OrderItemSizeService.GetByIdAsync(id);

            if (item == null)
            {
                return NotFound($"OrderItemSize with ID {id} not found.");
            }

            return Ok(item);
        }

        [HttpGet]
        public async Task<ActionResult<List<OrderItemSizeGetDto>>> GetAll(
            [FromQuery] Guid? id = null,
            [FromQuery] ProductSize? size = null,
            [FromQuery] int? quantity = null,
            [FromQuery] DateTime? createdAt = null,
            [FromQuery] string? createdBy = null,
            [FromQuery] DateTime? updatedAt = null,
            [FromQuery] string? updatedBy = null,
            [FromQuery] Guid? orderItemId = null
        )
        {
            var items = await _OrderItemSizeService.GetAllAsync(
                id,
                size,
                quantity,
                createdAt,
                createdBy,
                updatedAt,
                updatedBy,
                orderItemId
            );

            return Ok(items);
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] OrderItemSizeDto orderItemSizeDto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var created = await _OrderItemSizeService.CreateAsync(orderItemSizeDto);

            if (!created)
            {
                return BadRequest();
            }

            return Ok();
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(Guid id, [FromBody] OrderItemSizeDto orderItemSizeDto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var updated = await _OrderItemSizeService.UpdateAsync(id, orderItemSizeDto);

            if (!updated)
            {
                return NotFound($"OrderItemSize with ID {id} not found.");
            }

            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(Guid id)
        {
            var deleted = await _OrderItemSizeService.DeleteAsync(id);

            if (!deleted)
            {
                return NotFound($"OrderItemSize with ID {id} not found.");
            }

            return NoContent();
        }
        // </crudgen:actions>
    }
}
