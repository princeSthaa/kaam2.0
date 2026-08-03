import { SidebarSection } from "@/app/components/layout/Sidebar";

export const adminNavigation: SidebarSection = {
    title: "Admin Menu",
    links: [
        { name: "Overview", url: "/admin", icon: "dashboard" },
        { name: "Users", url: "/admin/usersandrbac", icon: "person" },
        { name: "Master Data", url: "/admin/masterdata", icon: "library_add" },
        { name: "Audit Logs", url: "/admin/auditlogs", icon: "receipt_long" },
    ],
};
