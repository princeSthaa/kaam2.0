using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using backend.Dto.CustomerReturn;
using backend.Model;
using backend.Service.CustomerReturn;
using Microsoft.AspNetCore.Mvc;

namespace backend.Controller.CustomerReturn
{
    [ApiController]
    [Route("api/customer-return")]
    public class CustomerReturnController : ControllerBase
    {
        private readonly ICustomerReturnService _CustomerReturnService;

        public CustomerReturnController(ICustomerReturnService CustomerReturnService)
        {
            _CustomerReturnService = CustomerReturnService;
        }

        // <crudgen:actions>
        [HttpGet("{id}")] 
        public async Task<ActionResult<CustomerReturnDto>> GetById(Guid id)
        {
            var item = await _CustomerReturnService.GetByIdAsync(id);

            if (item == null)
            {
                return NotFound($"CustomerReturn with ID {id} not found.");
            }

            return Ok(item);
        }

        [HttpGet]
        public async Task<ActionResult<List<CustomerReturnDto>>> GetAll(
            [FromQuery] Guid? id = null,
            [FromQuery] string? orderNumber = null,
            [FromQuery] string? customerName = null,
            [FromQuery] string? productId = null,
            [FromQuery] int? returnedQuantity = null,
            [FromQuery] string? reason = null,
            [FromQuery] string? notes = null,
            [FromQuery] string? processedBy = null,
            [FromQuery] DateTime? createdAt = null,
            [FromQuery] string? createdBy = null,
            [FromQuery] DateTime? updatedAt = null,
            [FromQuery] string? updatedBy = null
        )
        {
            var items = await _CustomerReturnService.GetAllAsync(
                id,
                orderNumber,
                customerName,
                productId,
                returnedQuantity,
                reason,
                notes,
                processedBy,
                createdAt,
                createdBy,
                updatedAt,
                updatedBy
            );

            return Ok(items);
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] CustomerReturnDto customerReturnDto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var created = await _CustomerReturnService.CreateAsync(customerReturnDto);

            if (!created)
            {
                return BadRequest();
            }

            return Ok();
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(Guid id, [FromBody] CustomerReturnDto customerReturnDto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var updated = await _CustomerReturnService.UpdateAsync(id, customerReturnDto);

            if (!updated)
            {
                return NotFound($"CustomerReturn with ID {id} not found.");
            }

            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(Guid id)
        {
            var deleted = await _CustomerReturnService.DeleteAsync(id);

            if (!deleted)
            {
                return NotFound($"CustomerReturn with ID {id} not found.");
            }

            return NoContent();
        }
        // </crudgen:actions>
    }
}
