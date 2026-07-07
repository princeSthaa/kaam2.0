export type SidebarLink = {
  name: string;
  url: string;
  icon: string;
};

export type SidebarSection = {
  title: string;
  links: SidebarLink[];
};

export const sidebarMap: Record<string, SidebarSection> = {
  production: {
    title: "Production Menu",
    links: [
      { name: "Overview", url: "/Production/Index", icon: "dashboard" },
      { name: "Drafts", url: "/Production/Drafts", icon: "edit_note" },
      { name: "In Progress", url: "/Production/InProgress", icon: "precision_manufacturing" },
      { name: "Completed", url: "/Production/Completed", icon: "task_alt" },
      { name: "Plans", url: "/Production/Plan/PlansDetails", icon: "assignment" },
      { name: "Demands", url: "/Production/Create", icon: "dynamic_feed" },
    ],
  },
  crm: {
    title: "Customer Management",
    links: [
      { name: "Overview", url: "/CRM/Index", icon: "dashboard" },
      { name: "Filter Customers", url: "/CRM/CustomerFilter/Index", icon: "filter_list" },
      { name: "Create Customer", url: "/CRM/Customer/CreateCustomer", icon: "add_circle" },
      { name: "Create Order", url: "/CRM/Order/CreateOrder", icon: "add_circle" },
      { name: "Audit Log", url: "/CRM/Audit", icon: "history" },
    ],
  },
  warehouse: {
    title: "Warehouse Menu",
    links: [
      { name: "Overview", url: "/Warehouse/Index", icon: "dashboard" },
      { name: "Stock", url: "/Warehouse/Stock", icon: "inventory" },
      { name: "Visualization", url: "/Warehouse/Visualization", icon: "visibility" },
    ],
  },
};

export const topLinks = [
  { label: "Dashboard", href: "/" },
  { label: "CRM", href: "/CRM/Index" },
  { label: "Production", href: "/Production/Index" },
  { label: "Warehouse", href: "/Warehouse/Index" },
  { label: "Analytics", href: "/Analytics/Index" },
  { label: "Privacy", href: "/Privacy" },
];
