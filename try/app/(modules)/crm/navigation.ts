import { SidebarSection } from "@/app/components/layout/Sidebar";

export const crmNavigation: SidebarSection = {
  title: "Customer Management",
  links: [
    { name: "Overview", url: "/crm", icon: "dashboard" },
    { name: "Filter Customers", url: "/crm/customers", icon: "filter_list" },
    { name: "Create Customer", url: "/crm/customers/new", icon: "add_circle" },
    { name: "Create Order", url: "/crm/orders/new", icon: "add_circle" },
    { name: "Audit Log", url: "/crm/audit", icon: "history" },
  ],
};
