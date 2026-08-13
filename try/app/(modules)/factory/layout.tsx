import { Sidebar } from "@/app/components/layout/Sidebar";
import { factoryNavigation } from "./navigation";


export default function FactoryLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <div className="layout-wrapper">
            <Sidebar section={factoryNavigation} />
            <main className="main-content flex-1 w-full p-6">
                {children}
            </main>
        </div>
    );
}
