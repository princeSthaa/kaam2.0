import { SidebarSection } from "@/app/components/layout/Sidebar";

export const srmNavigation: SidebarSection = {
    title: "Supplier Management",
    links: [
        { name: "Suppliers", url: "/srm/suppliers", icon: "factory" },
        { name: "Materials", url: "/srm/materials", icon: "inventory_2" },
        { name: "Performance", url: "/srm/performance", icon: "query_stats" },
        { name: "Contracts", url: "/srm/contracts", icon: "description" },
        { name: "Analytics", url: "/srm/analytics", icon: "insights" },
    ],
};