using backend.Dto.RolePageAccess;
using backend.Service.RolePageAccess;
using Microsoft.AspNetCore.Mvc;
using backend.Data;
using backend.Security.Rbac;
using backend.Service.Rbac;
using Microsoft.EntityFrameworkCore;

namespace backend.Controller.RolePageAccess
{
    [ApiController]
    [Route("api/role-page-access")]
    public class RolePageAccessController : ControllerBase
    {
        private readonly IRolePageAccessService _service;
        private readonly IRbacService _rbac;
        private readonly AppDbContext _context;

        public RolePageAccessController(IRolePageAccessService service, IRbacService rbac, AppDbContext context)
        {
            _service = service;
            _rbac = rbac;
            _context = context;
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] RolePageAccessDto dto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }
            var employeeId = RbacUser.GetEmployeeId(User);
            if (employeeId is null || !await _rbac.CanDelegatePageAsync(employeeId.Value, dto.RoleId, dto.PageId)) return Forbid();
            if (await _context.RolePageAccesses.AnyAsync(x => x.RoleId == dto.RoleId && x.PageId == dto.PageId))
                return Conflict(new { message = "This role already has access to the page." });

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
            var employeeId = RbacUser.GetEmployeeId(User);
            if (employeeId is null || !(await _rbac.GetVisibleRoleIdsAsync(employeeId.Value)).Contains(item.RoleId)) return Forbid();
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

            var employeeId = RbacUser.GetEmployeeId(User);
            if (employeeId is null) return Unauthorized();
            var visible = await _rbac.GetVisibleRoleIdsAsync(employeeId.Value);
            return Ok(items.Where(x => visible.Contains(x.RoleId)));
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(Guid id, [FromBody] RolePageAccessDto dto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }
            var employeeId = RbacUser.GetEmployeeId(User);
            if (employeeId is null || !await _rbac.CanDelegatePageAsync(employeeId.Value, dto.RoleId, dto.PageId)) return Forbid();
            var current = await _context.RolePageAccesses.AsNoTracking().FirstOrDefaultAsync(x => x.Id == id);
            if (current is null || !await _rbac.CanDelegatePageAsync(employeeId.Value, current.RoleId, current.PageId)) return Forbid();

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
            var employeeId = RbacUser.GetEmployeeId(User);
            var current = await _context.RolePageAccesses.AsNoTracking().FirstOrDefaultAsync(x => x.Id == id);
            if (employeeId is null || current is null ||
                !await _rbac.CanDelegatePageAsync(employeeId.Value, current.RoleId, current.PageId)) return Forbid();
            var deleted = await _service.DeleteAsync(id);

            if (!deleted)
            {
                return NotFound($"RolePageAccess with ID {id} not found.");
            }

            return NoContent();
        }

        [HttpGet("matrix/{roleId}")]
        public async Task<IActionResult> GetMatrix(Guid roleId)
        {
            var employeeId = RbacUser.GetEmployeeId(User);
            if (employeeId is null) return Unauthorized();

            var connection = _context.Database.GetDbConnection();
            if (connection.State != System.Data.ConnectionState.Open)
            {
                await connection.OpenAsync();
            }

            var parameters = new Dapper.DynamicParameters();
            parameters.Add("@RoleId", roleId);

            var items = await Dapper.SqlMapper.QueryAsync<RolePageMatrixItemDto>(
                connection,
                "sp_GetRolePermissionsMatrix",
                parameters,
                commandType: System.Data.CommandType.StoredProcedure
            );

            return Ok(items);
        }

        [HttpPost("matrix")]
        public async Task<IActionResult> SaveMatrix([FromBody] RolePageMatrixSaveDto dto)
        {
            var employeeId = RbacUser.GetEmployeeId(User);
            if (employeeId is null) return Unauthorized();

            if (dto == null || dto.RoleId == Guid.Empty)
            {
                return BadRequest("Invalid role ID or assignments.");
            }

            var connection = _context.Database.GetDbConnection();
            if (connection.State != System.Data.ConnectionState.Open)
            {
                await connection.OpenAsync();
            }

            var jsonOptions = new System.Text.Json.JsonSerializerOptions
            {
                PropertyNamingPolicy = System.Text.Json.JsonNamingPolicy.CamelCase
            };
            var jsonAssignments = System.Text.Json.JsonSerializer.Serialize(dto.Assignments, jsonOptions);

            var parameters = new Dapper.DynamicParameters();
            parameters.Add("@RoleId", dto.RoleId);
            parameters.Add("@Assignments", jsonAssignments);

            var items = await Dapper.SqlMapper.QueryAsync<RolePageMatrixItemDto>(
                connection,
                "sp_SaveRolePagePermissionsMatrix",
                parameters,
                commandType: System.Data.CommandType.StoredProcedure
            );

            return Ok(items);
        }
    }
}
