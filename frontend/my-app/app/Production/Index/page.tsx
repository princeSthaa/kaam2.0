import ProductionDashboard from './components/ProductionDashboard';
import { AppHeader } from "@/app/components/AppHeader";
import { Sidebar } from "@/app/components/Sidebar";
import { PageShell } from "@/app/components/ui/PageShell";

export default function Page() {
  return (
    <>
      <AppHeader pathname="/Production/Index" />
      <PageShell sidebar={<Sidebar section="production" pathname="/Production/Index" />}>
        <ProductionDashboard />
      </PageShell>
    </>
  );
}
