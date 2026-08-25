import { adminNavigation } from "@/app/(modules)/admin/navigation";
import { crmNavigation } from "@/app/(modules)/crm/navigation";
import { warehouseNavigation } from "@/app/(modules)/warehouse/navigation";
import { factoryNavigation } from "@/app/(modules)/factory/navigation";
import { productionNavigation } from "@/app/(modules)/production/navigation";
import { srmNavigation } from "@/app/(modules)/srm/navigation";
import { PageDto } from "../api/constant";

export interface ModuleNavigationSection {
  moduleName: string;
  title: string;
  links: Array<{ name: string; url: string; icon: string }>;
}

export const ALL_MODULE_NAVIGATIONS: ModuleNavigationSection[] = [
  { moduleName: "Admin", title: adminNavigation.title, links: adminNavigation.links },
  { moduleName: "CRM", title: crmNavigation.title, links: crmNavigation.links },
  { moduleName: "Warehouse", title: warehouseNavigation.title, links: warehouseNavigation.links },
  { moduleName: "Factory", title: factoryNavigation.title, links: factoryNavigation.links },
  { moduleName: "Production", title: productionNavigation.title, links: productionNavigation.links },
  { moduleName: "SRM", title: srmNavigation.title, links: srmNavigation.links },
];

/**
 * Aggregates all registered system pages from API along with navigation routes
 * defined in navigation.ts across all modules (Admin, CRM, Warehouse, Factory, Production, SRM).
 */
export function getAllModulePages(existingPages: PageDto[] = []): {
  allPages: PageDto[];
  groupedByModule: Record<string, PageDto[]>;
} {
  const pageMap = new Map<string, PageDto>();

  // 1. Add existing registered API pages
  existingPages.forEach((p) => {
    if (p.route) {
      pageMap.set(p.route.toLowerCase(), p);
    } else if (p.id) {
      pageMap.set(p.id.toLowerCase(), p);
    }
  });

  // 2. Add navigation.ts pages across all modules
  ALL_MODULE_NAVIGATIONS.forEach((module) => {
    module.links.forEach((link, idx) => {
      const key = link.url.toLowerCase();
      const existing = pageMap.get(key);
      if (existing) {
        if (!existing.parentPageName) {
          existing.parentPageName = module.moduleName;
        }
        if (!existing.icon && link.icon) {
          existing.icon = link.icon;
        }
      } else {
        pageMap.set(key, {
          id: `page-${module.moduleName.toLowerCase()}-${idx + 1}`,
          name: link.name,
          route: link.url,
          icon: link.icon,
          parentPageName: module.moduleName,
          displayOrder: idx + 1,
          isActive: true,
        });
      }
    });
  });

  const allPages = Array.from(pageMap.values());

  // Group pages by module / category
  const groupedByModule: Record<string, PageDto[]> = {};
  allPages.forEach((p) => {
    const groupName = p.parentPageName || (p.route.startsWith("/crm") ? "CRM" : p.route.startsWith("/warehouse") ? "Warehouse" : p.route.startsWith("/factory") ? "Factory" : p.route.startsWith("/production") ? "Production" : p.route.startsWith("/srm") ? "SRM" : "Admin");
    if (!groupedByModule[groupName]) {
      groupedByModule[groupName] = [];
    }
    groupedByModule[groupName].push(p);
  });

  return { allPages, groupedByModule };
}
