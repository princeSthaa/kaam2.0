using backend.Dto.Role;
using backend.Service.Role;
using Microsoft.AspNetCore.Mvc;
using backend.Data;
using backend.Security.Rbac;
using backend.Service.Rbac;
using Microsoft.EntityFrameworkCore;

namespace backend.Controller.Role
{
    [ApiController]
    [Route("api/role")]
    public class RoleController : ControllerBase
    {
        private readonly IRoleService _service;
        private readonly IRbacService _rbac;
        private readonly AppDbContext _context;

        public RoleController(IRoleService service, IRbacService rbac, AppDbContext context)
        {
            _service = service;
            _rbac = rbac;
            _context = context;
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] RoleDto dto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var employeeId = RbacUser.GetEmployeeId(User);
            if (employeeId is null) return Unauthorized();
            var caller = await _rbac.GetRoleForEmployeeAsync(employeeId.Value);
            if (caller is null) return Forbid();
            dto.IsSuperAdmin = false;
            dto.IsSystem = false;
            if (!caller.IsSuperAdmin)
            {
                if (!caller.IsModuleAdmin || caller.ModulePageId is null) return Forbid();
                dto.ModulePageId = caller.ModulePageId;
                dto.IsModuleAdmin = false;
            }
            if (dto.ModulePageId is null) return BadRequest(new { message = "A module is required for this role." });
            if (await _context.Roles.AnyAsync(x => x.RoleName == dto.RoleName && x.ModulePageId == dto.ModulePageId))
                return Conflict(new { message = "A role with this name already exists in the module." });

            var created = await _service.CreateAsync(dto);
            if (!created)
            {
                return BadRequest("Failed to create role record.");
            }

            return Ok(dto);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<RoleGetDto>> GetById(Guid id)
        {
            var item = await _service.GetByIdAsync(id);
            if (item is null) return NotFound($"Role with ID {id} not found.");
            var employeeId = RbacUser.GetEmployeeId(User);
            if (employeeId is null || !(await _rbac.GetVisibleRoleIdsAsync(employeeId.Value)).Contains(id)) return Forbid();
            return Ok(item);
        }

        [HttpGet]
        public async Task<ActionResult<List<RoleGetDto>>> GetAll(
            [FromQuery] Guid? id = null,
            [FromQuery] string? roleName = null,
            [FromQuery] DateTime? createdAt = null,
            [FromQuery] DateTime? updatedAt = null,
            [FromQuery] bool? excludeSuperAdmin = null
        )
        {
            var items = await _service.GetAllAsync(
                id,
                roleName,
                createdAt,
                updatedAt
            );
            var employeeId = RbacUser.GetEmployeeId(User);
            if (employeeId is null) return Unauthorized();
            var visible = await _rbac.GetVisibleRoleIdsAsync(employeeId.Value);
            var result = items.Where(x => visible.Contains(x.Id));
            if (excludeSuperAdmin == true)
            {
                result = result.Where(x => !x.IsSuperAdmin && x.RoleName != "Super Admin");
            }
            return Ok(result);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(Guid id, [FromBody] RoleDto dto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var employeeId = RbacUser.GetEmployeeId(User);
            if (employeeId is null || !await _rbac.CanManageRoleAsync(employeeId.Value, id)) return Forbid();
            var caller = await _rbac.GetRoleForEmployeeAsync(employeeId.Value);
            var current = await _context.Roles.AsNoTracking().FirstOrDefaultAsync(x => x.Id == id);
            if (caller is null || current is null) return NotFound();
            dto.IsSuperAdmin = false;
            dto.IsSystem = false;
            if (!caller.IsSuperAdmin)
            {
                dto.ModulePageId = caller.ModulePageId;
                dto.IsModuleAdmin = false;
            }

            var updated = await _service.UpdateAsync(id, dto);

            if (!updated)
            {
                return NotFound($"Role with ID {id} not found.");
            }

            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(Guid id)
        {
            var employeeId = RbacUser.GetEmployeeId(User);
            if (employeeId is null || !await _rbac.CanManageRoleAsync(employeeId.Value, id)) return Forbid();
            var deleted = await _service.DeleteAsync(id);

            if (!deleted)
            {
                return NotFound($"Role with ID {id} not found.");
            }

            return NoContent();
        }
    }
}
