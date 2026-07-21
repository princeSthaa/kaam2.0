import { Sidebar } from "@/app/components/layout/Sidebar";
import { warehouseNavigation } from "./navigation";

export default function WarehouseLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="layout-wrapper">
      <Sidebar section={warehouseNavigation} />
      <main className="main-content flex-1 w-full p-6">
        {children}
      </main>
    </div>
  );
}
