import { Sidebar } from "@/app/components/layout/Sidebar";
import { SidebarSection } from "@/app/components/layout/Sidebar";

export const adminNavigation: SidebarSection = {
    title: "Admin Menu",
    links: [
        { name: "Overview", url: "/admin", icon: "inventory_2" },
    ],
};

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
