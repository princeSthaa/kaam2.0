import { Sidebar } from "@/app/components/layout/Sidebar";
import { productionNavigation } from "./navigation";
import "./styles/production-plans.css";

export default function ProductionLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="layout-wrapper">
      <Sidebar section={productionNavigation} />
      <main className="main-content flex-1 w-full p-6">
        {children}
      </main>
    </div>
  );
}
