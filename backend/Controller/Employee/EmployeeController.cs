using backend.Dto.Employee;
using backend.Service.Employee;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using OpenIddict.Validation.AspNetCore;
using backend.Security.Rbac;
using backend.Service.Rbac;

namespace backend.Controller.Employee
{
    [ApiController]
    [Route("api/employee")]
    public class EmployeeController : ControllerBase
    {
        private readonly IEmployeeService _service;
        private readonly IRbacService _rbac;

        public EmployeeController(IEmployeeService service, IRbacService rbac)
        {
            _service = service;
            _rbac = rbac;
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] EmployeeDto dto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var employeeId = RbacUser.GetEmployeeId(User);
            if (employeeId is null || dto.EmployeeRoleId is null ||
                !await _rbac.CanAssignRoleAsync(employeeId.Value, dto.EmployeeRoleId.Value)) return Forbid();

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
            var employeeId = RbacUser.GetEmployeeId(User);
            if (employeeId is null) return Unauthorized();
            var visible = await _rbac.GetVisibleRoleIdsAsync(employeeId.Value);
            if (item.EmployeeRoleId is not Guid roleId || !visible.Contains(roleId)) return Forbid();
            return Ok(item);
        }
        
        [Authorize(AuthenticationSchemes = OpenIddictValidationAspNetCoreDefaults.AuthenticationScheme)]
        [HttpGet]   
        public async Task<ActionResult<List<EmployeeGetDto>>> GetAll(
            [FromQuery] Guid? id = null,
            [FromQuery] string? firstName = null,
            [FromQuery] string? lastName = null,
            [FromQuery] string? email = null,
            [FromQuery] string? password = null,
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
                password,
                phoneNumber,
                employeeRoleId,
                departmentId,
                isActive,
                createdAt,
                updatedAt
            );

            var callerId = RbacUser.GetEmployeeId(User);
            if (callerId is null) return Unauthorized();
            var visible = await _rbac.GetVisibleRoleIdsAsync(callerId.Value);
            return Ok(items.Where(x => x.EmployeeRoleId is Guid roleId && visible.Contains(roleId)));
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(Guid id, [FromBody] EmployeeDto dto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var employeeId = RbacUser.GetEmployeeId(User);
            if (employeeId is null || dto.EmployeeRoleId is null ||
                !await _rbac.CanManageEmployeeAsync(employeeId.Value, id) ||
                !await _rbac.CanAssignRoleAsync(employeeId.Value, dto.EmployeeRoleId.Value)) return Forbid();

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
            var employeeId = RbacUser.GetEmployeeId(User);
            if (employeeId is null || !await _rbac.CanManageEmployeeAsync(employeeId.Value, id)) return Forbid();
            var deleted = await _service.DeleteAsync(id);

            if (!deleted)
            {
                return NotFound($"Employee with ID {id} not found.");
            }

            return NoContent();
        }
    }
}
