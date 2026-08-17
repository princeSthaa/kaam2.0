import { SidebarSection } from "@/app/components/layout/Sidebar";

export const srmNavigation: SidebarSection = {
    title: "Supplier Management",
    links: [
        { name: "Suppliers", url: "/srm/suppliers", icon: "dashboard" },
        { name: "Materials", url: "/srm/materials", icon: "add_circle" },
        { name: "Create Order", url: "/crm/orders/new", icon: "add_circle" },
        { name: "Audit Log", url: "/crm/audit", icon: "history" },
    ],
};