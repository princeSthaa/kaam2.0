using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using backend.Dto.Order;
using backend.Model;
using backend.Model.Enums;
using backend.Service.Order;
using Microsoft.AspNetCore.Mvc;

namespace backend.Controller.Order
{
    [ApiController]
    [Route("api/order")]
    public class OrderController : ControllerBase
    {
        private readonly IOrderService _OrderService;

        public OrderController(IOrderService OrderService)
        {
            _OrderService = OrderService;
        }

        // <crudgen:actions>
        [HttpGet]
        public async Task<ActionResult<List<OrderDto>>> GetAll(
            [FromQuery] string? id = null,
            [FromQuery] string? orderNumber = null,
            [FromQuery] OrderStatus? status = null,
            [FromQuery] decimal? totalAmount = null,
            [FromQuery] DateTime? dueDate = null,
            [FromQuery] DateTime? createdAt = null,
            [FromQuery] string? createdBy = null,
            [FromQuery] DateTime? updatedAt = null,
            [FromQuery] string? updatedBy = null,
            [FromQuery] string? customerId = null
        )
        {
            var items = await _OrderService.GetAllAsync(
                id,
                orderNumber,
                status,
                totalAmount,
                dueDate,
                createdAt,
                createdBy,
                updatedAt,
                updatedBy,
                customerId
            );

            return Ok(items);
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] OrderDto orderDto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var created = await _OrderService.CreateAsync(orderDto);

            if (!created)
            {
                return BadRequest();
            }

            return Ok();
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(string id, [FromBody] OrderDto orderDto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var updated = await _OrderService.UpdateAsync(id, orderDto);

            if (!updated)
            {
                return NotFound($"Order with ID {id} not found.");
            }

            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(string id)
        {
            var deleted = await _OrderService.DeleteAsync(id);

            if (!deleted)
            {
                return NotFound($"Order with ID {id} not found.");
            }

            return NoContent();
        }
        // </crudgen:actions>
    }
}

