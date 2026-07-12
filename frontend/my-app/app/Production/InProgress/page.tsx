"use client";
import React from 'react';
import { AppHeader } from "@/app/components/AppHeader";
import { Sidebar } from "@/app/components/Sidebar";
import { PageShell } from "@/app/components/ui/PageShell";
import { usePathname } from "next/navigation";
import Script from "next/script";
import InProgressDashboard from './components/InProgressDashboard';

export default function InProgressPage() {
  const pathname = usePathname();

  return (
    <>
      <Script
        src="https://nepalidatepicker.sajanmaharjan.com.np/v5/nepali.datepicker/js/nepali.datepicker.v5.0.6.min.js"
        strategy="lazyOnload"
      />
      <AppHeader pathname={pathname} />
      <PageShell sidebar={<Sidebar section="production" pathname={pathname} />}>
        <InProgressDashboard />
      </PageShell>
    </>
  );
}
