using backend.Dto.Customer;
using backend.Service.Customer;
using Microsoft.AspNetCore.Mvc;

namespace backend.Controller.Customer
{
    [ApiController]
    [Route("api/customer")]
    public class CustomerController : ControllerBase
    {
        private readonly ICustomerService _service;

        public CustomerController(ICustomerService service)
        {
            _service = service;
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] CustomerDto dto)
        {
            return !ModelState.IsValid?
                BadRequest(ModelState) :
                await _service.CreateAsync(dto) ? 
                    BadRequest("Failed to create customer record") : 
                    Ok(dto);
        }

        [HttpGet("{id}")] 
        public async Task<ActionResult<CustomerDto>> GetById(Guid id)
        {
            var item = await _service.GetByIdAsync(id);

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
            [FromQuery] DateTime? updatedAt = null
        )
        {
            var items = await _service.GetAllAsync(
                id,
                name,
                email,
                phone,
                address,
                type,
                company,
                panVat,
                createdAt,
                updatedAt
            );

            return Ok(items);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(Guid id, [FromBody] CustomerDto dto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var updated = await _service.UpdateAsync(id, dto);

            if (!updated)
            {
                return NotFound($"Customer with ID {id} not found.");
            }

            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(Guid id)
        {
            var deleted = await _service.DeleteAsync(id);

            if (!deleted)
            {
                return NotFound($"Customer with ID {id} not found.");
            }

            return NoContent();
        }
        // </crudgen:actions>
    }
}
