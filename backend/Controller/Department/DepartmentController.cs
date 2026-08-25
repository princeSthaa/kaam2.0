using backend.Dto.Department;
using backend.Service.Department;
using Microsoft.AspNetCore.Mvc;

namespace backend.Controller.Department
{
    [ApiController]
    [Route("api/department")]
    public class DepartmentController : ControllerBase
    {
        private readonly IDepartmentService _service;

        public DepartmentController(IDepartmentService service)
        {
            _service = service;
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] DepartmentDto dto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var created = await _service.CreateAsync(dto);
            if (!created)
            {
                return BadRequest("Failed to create department record.");
            }

            return Ok(dto);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<DepartmentGetDto>> GetById(Guid id)
        {
            var item = await _service.GetByIdAsync(id);

            if (item == null)
            {
                return NotFound($"Department with ID {id} not found.");
            }

            return Ok(item);
        }

        [HttpGet]
        public async Task<ActionResult<List<DepartmentGetDto>>> GetAll(
            [FromQuery] Guid? id = null,
            [FromQuery] string? name = null,
            [FromQuery] string? departmentCode = null,
            [FromQuery] DateTime? createdAt = null,
            [FromQuery] DateTime? updatedAt = null
        )
        {
            var items = await _service.GetAllAsync(
                id,
                name,
                departmentCode,
                createdAt,
                updatedAt
            );

            return Ok(items);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(Guid id, [FromBody] DepartmentDto dto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var updated = await _service.UpdateAsync(id, dto);

            if (!updated)
            {
                return NotFound($"Department with ID {id} not found.");
            }

            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(Guid id)
        {
            var deleted = await _service.DeleteAsync(id);

            if (!deleted)
            {
                return NotFound($"Department with ID {id} not found.");
            }

            return NoContent();
        }
    }
}
