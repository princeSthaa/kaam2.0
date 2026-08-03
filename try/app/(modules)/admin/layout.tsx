import { Sidebar } from "@/app/components/layout/Sidebar";
import { adminNavigation } from "./navigation";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="layout-wrapper">
            <Sidebar section={adminNavigation} />
            <main className="main-content flex-1 w-full p-6">
                {children}
            </main>
        </div>
    );
}
