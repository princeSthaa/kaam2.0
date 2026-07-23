using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using backend.Dto.Customer;
using backend.Model;
using backend.Service.Customer;
using Microsoft.AspNetCore.Mvc;

namespace backend.Controller.Customer
{
    [ApiController]
    [Route("api/customer")]
    public class CustomerController : ControllerBase
    {
        private readonly ICustomerService _CustomerService;

        public CustomerController(ICustomerService CustomerService)
        {
            _CustomerService = CustomerService;
        }

        // <crudgen:actions>
        [HttpGet("{id}")] 
        public async Task<ActionResult<CustomerDto>> GetById(Guid id)
        {
            var item = await _CustomerService.GetByIdAsync(id);

            if (item == null)
            {
                return NotFound($"Customer with ID {id} not found.");
            }

            return Ok(item);
        }

        [HttpGet]
        public async Task<ActionResult<List<CustomerDto>>> GetAll(
            [FromQuery] Guid? id = null,
            [FromQuery] string? name = null,
            [FromQuery] string? email = null,
            [FromQuery] string? phone = null,
            [FromQuery] string? address = null,
            [FromQuery] string? type = null,
            [FromQuery] string? company = null,
            [FromQuery] string? panVat = null,
            [FromQuery] DateTime? createdAt = null,
            [FromQuery] string? createdBy = null,
            [FromQuery] DateTime? updatedAt = null,
            [FromQuery] string? updatedBy = null
        )
        {
            var items = await _CustomerService.GetAllAsync(
                id,
                name,
                email,
                phone,
                address,
                type,
                company,
                panVat,
                createdAt,
                createdBy,
                updatedAt,
                updatedBy
            );

            return Ok(items);
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] CustomerDto customerDto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var created = await _CustomerService.CreateAsync(customerDto);

            if (!created)
            {
                return BadRequest();
            }

            return Ok();
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(Guid id, [FromBody] CustomerDto customerDto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var updated = await _CustomerService.UpdateAsync(id, customerDto);

            if (!updated)
            {
                return NotFound($"Customer with ID {id} not found.");
            }

            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(Guid id)
        {
            var deleted = await _CustomerService.DeleteAsync(id);

            if (!deleted)
            {
                return NotFound($"Customer with ID {id} not found.");
            }

            return NoContent();
        }
        // </crudgen:actions>
    }
}
