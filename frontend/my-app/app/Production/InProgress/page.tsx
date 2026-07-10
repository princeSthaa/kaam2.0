"use client";
import React from 'react';
import { AppHeader } from "@/app/components/AppHeader";
import { Sidebar } from "@/app/components/Sidebar";
import { PageShell } from "@/app/components/ui/PageShell";
import { usePathname } from "next/navigation";
import InProgressDashboard from './components/InProgressDashboard';

export default function InProgressPage() {
  const pathname = usePathname();

  return (
    <>
      <AppHeader pathname={pathname} />
      <PageShell sidebar={<Sidebar section="production" pathname={pathname} />}>
        <InProgressDashboard />
      </PageShell>
    </>
  );
}
