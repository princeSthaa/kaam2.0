import { SidebarSection } from "@/app/components/layout/Sidebar";

export const adminNavigation: SidebarSection = {
    title: "Admin Menu",
    links: [
        { name: "Overview", url: "/admin", icon: "dashboard" },
        { name: "Employees", url: "/admin/usersandrbac", icon: "badge" },
        { name: "Master Data", url: "/admin/masterdata", icon: "library_add" },
        { name: "Product directory", url: "/admin/product", icon: "category" },
        { name: "Material directory", url: "/admin/material", icon: "precision_manufacturing" },
        { name: "Supplier directory", url: "/admin/suppliers", icon: "person" },
        { name: "Supplied materials", url: "/admin/suppliedmaterialdirectory", icon: "inventory_2" },
        { name: "Work Force", url: "/admin/workforce", icon: "person" },
        { name: "Warehouse directory", url: "/admin/warehousedirectory", icon: "warehouse" },
        { name: "Audit Logs", url: "/admin/auditlogs", icon: "receipt_long" },
    ],
};
