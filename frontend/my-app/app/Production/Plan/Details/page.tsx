import { Suspense } from "react";
import LegacyPage from "@/app/components/LegacyPage";

export default function Page() {
  return (
    <Suspense fallback={null}>
      <LegacyPage />
    </Suspense>
  );
}
