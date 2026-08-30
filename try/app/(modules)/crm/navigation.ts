import { SidebarSection } from "@/app/components/layout/Sidebar";

export const crmNavigation: SidebarSection = {
  title: "Customer Management",
  links: [
    { name: "Overview", url: "/crm", icon: "dashboard" },
    { name: "Recent Customer Orders", url: "/crm/orders", icon: "receipt_long" },
    { name: "Filter Customers", url: "/crm/customers", icon: "filter_list" },
    { name: "Create Customer", url: "/crm/customers/new", icon: "person_add" },
    { name: "Create Order", url: "/crm/orders/new", icon: "add_circle" },
  ],
};
