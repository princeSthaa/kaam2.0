import { SidebarSection } from "@/app/components/layout/Sidebar";

export const warehouseNavigation: SidebarSection = {
  title: "Warehouse Menu",
  links: [
    { name: "Overview", url: "/warehouse", icon: "dashboard" },
    { name: "Stock", url: "/warehouse/stock", icon: "inventory" },
    { name: "Visualization", url: "/warehouse/visualization", icon: "visibility" },
  ],
};
