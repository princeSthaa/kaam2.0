using backend.Dto.Employee;
using backend.Service.Employee;
using Microsoft.AspNetCore.Mvc;

namespace backend.Controller.Employee
{
    [ApiController]
    [Route("api/employee")]
    public class EmployeeController : ControllerBase
    {
        private readonly IEmployeeService _service;

        public EmployeeController(IEmployeeService service)
        {
            _service = service;
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] EmployeeDto dto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var created = await _service.CreateAsync(dto);
            if (!created)
            {
                return BadRequest("Failed to create employee record.");
            }

            return Ok(dto);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<EmployeeGetDto>> GetById(Guid id)
        {
            var item = await _service.GetByIdAsync(id);

            if (item == null)
            {
                return NotFound($"Employee with ID {id} not found.");
            }

            return Ok(item);
        }

        [HttpGet]
        public async Task<ActionResult<List<EmployeeGetDto>>> GetAll(
            [FromQuery] Guid? id = null,
            [FromQuery] string? firstName = null,
            [FromQuery] string? lastName = null,
            [FromQuery] string? email = null,
            [FromQuery] string? phoneNumber = null,
            [FromQuery] Guid? employeeRoleId = null,
            [FromQuery] Guid? departmentId = null,
            [FromQuery] bool? isActive = null,
            [FromQuery] DateTime? createdAt = null,
            [FromQuery] DateTime? updatedAt = null
        )
        {
            var items = await _service.GetAllAsync(
                id,
                firstName,
                lastName,
                email,
                phoneNumber,
                employeeRoleId,
                departmentId,
                isActive,
                createdAt,
                updatedAt
            );

            return Ok(items);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(Guid id, [FromBody] EmployeeDto dto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var updated = await _service.UpdateAsync(id, dto);

            if (!updated)
            {
                return NotFound($"Employee with ID {id} not found.");
            }

            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(Guid id)
        {
            var deleted = await _service.DeleteAsync(id);

            if (!deleted)
            {
                return NotFound($"Employee with ID {id} not found.");
            }

            return NoContent();
        }
    }
}
