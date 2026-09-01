export type RbacPageGrant = {
  pageId: string;
  pageName: string;
  route: string;
  parentPageId?: string | null;
  actions: string[];
};

export type CurrentUserAccess = {
  id: string;
  fullName: string;
  email: string;
  phoneNumber?: string;
  roleId: string;
  roleName: string;
  modulePageId?: string | null;
  moduleName?: string | null;
  moduleRoute?: string | null;
  departmentName?: string;
  isModuleAdmin: boolean;
  isSuperAdmin: boolean;
  pageGrants: RbacPageGrant[];
};

function normalizeRoute(route: string) {
  const value = route?.trim() || "/";
  // Strip query string and hash before normalization
  const withoutQuery = value.split("?")[0].split("#")[0];
  const withSlash = withoutQuery.startsWith("/") ? withoutQuery : `/${withoutQuery}`;
  return withSlash.length > 1 ? withSlash.replace(/\/+$/, "") : withSlash;
}

function routeMatches(template: string, requestPath: string) {
  const templateParts = normalizeRoute(template).split("/").filter(Boolean);
  const pathParts = normalizeRoute(requestPath).split("/").filter(Boolean);
  if (templateParts.length !== pathParts.length) return false;
  return templateParts.every((part, index) =>
    /^\[.+\]$/.test(part) || part.toLowerCase() === pathParts[index]?.toLowerCase()
  );
}

export function canAccessRoute(profile: CurrentUserAccess | null, route: string, action = "GET") {
  if (!profile) return false;
  if (profile.isSuperAdmin) return true;
  const normalizedAction = action.toUpperCase() === "PATCH" ? "PUT" : action.toUpperCase();
  const exact = profile.pageGrants.find((grant) =>
    normalizeRoute(grant.route).toLowerCase() === normalizeRoute(route).toLowerCase()
  );
  const grant = exact ?? profile.pageGrants
    .filter((item) => routeMatches(item.route, route))
    .sort((left, right) => right.route.length - left.route.length)[0];
  return Boolean(grant?.actions.some((allowed) => allowed.toUpperCase() === normalizedAction));
}

export function canAccessModule(profile: CurrentUserAccess | null, moduleRoute: string) {
  if (!profile) return false;
  if (profile.isSuperAdmin) return true;
  const prefix = normalizeRoute(moduleRoute).toLowerCase();
  return profile.pageGrants.some((grant) => {
    const route = normalizeRoute(grant.route).toLowerCase();
    return grant.actions.some((action) => action.toUpperCase() === "GET") &&
      (route === prefix || route.startsWith(`${prefix}/`));
  });
}
