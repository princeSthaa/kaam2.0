"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from "react";
import { usePathname } from "next/navigation";
import {
  canAccessModule as profileCanAccessModule,
  canAccessRoute as profileCanAccessRoute,
  type CurrentUserAccess,
} from "./rbac-profile";

export interface RbacContextValue {
  currentUser: CurrentUserAccess | null;
  isAdmin: boolean;
  isLoaded: boolean;
  canAccessRoute: (routeUrl: string) => boolean;
  canAccessModule: (modulePrefix: string) => boolean;
  canPerform: (routeUrl: string, action: string) => boolean;
  refreshProfile: () => Promise<void>;
}

export interface RolePageAccessRule {
  id: string;
  roleId: string;
  pageId: string;
  roleName?: string;
  pageName?: string;
  pageRoute?: string;
}

const defaultContextValue: RbacContextValue = {
  currentUser: null,
  isAdmin: false,
  isLoaded: false,
  canAccessRoute: () => false,
  canAccessModule: () => false,
  canPerform: () => false,
  refreshProfile: async () => {},
};

const RbacContext = createContext<RbacContextValue>(defaultContextValue);

export function RbacProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [currentUser, setCurrentUser] = useState<CurrentUserAccess | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  const fetchProfile = useCallback(async () => {
    try {
      const response = await fetch("/api/bff/auth/me", { cache: "no-store" });
      if (response.ok) {
        const profile: CurrentUserAccess = await response.json();
        setCurrentUser(profile);
      } else {
        setCurrentUser(null);
      }
    } catch {
      setCurrentUser(null);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  // Fetch profile on initial mount, or if navigating from login
  useEffect(() => {
    if (pathname === "/login" || pathname.startsWith("/login")) {
      setCurrentUser(null);
      setIsLoaded(true);
      return;
    }

    // If we haven't loaded yet or if currentUser is null, fetch the profile
    if (!currentUser) {
      fetchProfile();
    }
  }, [pathname, currentUser, fetchProfile]);

  const isAdmin = currentUser?.isSuperAdmin === true;

  const canAccessRoute = useCallback(
    (routeUrl: string): boolean => {
      return profileCanAccessRoute(currentUser, routeUrl, "GET");
    },
    [currentUser]
  );

  const canAccessModule = useCallback(
    (modulePrefix: string): boolean => {
      return profileCanAccessModule(currentUser, modulePrefix);
    },
    [currentUser]
  );

  const canPerform = useCallback(
    (routeUrl: string, action: string): boolean => {
      return profileCanAccessRoute(currentUser, routeUrl, action);
    },
    [currentUser]
  );

  const value = useMemo(
    () => ({
      currentUser,
      isAdmin,
      isLoaded,
      canAccessRoute,
      canAccessModule,
      canPerform,
      refreshProfile: fetchProfile,
    }),
    [currentUser, isAdmin, isLoaded, canAccessRoute, canAccessModule, canPerform, fetchProfile]
  );

  return <RbacContext.Provider value={value}>{children}</RbacContext.Provider>;
}

export function useRbac(): RbacContextValue {
  const context = useContext(RbacContext);
  return context ?? defaultContextValue;
}
