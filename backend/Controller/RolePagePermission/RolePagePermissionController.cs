using backend.Dto.RolePagePermission;
using backend.Service.RolePagePermission;
using Microsoft.AspNetCore.Mvc;

namespace backend.Controller.RolePagePermission
{
    [ApiController]
    [Route("api/role-page-permission")]
    public class RolePagePermissionController : ControllerBase
    {
        private readonly IRolePagePermissionService _service;

        public RolePagePermissionController(IRolePagePermissionService service)
        {
            _service = service;
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] RolePagePermissionDto dto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var created = await _service.CreateAsync(dto);
            if (!created)
            {
                return BadRequest("Failed to create role page permission record.");
            }

            return Ok(dto);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<RolePagePermissionGetDto>> GetById(Guid id)
        {
            var item = await _service.GetByIdAsync(id);

            if (item == null)
            {
                return NotFound($"RolePagePermission with ID {id} not found.");
            }

            return Ok(item);
        }

        [HttpGet]
        public async Task<ActionResult<List<RolePagePermissionGetDto>>> GetAll(
            [FromQuery] Guid? id = null,
            [FromQuery] Guid? rolePageAccessId = null,
            [FromQuery] Guid? permissionId = null,
            [FromQuery] DateTime? createdAt = null,
            [FromQuery] DateTime? updatedAt = null
        )
        {
            var items = await _service.GetAllAsync(
                id,
                rolePageAccessId,
                permissionId,
                createdAt,
                updatedAt
            );

            return Ok(items);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(Guid id, [FromBody] RolePagePermissionDto dto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var updated = await _service.UpdateAsync(id, dto);

            if (!updated)
            {
                return NotFound($"RolePagePermission with ID {id} not found.");
            }

            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(Guid id)
        {
            var deleted = await _service.DeleteAsync(id);

            if (!deleted)
            {
                return NotFound($"RolePagePermission with ID {id} not found.");
            }

            return NoContent();
        }
    }
}
