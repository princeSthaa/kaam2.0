using System.Security.Cryptography;
using System.Text;
using backend.Model;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace backend.Data;

public static class RbacSeeder
{
    private sealed record PageSeedDefinition(
        string Name,
        string Route,
        string Icon,
        string? ParentRoute,
        int DisplayOrder
    );

    private static readonly Guid SuperAdminRoleId =
        Guid.Parse("00000000-0000-0000-0000-000000000001");

    private static readonly Guid SuperAdminEmployeeId =
        Guid.Parse("00000000-0000-0000-0000-000000000002");

    private static readonly Guid SystemAdministrationDepartmentId =
        Guid.Parse("00000000-0000-0000-0000-000000000003");

    private const string SuperAdminRoleName = "Super Admin";
    private const string SuperAdminEmail = "admin";
    private const string SuperAdminInitialPassword = "admin";

    private static readonly (string Name, string Action, string Description)[] StandardPermissions =
    {
        ("View", "GET", "View records on this page"),
        ("Create", "POST", "Create records on this page"),
        ("Update", "PUT", "Update records on this page"),
        ("Delete", "DELETE", "Delete records on this page")
    };

    private static readonly PageSeedDefinition[] SeedPages = new PageSeedDefinition[]
    {
        new("Dashboard", "/", "dashboard", null, 0),
        new("Administration", "/admin", "admin_panel_settings", "/", 10),
        new("RBAC Management", "/admin/usersandrbac", "manage_accounts", "/admin", 11),
        new("Employee Directory", "/admin/usersandrbac/employees", "badge", "/admin/usersandrbac", 12),
        new("Roles", "/admin/usersandrbac/roles", "groups", "/admin/usersandrbac", 13),
        new("Departments", "/admin/usersandrbac/departments", "apartment", "/admin/usersandrbac", 14),
        new("Permission Definitions", "/admin/usersandrbac/permissions", "key", "/admin/usersandrbac", 15),
        new("Page Definitions", "/admin/usersandrbac/pages", "web", "/admin/usersandrbac", 16),
        new("Page Access", "/admin/usersandrbac/page-access", "lock_open", "/admin/usersandrbac", 17),
        new("Page Permissions", "/admin/usersandrbac/page-permissions", "policy", "/admin/usersandrbac", 18),
        new("Master Data", "/admin/masterdata", "library_add", "/admin", 20),
        new("Product Directory", "/admin/product", "category", "/admin", 21),
        new("Material Directory", "/admin/material", "precision_manufacturing", "/admin", 22),
        new("Supplier", "/admin/supplier", "person", "/admin", 23),
        new("Supplier Directory", "/admin/suppliers", "groups", "/admin", 24),
        new("Supplied Material Directory", "/admin/suppliedmaterialdirectory", "inventory_2", "/admin", 25),
        new("Workforce", "/admin/workforce", "engineering", "/admin", 26),
        new("Warehouse Directory", "/admin/warehousedirectory", "warehouse", "/admin", 27),
        new("Audit Logs", "/admin/auditlogs", "receipt_long", "/admin", 28),
        new("CRM", "/crm", "support_agent", "/", 100),
        new("CRM Audit", "/crm/audit", "history", "/crm", 101),
        new("Customers", "/crm/customers", "groups", "/crm", 102),
        new("Create Customer", "/crm/customers/new", "person_add", "/crm/customers", 103),
        new("Create Order", "/crm/orders/new", "add_shopping_cart", "/crm", 104),
        new("ERM", "/erm", "business_center", "/", 200),
        new("Factory", "/factory", "factory", "/", 300),
        new("Factory Overview", "/factory/overview", "dashboard", "/factory", 301),
        new("Bill of Materials", "/factory/bill-of-materials", "receipt", "/factory", 302),
        new("BOM", "/factory/bom", "receipt_long", "/factory", 303),
        new("Factory Inventory", "/factory/factory-inventory", "inventory", "/factory", 304),
        new("Factory In Progress", "/factory/in-progress", "construction", "/factory", 305),
        new("Material Requests", "/factory/material-requests", "request_quote", "/factory", 306),
        new("Material Request Details", "/factory/material-requests/[id]", "description", "/factory/material-requests", 307),
        new("Work Center", "/factory/work-center", "precision_manufacturing", "/factory", 308),
        new("Work Order", "/factory/work-order", "assignment", "/factory", 309),
        new("Inventory", "/inventory", "inventory_2", "/", 400),
        new("Production", "/production", "precision_manufacturing", "/", 500),
        new("Production Board", "/production/board", "view_timeline", "/production", 501),
        new("Completed Production", "/production/completed", "task_alt", "/production", 502),
        new("Production Demands", "/production/demands", "dynamic_feed", "/production", 503),
        new("Customer Demand Catalog", "/production/demands/catalog/customer", "groups", "/production/demands", 504),
        new("Outlet Demand Catalog", "/production/demands/catalog/outlet", "store", "/production/demands", 505),
        new("Customer Demands", "/production/demands/customer", "person", "/production/demands", 506),
        new("In-house Demands", "/production/demands/in-house", "home_work", "/production/demands", 507),
        new("Outlet Demands", "/production/demands/outlet", "storefront", "/production/demands", 508),
        new("Production Drafts", "/production/drafts", "edit_note", "/production", 509),
        new("Production In Progress", "/production/in-progress", "pending_actions", "/production", 510),
        new("Open Orders", "/production/openorders", "orders", "/production", 511),
        new("Production Plans", "/production/plans", "assignment", "/production", 512),
        new("Production Plan Details", "/production/plans/[id]", "description", "/production/plans", 513),
        new("Edit Production Plan", "/production/plans/[id]/edit", "edit", "/production/plans/[id]", 514),
        new("Production Plan Stage", "/production/plans/[id]/stage", "account_tree", "/production/plans/[id]", 515),
        new("Create Customer Plan", "/production/plans/CreateCustomerPlan", "add", "/production/plans", 516),
        new("New Production Plan", "/production/plans/new", "add_circle", "/production/plans", 517),
        new("Production Timeline", "/production/timeline", "timeline", "/production", 518),
        new("SRM", "/srm", "handshake", "/", 600),
        new("SRM Analytics", "/srm/analytics", "analytics", "/srm", 601),
        new("SRM Materials", "/srm/materials", "inventory_2", "/srm", 602),
        new("SRM Suppliers", "/srm/suppliers", "groups", "/srm", 603),
        new("Warehouse", "/warehouse", "warehouse", "/", 700),
        new("Customer Returns", "/warehouse/customerreturn", "assignment_return", "/warehouse", 701),
        new("Damage Returns", "/warehouse/damagereturn", "broken_image", "/warehouse", 702),
        new("Dispatch", "/warehouse/dispatch", "local_shipping", "/warehouse", 703),
        new("Factory Requests", "/warehouse/factoryrequest", "factory", "/warehouse", 704),
        new("Finished Goods and Sales Dispatch", "/warehouse/finishedgoodandsalesdispatch", "local_shipping", "/warehouse", 705),
        new("Issue to Factory", "/warehouse/issue", "forklift", "/warehouse", 706),
        new("Purchase Demand", "/warehouse/purchasedemand", "shopping_cart_checkout", "/warehouse", 707),
        new("Purchase Orders", "/warehouse/purchaseorder", "receipt_long", "/warehouse", 708),
        new("Receive and Inspect", "/warehouse/receive", "fact_check", "/warehouse", 709),
        new("Return to Supplier", "/warehouse/returntosupplier", "assignment_return", "/warehouse", 710),
        new("Warehouse Stock", "/warehouse/stock", "inventory", "/warehouse", 711),
        new("Warehouse Structure", "/warehouse/structuremanagment", "account_tree", "/warehouse", 712),
        new("Supplier Material Mapping", "/warehouse/suppliermaterialmapping", "link", "/warehouse", 713),
        new("Supplier Receiving and QC", "/warehouse/supplierproductandinspect", "verified", "/warehouse", 714),
        new("Warehouse Visualization", "/warehouse/visualization", "visibility", "/warehouse", 715),
    };

    public static async Task SeedAsync(IServiceProvider services)
    {
        var context = services.GetRequiredService<AppDbContext>();
        await EnsureSchemaAsync(context);
        context.ChangeTracker.Clear();

        var now = DateTime.UtcNow;
        var existingPages = await context.Pages.ToListAsync();
        var pagesByRoute = existingPages
            .GroupBy(x => NormalizeRoute(x.Route), StringComparer.OrdinalIgnoreCase)
            .ToDictionary(x => x.Key, x => x.First(), StringComparer.OrdinalIgnoreCase);

        foreach (var definition in SeedPages)
        {
            var route = NormalizeRoute(definition.Route);
            if (!pagesByRoute.TryGetValue(route, out var page))
            {
                page = new Page
                {
                    Id = DeterministicId("page", route),
                    CreatedAt = now
                };
                context.Pages.Add(page);
                pagesByRoute[route] = page;
            }

            page.Name = definition.Name;
            page.Route = route;
            page.Icon = definition.Icon;
            page.DisplayOrder = definition.DisplayOrder;
            page.IsActive = true;
            page.UpdatedAt = now;
        }
        await context.SaveChangesAsync();

        foreach (var definition in SeedPages)
        {
            var page = pagesByRoute[NormalizeRoute(definition.Route)];
            page.ParentPageId = definition.ParentRoute is null
                ? null
                : pagesByRoute[NormalizeRoute(definition.ParentRoute)].Id;
        }

        var permissions = await context.Permissions.ToListAsync();
        foreach (var definition in StandardPermissions)
        {
            var permission = permissions.FirstOrDefault(x =>
                x.Action.Equals(definition.Action, StringComparison.OrdinalIgnoreCase));
            if (permission is null)
            {
                permission = new Permission
                {
                    Id = DeterministicId("permission", definition.Action),
                    CreatedAt = now
                };
                permissions.Add(permission);
                context.Permissions.Add(permission);
            }
            permission.Name = definition.Name;
            permission.Action = definition.Action;
            permission.Description = definition.Description;
            permission.UpdatedAt = now;
        }

        var department = await context.Departments.FirstOrDefaultAsync(x =>
            x.Id == SystemAdministrationDepartmentId || x.DepartmentCode == "SYSADMIN");
        if (department is null)
        {
            department = new Department
            {
                Id = SystemAdministrationDepartmentId,
                CreatedAt = now
            };
            context.Departments.Add(department);
        }
        department.Name = "System Administration";
        department.DepartmentCode = "SYSADMIN";
        department.UpdatedAt = now;

        var superRole = await context.Roles.FirstOrDefaultAsync(x =>
            x.Id == SuperAdminRoleId || x.RoleName == SuperAdminRoleName);
        if (superRole is null)
        {
            superRole = new Role
            {
                Id = SuperAdminRoleId,
                RoleName = SuperAdminRoleName,
                CreatedAt = now
            };
            context.Roles.Add(superRole);
        }
        superRole.RoleName = SuperAdminRoleName;
        superRole.Description = "Protected system administrator with unrestricted access";
        superRole.ModulePageId = null;
        superRole.IsModuleAdmin = false;
        superRole.IsSuperAdmin = true;
        superRole.IsSystem = true;
        superRole.UpdatedAt = now;
        await context.SaveChangesAsync();

        var superEmployee = await context.Employees.FirstOrDefaultAsync(x =>
            x.Id == SuperAdminEmployeeId || x.Email == SuperAdminEmail);
        if (superEmployee is null)
        {
            superEmployee = new Employee
            {
                Id = SuperAdminEmployeeId,
                FirstName = "System",
                LastName = "Administrator",
                PhoneNumber = string.Empty,
                Email = SuperAdminEmail,
                Password = string.Empty,
                CreatedAt = now
            };
            superEmployee.Password = new PasswordHasher<Employee>().HashPassword(
                superEmployee, SuperAdminInitialPassword);
            context.Employees.Add(superEmployee);
        }
        superEmployee.FirstName = "System";
        superEmployee.LastName = "Administrator";
        superEmployee.EmployeeRoleId = superRole.Id;
        superEmployee.DepartmentId = department.Id;
        superEmployee.IsActive = true;
        superEmployee.UpdatedAt = now;
        await context.SaveChangesAsync();

        var existingAccesses = await context.RolePageAccesses
            .Where(x => x.RoleId == superRole.Id).ToListAsync();
        foreach (var page in pagesByRoute.Values)
        {
            var access = existingAccesses.FirstOrDefault(x => x.PageId == page.Id);
            if (access is null)
            {
                access = new RolePageAccess
                {
                    Id = DeterministicId("super-access", page.Id.ToString()),
                    RoleId = superRole.Id,
                    PageId = page.Id,
                    CreatedAt = now,
                    UpdatedAt = now
                };
                existingAccesses.Add(access);
                context.RolePageAccesses.Add(access);
            }

            var existingPermissionIds = await context.RolePagePermissions
                .Where(x => x.RolePageAccessId == access.Id)
                .Select(x => x.PermissionId).ToListAsync();
            foreach (var permission in permissions.Where(x => StandardPermissions.Any(p => p.Action == x.Action)))
            {
                if (existingPermissionIds.Contains(permission.Id)) continue;
                context.RolePagePermissions.Add(new RolePagePermission
                {
                    Id = DeterministicId("super-permission", $"{access.Id}:{permission.Id}"),
                    RolePageAccessId = access.Id,
                    PermissionId = permission.Id,
                    CreatedAt = now,
                    UpdatedAt = now
                });
            }
        }

        await context.SaveChangesAsync();
    }

    private static Guid DeterministicId(string scope, string value)
    {
        var bytes = SHA256.HashData(Encoding.UTF8.GetBytes($"kaam:{scope}:{value}"));
        return new Guid(bytes.AsSpan(0, 16));
    }

    private static string NormalizeRoute(string route)
    {
        var normalized = string.IsNullOrWhiteSpace(route) ? "/" : route.Trim();
        if (!normalized.StartsWith('/')) normalized = "/" + normalized;
        return normalized.Length > 1 ? normalized.TrimEnd('/') : normalized;
    }

    private static Task EnsureSchemaAsync(AppDbContext context) => context.Database.ExecuteSqlRawAsync("""
        IF COL_LENGTH('Roles', 'ModulePageId') IS NULL
            ALTER TABLE [Roles] ADD [ModulePageId] uniqueidentifier NULL;
        IF COL_LENGTH('Roles', 'IsModuleAdmin') IS NULL
            ALTER TABLE [Roles] ADD [IsModuleAdmin] bit NOT NULL CONSTRAINT [DF_Roles_IsModuleAdmin] DEFAULT(0);
        IF COL_LENGTH('Roles', 'IsSuperAdmin') IS NULL
            ALTER TABLE [Roles] ADD [IsSuperAdmin] bit NOT NULL CONSTRAINT [DF_Roles_IsSuperAdmin] DEFAULT(0);
        IF COL_LENGTH('Roles', 'IsSystem') IS NULL
            ALTER TABLE [Roles] ADD [IsSystem] bit NOT NULL CONSTRAINT [DF_Roles_IsSystem] DEFAULT(0);
        IF EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('Pages') AND name = 'Name' AND max_length < 240)
            ALTER TABLE [Pages] ALTER COLUMN [Name] nvarchar(120) NOT NULL;
        IF EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('Pages') AND name = 'Route' AND max_length < 512)
            ALTER TABLE [Pages] ALTER COLUMN [Route] nvarchar(256) NOT NULL;
        IF EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('Employees') AND name = 'Password' AND max_length < 1024)
        BEGIN
            DECLARE @passwordDefault sysname;
            SELECT @passwordDefault = dc.name
            FROM sys.default_constraints dc
            INNER JOIN sys.columns c ON c.default_object_id = dc.object_id
            WHERE dc.parent_object_id = OBJECT_ID('Employees') AND c.name = 'Password';
            IF @passwordDefault IS NOT NULL
                EXEC('ALTER TABLE [Employees] DROP CONSTRAINT [' + @passwordDefault + ']');
            ALTER TABLE [Employees] ALTER COLUMN [Password] nvarchar(512) NOT NULL;
            ALTER TABLE [Employees] ADD CONSTRAINT [DF_Employees_Password] DEFAULT(N'') FOR [Password];
        END
        IF NOT EXISTS (SELECT 1 FROM sys.foreign_keys WHERE name = 'FK_Roles_Pages_ModulePageId')
            ALTER TABLE [Roles] ADD CONSTRAINT [FK_Roles_Pages_ModulePageId]
                FOREIGN KEY ([ModulePageId]) REFERENCES [Pages]([Id]);
        """);
}
