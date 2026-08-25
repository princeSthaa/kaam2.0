"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  fetchEmployees,
  loginUser,
  EmployeeDto,
  AuthUser,
} from "../(modules)/admin/api/constant";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const inputEmail = email.trim();
    const inputPassword = password.trim();

    if (!inputEmail || !inputPassword) {
      setErrorMessage("Please enter both your work email and password.");
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      // 1. Fetch live employees from api/employee
      let employeeList: EmployeeDto[] = [];
      try {
        const data = await fetchEmployees();
        if (Array.isArray(data) && data.length > 0) {
          employeeList = data;
        }
      } catch (apiErr) {
        console.warn("Could not fetch live employees from API:", apiErr);
      }

      // Fallback to session-cached employee records if API offline or empty
      if (employeeList.length === 0 && typeof window !== "undefined") {
        try {
          const stored = sessionStorage.getItem("rbac_employees");
          if (stored) {
            employeeList = JSON.parse(stored);
          }
        } catch {}
      }

      // 2. Look for matching employee record
      const query = inputEmail.toLowerCase();
      const matchedEmployee = employeeList.find((emp) => {
        const empEmail = (emp.email || "").trim().toLowerCase();
        const empUsername = (emp.username || "").trim().toLowerCase();
        const empPhone = (emp.phoneNumber || "").trim();
        const fullName = (emp.fullName || `${emp.firstName} ${emp.lastName}`).trim().toLowerCase();

        return (
          empEmail === query ||
          empUsername === query ||
          empPhone === inputEmail ||
          fullName === query
        );
      });

      if (!matchedEmployee) {
        // If not found in employee list, try auth/login direct endpoint fallback
        try {
          const authResponse = await loginUser({
            email: inputEmail,
            username: inputEmail,
            password: inputPassword,
          });

          if (authResponse && authResponse.user) {
            const authUser = authResponse.user;
            if (typeof window !== "undefined") {
              sessionStorage.setItem("auth_user", JSON.stringify(authUser));
              sessionStorage.setItem("auth_token", authResponse.token || `token-${Date.now()}`);
              if (rememberMe) localStorage.setItem("auth_user", JSON.stringify(authUser));
            }
            setSuccessMessage(`Welcome back, ${authUser.fullName || authUser.email}!`);
            setTimeout(() => router.push("/admin/usersandrbac"), 600);
            return;
          }
        } catch (authErr) {
          // Both failed
          throw new Error("No employee account found with this email or username.");
        }
        throw new Error("No employee account found with this email or username.");
      }

      // 3. Verify password from api/employee
      if (matchedEmployee.password) {
        if (matchedEmployee.password !== inputPassword) {
          throw new Error("Invalid password for this account.");
        }
      }

      // 4. Verify employee active status
      if (matchedEmployee.isActive === false) {
        throw new Error("This account is currently deactivated. Please contact your system administrator.");
      }

      // 5. Successful login
      const displayName =
        matchedEmployee.fullName ||
        `${matchedEmployee.firstName} ${matchedEmployee.lastName}`.trim();

      const loggedInUser: AuthUser = {
        id: matchedEmployee.id,
        fullName: displayName,
        email: matchedEmployee.email || inputEmail,
        roleName: matchedEmployee.roleName || "Administrator",
        departmentName: matchedEmployee.departmentName || "Engineering",
        phoneNumber: matchedEmployee.phoneNumber,
      };

      if (typeof window !== "undefined") {
        sessionStorage.setItem("auth_user", JSON.stringify(loggedInUser));
        sessionStorage.setItem("auth_token", `token-${matchedEmployee.id}-${Date.now()}`);
        if (rememberMe) {
          localStorage.setItem("auth_user", JSON.stringify(loggedInUser));
        }
      }

      let targetUrl = "/admin/usersandrbac";
      const isAdminRole = (matchedEmployee.roleName || "").toLowerCase().includes("admin");

      if (!isAdminRole && typeof window !== "undefined") {
        try {
          const storedRules = sessionStorage.getItem("rbac_role_page_accesses");
          if (storedRules) {
            const parsedRules = JSON.parse(storedRules);
            const userRole = (matchedEmployee.roleName || "").toLowerCase();
            const firstRule = parsedRules.find(
              (r: any) => (r.roleName || "").toLowerCase() === userRole && r.pageRoute
            );
            if (firstRule?.pageRoute) {
              targetUrl = firstRule.pageRoute;
            }
          }
        } catch {}
      }

      setSuccessMessage(`Welcome back, ${displayName}!`);
      setTimeout(() => {
        router.push(targetUrl);
      }, 600);
    } catch (err: any) {
      setErrorMessage(err.message || "Sign in failed. Please check your credentials.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 sm:p-6 bg-slate-50 text-slate-900 font-sans">
      <div className="w-full max-w-md space-y-6">
        {/* Brand Header */}
        <div className="text-center">
          <h1 className="text-3xl font-black tracking-tight text-slate-900 font-mono">
            kaam
          </h1>
        </div>

        {/* Login Card */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-sm space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <h2 className="text-base font-bold text-slate-900">Sign in</h2>
          </div>

          {/* Alert / Notification banners */}
          {errorMessage && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl flex items-center gap-2.5 text-xs font-medium animate-fadeIn">
              <span className="material-symbols-outlined text-rose-600 text-base shrink-0">error</span>
              <span>{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl flex items-center gap-2.5 text-xs font-medium animate-fadeIn">
              <span className="material-symbols-outlined text-emerald-600 text-base shrink-0">check_circle</span>
              <span>{successMessage}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-4">
            {/* Work Email / Username */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-700 font-mono">
                Work Email / Username
              </label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-lg">
                  alternate_email
                </span>
                <input
                  type="text"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-medium text-xs focus:bg-white focus:ring-2 focus:ring-slate-900 focus:outline-none transition-all"
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-700 font-mono">
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => alert("Password reset request sent.")}
                  className="text-[11px] text-slate-500 hover:text-slate-900 transition-colors font-mono"
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-lg">
                  lock
                </span>
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-medium text-xs focus:bg-white focus:ring-2 focus:ring-slate-900 focus:outline-none transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  <span className="material-symbols-outlined text-base">
                    {showPassword ? "visibility_off" : "visibility"}
                  </span>
                </button>
              </div>
            </div>

            {/* Remember Me */}
            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded bg-white border-slate-300 text-slate-900 focus:ring-slate-900 cursor-pointer accent-slate-900"
                />
                <span className="text-xs text-slate-600">Remember session</span>
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 px-4 bg-slate-900 text-white font-bold text-xs rounded-xl shadow hover:bg-slate-800 transition-all flex items-center justify-center gap-2 disabled:opacity-50 active:scale-95"
            >
              {isLoading ? (
                <>
                  <span className="material-symbols-outlined text-base animate-spin">progress_activity</span>
                  <span>Signing In...</span>
                </>
              ) : (
                <>
                  <span>Sign In</span>
                  <span className="material-symbols-outlined text-base">arrow_forward</span>
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
