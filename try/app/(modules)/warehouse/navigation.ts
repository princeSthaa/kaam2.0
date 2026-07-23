import { SidebarSection } from "@/app/components/layout/Sidebar";

export const warehouseNavigation: SidebarSection = {
  title: "Warehouse Menu",
  links: [
    { name: "Overview", url: "/warehouse", icon: "dashboard" },
    { name: "Stock", url: "/warehouse/stock", icon: "inventory" },
    { name: "Structure Management", url: "/warehouse/structuremanagment", icon: "account_tree" },
    { name: "Visualization", url: "/warehouse/visualization", icon: "visibility" },
    { name: "Factory Requests", url: "/warehouse/factoryrequest", icon: "precision_manufacturing" },
    { name: "Purchase Order", url: "/warehouse/purchaseorder", icon: "receipt_long" },
    { name: "Supplier Directory", url: "/warehouse/suppliermaterialmapping", icon: "factory" },
    { name: "Supplier Request", url: "/warehouse/purchasedemand", icon: "shopping_cart_checkout" },
    { name: "Issue to Factory", url: "/warehouse/issue", icon: "forklift" },
    { name: "Receive & Inspect", url: "/warehouse/receive", icon: "fact_check" },
    { name: "Sales & Dispatch", url: "/warehouse/dispatch", icon: "local_shipping" },
    { name: "Customer Returns", url: "/warehouse/damagereturn", icon: "assignment_return" },
  ],
};
