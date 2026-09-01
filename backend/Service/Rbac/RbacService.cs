using System.Data;
using backend.Data;
using backend.Dto.Rbac;
using Dapper;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Storage;

namespace backend.Service.Rbac;

public sealed class RbacService : IRbacService
{
    private readonly AppDbContext _context;

    public RbacService(AppDbContext context) => _context = context;

    public async Task<CurrentUserAccessDto?> GetProfileAsync(Guid employeeId)
    {
        var connection = _context.Database.GetDbConnection();
        var parameters = new DynamicParameters();
        parameters.Add("@EmployeeId", employeeId);

        using var multi = await connection.QueryMultipleAsync(
            "sp_GetEmployeeProfile",
            parameters,
            transaction: _context.Database.CurrentTransaction?.GetDbTransaction(),
            commandType: CommandType.StoredProcedure
        );

        var employee = !multi.IsConsumed ? await multi.ReadFirstOrDefaultAsync<EmployeeProfileRow>() : null;
        if (employee is null) return null;

        var pageRows = !multi.IsConsumed ? (await multi.ReadAsync<PageGrantRow>()).ToList() : new List<PageGrantRow>();

        var grants = pageRows
            .GroupBy(x => new { x.PageId, x.PageName, x.Route, x.ParentPageId })
            .Select(group => new RbacPageGrantDto
            {
                PageId = group.Key.PageId,
                PageName = group.Key.PageName,
                Route = group.Key.Route,
                ParentPageId = group.Key.ParentPageId,
                Actions = group
                    .Where(x => !string.IsNullOrEmpty(x.Action))
                    .Select(x => x.Action.ToUpperInvariant())
                    .Distinct()
                    .ToList()
            })
            .ToList();

        return new CurrentUserAccessDto
        {
            Id = employee.Id,
            FullName = $"{employee.FirstName} {employee.LastName}".Trim(),
            Email = employee.Email,
            PhoneNumber = employee.PhoneNumber ?? string.Empty,
            RoleId = employee.RoleId,
            RoleName = employee.RoleName,
            ModulePageId = employee.ModulePageId,
            ModuleName = employee.ModuleName,
            ModuleRoute = employee.ModuleRoute,
            DepartmentName = employee.DepartmentName,
            IsModuleAdmin = employee.IsModuleAdmin,
            IsSuperAdmin = employee.IsSuperAdmin,
            PageGrants = grants
        };
    }

    public async Task<backend.Model.Role?> GetRoleForEmployeeAsync(Guid employeeId)
    {
        const string sql = """
            SELECT r.*
            FROM Employees e
            INNER JOIN Roles r ON e.EmployeeRoleId = r.Id
            WHERE e.Id = @EmployeeId AND e.IsActive = 1;
        """;
        var connection = _context.Database.GetDbConnection();
        var parameters = new DynamicParameters();
        parameters.Add("@EmployeeId", employeeId);

        return await connection.QueryFirstOrDefaultAsync<backend.Model.Role>(
            sql,
            parameters,
            transaction: _context.Database.CurrentTransaction?.GetDbTransaction()
        );
    }

    public async Task<HashSet<Guid>> GetVisibleRoleIdsAsync(Guid employeeId)
    {
        var connection = _context.Database.GetDbConnection();
        var parameters = new DynamicParameters();
        parameters.Add("@EmployeeId", employeeId);

        var ids = await connection.QueryAsync<Guid>(
            "sp_GetVisibleRoleIds",
            parameters,
            transaction: _context.Database.CurrentTransaction?.GetDbTransaction(),
            commandType: CommandType.StoredProcedure
        );
        return ids.ToHashSet();
    }

    public async Task<bool> CanManageRoleAsync(Guid employeeId, Guid roleId)
    {
        var caller = await GetRoleForEmployeeAsync(employeeId);
        if (caller is null) return false;
        if (caller.IsSuperAdmin) return true;

        var connection = _context.Database.GetDbConnection();
        var target = await connection.QueryFirstOrDefaultAsync<backend.Model.Role>(
            "SELECT * FROM Roles WHERE Id = @RoleId;",
            new { RoleId = roleId },
            transaction: _context.Database.CurrentTransaction?.GetDbTransaction()
        );
        if (target is null || target.IsSystem || target.IsSuperAdmin) return false;

        return caller.IsModuleAdmin && caller.ModulePageId != null &&
               caller.ModulePageId == target.ModulePageId && !target.IsModuleAdmin;
    }

    public async Task<bool> CanAssignRoleAsync(Guid employeeId, Guid roleId)
    {
        var caller = await GetRoleForEmployeeAsync(employeeId);
        if (caller is null) return false;

        var connection = _context.Database.GetDbConnection();
        var target = await connection.QueryFirstOrDefaultAsync<backend.Model.Role>(
            "SELECT * FROM Roles WHERE Id = @RoleId;",
            new { RoleId = roleId },
            transaction: _context.Database.CurrentTransaction?.GetDbTransaction()
        );
        if (target is null) return false;
        if (caller.IsSuperAdmin) return !target.IsSuperAdmin && !target.IsSystem;

        return caller.IsModuleAdmin && caller.ModulePageId != null &&
               caller.ModulePageId == target.ModulePageId && !target.IsModuleAdmin && !target.IsSystem;
    }

    public async Task<bool> CanManageEmployeeAsync(Guid employeeId, Guid targetEmployeeId)
    {
        if (employeeId == targetEmployeeId) return false;
        var caller = await GetRoleForEmployeeAsync(employeeId);
        if (caller is null) return false;

        var targetRole = await GetRoleForEmployeeAsync(targetEmployeeId);
        if (targetRole is null || targetRole.IsSuperAdmin || targetRole.IsSystem) return false;
        if (caller.IsSuperAdmin) return true;

        return caller.IsModuleAdmin && caller.ModulePageId != null &&
               caller.ModulePageId == targetRole.ModulePageId && !targetRole.IsModuleAdmin;
    }

    public async Task<bool> CanDelegatePageAsync(Guid employeeId, Guid targetRoleId, Guid pageId, string? action = null)
    {
        var caller = await GetRoleForEmployeeAsync(employeeId);
        if (caller is null) return false;

        var connection = _context.Database.GetDbConnection();
        var tx = _context.Database.CurrentTransaction?.GetDbTransaction();

        var target = await connection.QueryFirstOrDefaultAsync<backend.Model.Role>(
            "SELECT * FROM Roles WHERE Id = @RoleId;", new { RoleId = targetRoleId }, transaction: tx);
        var page = await connection.QueryFirstOrDefaultAsync<backend.Model.Page>(
            "SELECT * FROM Pages WHERE Id = @PageId AND IsActive = 1;", new { PageId = pageId }, transaction: tx);

        if (target is null || page is null || target.IsSystem || target.IsSuperAdmin) return false;
        if (caller.IsSuperAdmin) return true;
        if (!caller.IsModuleAdmin || caller.ModulePageId is null || target.IsModuleAdmin || target.ModulePageId != caller.ModulePageId)
            return false;

        var moduleRoute = await connection.ExecuteScalarAsync<string?>(
            "SELECT Route FROM Pages WHERE Id = @Id;", new { Id = caller.ModulePageId }, transaction: tx);
        if (moduleRoute is null || !(page.Route == moduleRoute || page.Route.StartsWith(moduleRoute + "/", StringComparison.OrdinalIgnoreCase)))
            return false;

        var parameters = new DynamicParameters();
        parameters.Add("@RoleId", caller.Id);
        parameters.Add("@PageId", pageId);
        parameters.Add("@Action", string.IsNullOrWhiteSpace(action) ? null : NormalizeAction(action));

        return await connection.ExecuteScalarAsync<bool>(
            "sp_CheckRolePermission",
            parameters,
            transaction: tx,
            commandType: CommandType.StoredProcedure
        );
    }

    private static string NormalizeAction(string action) =>
        action.ToUpperInvariant() switch
        {
            "HEAD" => "GET",
            "PATCH" => "PUT",
            _ => action.ToUpperInvariant(),
        };

    private sealed class EmployeeProfileRow
    {
        public Guid Id { get; set; }
        public string FirstName { get; set; } = string.Empty;
        public string LastName { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string? PhoneNumber { get; set; }
        public Guid RoleId { get; set; }
        public string RoleName { get; set; } = string.Empty;
        public Guid? ModulePageId { get; set; }
        public string? ModuleName { get; set; }
        public string? ModuleRoute { get; set; }
        public string DepartmentName { get; set; } = string.Empty;
        public bool IsModuleAdmin { get; set; }
        public bool IsSuperAdmin { get; set; }
    }

    private sealed class PageGrantRow
    {
        public Guid PageId { get; set; }
        public string PageName { get; set; } = string.Empty;
        public string Route { get; set; } = string.Empty;
        public Guid? ParentPageId { get; set; }
        public string Action { get; set; } = string.Empty;
    }
}
