import { Sidebar } from "@/app/components/layout/Sidebar";
import { SidebarSection } from "@/app/components/layout/Sidebar";

export const inventoryNavigation: SidebarSection = {
  title: "Inventory Menu",
  links: [
    { name: "Overview", url: "/inventory", icon: "inventory_2" },
  ],
};

export default function InventoryLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="layout-wrapper">
      <Sidebar section={inventoryNavigation} />
      <main className="main-content flex-1 w-full p-6">
        {children}
      </main>
    </div>
  );
}
