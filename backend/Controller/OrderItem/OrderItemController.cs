using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using backend.Dto.OrderItem;
using backend.Model;
using backend.Service.OrderItem;
using Microsoft.AspNetCore.Mvc;

namespace backend.Controller.OrderItem
{
    [ApiController]
    [Route("api/order-item")]
    public class OrderItemController : ControllerBase
    {
        private readonly IOrderItemService _OrderItemService;

        public OrderItemController(IOrderItemService OrderItemService)
        {
            _OrderItemService = OrderItemService;
        }

        // <crudgen:actions>
        [HttpGet("{id}")] 
        public async Task<ActionResult<OrderItemDto>> GetById(Guid id)
        {
            var item = await _OrderItemService.GetByIdAsync(id);

            if (item == null)
            {
                return NotFound($"OrderItem with ID {id} not found.");
            }

            return Ok(item);
        }

        [HttpGet]
        public async Task<ActionResult<List<OrderItemDto>>> GetAll(
            [FromQuery] Guid? id = null,
            [FromQuery] int? quantity = null,
            [FromQuery] decimal? unitPrice = null,
            [FromQuery] decimal? totalPrice = null,
            [FromQuery] decimal? discount = null,
            [FromQuery] DateTime? createdAt = null,
            [FromQuery] string? createdBy = null,
            [FromQuery] DateTime? updatedAt = null,
            [FromQuery] string? updatedBy = null,
            [FromQuery] Guid? orderId = null
        )
        {
            var items = await _OrderItemService.GetAllAsync(
                id,
                quantity,
                unitPrice,
                totalPrice,
                discount,
                createdAt,
                createdBy,
                updatedAt,
                updatedBy,
                orderId
            );

            return Ok(items);
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] OrderItemDto orderItemDto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var created = await _OrderItemService.CreateAsync(orderItemDto);

            if (!created)
            {
                return BadRequest();
            }

            return Ok();
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(Guid id, [FromBody] OrderItemDto orderItemDto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var updated = await _OrderItemService.UpdateAsync(id, orderItemDto);

            if (!updated)
            {
                return NotFound($"OrderItem with ID {id} not found.");
            }

            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(Guid id)
        {
            var deleted = await _OrderItemService.DeleteAsync(id);

            if (!deleted)
            {
                return NotFound($"OrderItem with ID {id} not found.");
            }

            return NoContent();
        }
        // </crudgen:actions>
    }
}

