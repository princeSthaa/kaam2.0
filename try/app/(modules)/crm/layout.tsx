import { Sidebar } from "@/app/components/layout/Sidebar";
import { crmNavigation } from "./navigation";

export default function CrmLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="layout-wrapper">
      <Sidebar section={crmNavigation} />
      <main className="main-content flex-1 w-full p-6">
        {children}
      </main>
    </div>
  );
}
