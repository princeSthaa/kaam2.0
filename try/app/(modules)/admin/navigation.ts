import { SidebarSection } from "@/app/components/layout/Sidebar";

export const adminNavigation: SidebarSection = {
    title: "Admin Menu",
    links: [
        { name: "Overview", url: "/admin", icon: "dashboard" },
        { name: "Users", url: "/admin/usersandrbac", icon: "person" },
        { name: "Master Data", url: "/admin/masterdata", icon: "library_add" },
        { name: "Product directory", url: "/admin/product", icon: "category" },
        { name: "Material directory", url: "/admin/material", icon: "precision_manufacturing" },
        { name: "Supplier directory", url: "/admin/suppliers", icon: "person" },
        { name: "Supplied materials", url: "/admin/suppliedmaterialdirectory", icon: "inventory_2" },
        { name: "Work Force", url: "/admin/workforce", icon: "person" },
        { name: "Audit Logs", url: "/admin/auditlogs", icon: "receipt_long" },
    ],
};
