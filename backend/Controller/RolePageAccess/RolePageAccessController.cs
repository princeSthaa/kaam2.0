using backend.Dto.RolePageAccess;
using backend.Service.RolePageAccess;
using Microsoft.AspNetCore.Mvc;

namespace backend.Controller.RolePageAccess
{
    [ApiController]
    [Route("api/role-page-access")]
    public class RolePageAccessController : ControllerBase
    {
        private readonly IRolePageAccessService _service;

        public RolePageAccessController(IRolePageAccessService service)
        {
            _service = service;
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] RolePageAccessDto dto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var created = await _service.CreateAsync(dto);
            if (!created)
            {
                return BadRequest("Failed to create role page access record.");
            }

            return Ok(dto);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<RolePageAccessGetDto>> GetById(Guid id)
        {
            var item = await _service.GetByIdAsync(id);

            if (item == null)
            {
                return NotFound($"RolePageAccess with ID {id} not found.");
            }

            return Ok(item);
        }

        [HttpGet]
        public async Task<ActionResult<List<RolePageAccessGetDto>>> GetAll(
            [FromQuery] Guid? id = null,
            [FromQuery] Guid? roleId = null,
            [FromQuery] Guid? pageId = null,
            [FromQuery] DateTime? createdAt = null,
            [FromQuery] DateTime? updatedAt = null
        )
        {
            var items = await _service.GetAllAsync(
                id,
                roleId,
                pageId,
                createdAt,
                updatedAt
            );

            return Ok(items);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(Guid id, [FromBody] RolePageAccessDto dto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var updated = await _service.UpdateAsync(id, dto);

            if (!updated)
            {
                return NotFound($"RolePageAccess with ID {id} not found.");
            }

            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(Guid id)
        {
            var deleted = await _service.DeleteAsync(id);

            if (!deleted)
            {
                return NotFound($"RolePageAccess with ID {id} not found.");
            }

            return NoContent();
        }
    }
}
