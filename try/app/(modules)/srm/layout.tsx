import { Sidebar } from "@/app/components/layout/Sidebar";
import { srmNavigation } from "./navigation";

export default function SrmLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="layout-wrapper">
      <Sidebar section={srmNavigation} />
      <main className="main-content flex-1 w-full p-6 bg-slate-50 min-h-screen">
        {children}
      </main>
    </div>
  );
}
