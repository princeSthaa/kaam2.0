import { SidebarSection } from "@/app/components/layout/Sidebar";

export const factoryNavigation: SidebarSection = {
    title: "Factory Management",
    links: [
        { name: "Overview", url: "/factory", icon: "dashboard" },
        { name: "Material Requests", url: "/factory/material-requests", icon: "receipt" },
        { name: "In Progress", url: "/factory/in-progress", icon: "construction" },
        { name: "Factory Inventory", url: "/factory/factory-inventory", icon: "inventory" },
        { name: "Work Center", url: "/factory/work-center", icon: "factory" },
        { name: "Work Order", url: "/factory/work-order", icon: "factory" },
        { name: "Bill Of Materials", url: "/factory/bill-of-materials", icon: "receipt" },

        // { name: "Audit Log", url: "/crm/audit", icon: "history" },
    ],
};