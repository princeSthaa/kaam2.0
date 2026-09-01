using backend.Dto.RolePagePermission;
using backend.Service.RolePagePermission;
using Microsoft.AspNetCore.Mvc;
using backend.Data;
using backend.Security.Rbac;
using backend.Service.Rbac;
using Microsoft.EntityFrameworkCore;

namespace backend.Controller.RolePagePermission
{
    [ApiController]
    [Route("api/role-page-permission")]
    public class RolePagePermissionController : ControllerBase
    {
        private readonly IRolePagePermissionService _service;
        private readonly IRbacService _rbac;
        private readonly AppDbContext _context;

        public RolePagePermissionController(IRolePagePermissionService service, IRbacService rbac, AppDbContext context)
        {
            _service = service;
            _rbac = rbac;
            _context = context;
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] RolePagePermissionDto dto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }
            var employeeId = RbacUser.GetEmployeeId(User);
            var access = await _context.RolePageAccesses.AsNoTracking().FirstOrDefaultAsync(x => x.Id == dto.RolePageAccessId);
            var action = await _context.Permissions.AsNoTracking().Where(x => x.Id == dto.PermissionId).Select(x => x.Action).FirstOrDefaultAsync();
            if (employeeId is null || access is null || action is null ||
                !await _rbac.CanDelegatePageAsync(employeeId.Value, access.RoleId, access.PageId, action)) return Forbid();
            if (await _context.RolePagePermissions.AnyAsync(x => x.RolePageAccessId == dto.RolePageAccessId && x.PermissionId == dto.PermissionId))
                return Conflict(new { message = "This permission is already assigned." });

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
            var employeeId = RbacUser.GetEmployeeId(User);
            if (employeeId is null || !(await _rbac.GetVisibleRoleIdsAsync(employeeId.Value)).Contains(item.RoleId)) return Forbid();
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

            var employeeId = RbacUser.GetEmployeeId(User);
            if (employeeId is null) return Unauthorized();
            var visible = await _rbac.GetVisibleRoleIdsAsync(employeeId.Value);
            return Ok(items.Where(x => visible.Contains(x.RoleId)));
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(Guid id, [FromBody] RolePagePermissionDto dto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }
            var employeeId = RbacUser.GetEmployeeId(User);
            var access = await _context.RolePageAccesses.AsNoTracking().FirstOrDefaultAsync(x => x.Id == dto.RolePageAccessId);
            var action = await _context.Permissions.AsNoTracking().Where(x => x.Id == dto.PermissionId).Select(x => x.Action).FirstOrDefaultAsync();
            if (employeeId is null || access is null || action is null ||
                !await _rbac.CanDelegatePageAsync(employeeId.Value, access.RoleId, access.PageId, action)) return Forbid();
            var current = await _context.RolePagePermissions.AsNoTracking()
                .Include(x => x.RolePageAccess).Include(x => x.Permission).FirstOrDefaultAsync(x => x.Id == id);
            if (current?.RolePageAccess is null || current.Permission is null ||
                !await _rbac.CanDelegatePageAsync(employeeId.Value, current.RolePageAccess.RoleId, current.RolePageAccess.PageId, current.Permission.Action)) return Forbid();

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
            var employeeId = RbacUser.GetEmployeeId(User);
            var current = await _context.RolePagePermissions.AsNoTracking()
                .Include(x => x.RolePageAccess).Include(x => x.Permission).FirstOrDefaultAsync(x => x.Id == id);
            if (employeeId is null || current?.RolePageAccess is null || current.Permission is null ||
                !await _rbac.CanDelegatePageAsync(employeeId.Value, current.RolePageAccess.RoleId, current.RolePageAccess.PageId, current.Permission.Action)) return Forbid();
            var deleted = await _service.DeleteAsync(id);

            if (!deleted)
            {
                return NotFound($"RolePagePermission with ID {id} not found.");
            }

            return NoContent();
        }
    }
}
