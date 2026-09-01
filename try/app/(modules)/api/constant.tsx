export const API_MAIN_URL = "/api/bff";

const configuredBackendOrigin =
  process.env.NEXT_PUBLIC_KAAM_BACKEND_ORIGIN?.trim();

if (!configuredBackendOrigin) {
  throw new Error(
    "Missing required public environment variable: NEXT_PUBLIC_KAAM_BACKEND_ORIGIN"
  );
}

export const BACKEND_ORIGIN = configuredBackendOrigin.replace(/\/+$/, "");
export const AUTH_SERVER = BACKEND_ORIGIN;
