import { redirect } from "next/navigation";
import { headers } from "next/headers";

import { getCurrentAccess } from "@/app/lib/auth/current-access";
import { canAccessRoute } from "@/app/lib/auth/rbac-profile";
import { ClientRouteGuard } from "@/app/components/auth/ClientRouteGuard";

export default async function AuthenticatedModulesLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const profile = await getCurrentAccess();

  if (!profile) {
    redirect("/login");
  }

  const pathname = (await headers()).get("x-kaam-pathname");
  if (pathname && !canAccessRoute(profile, pathname, "GET")) {
    redirect("/access-denied");
  }

  return <ClientRouteGuard>{children}</ClientRouteGuard>;
}
