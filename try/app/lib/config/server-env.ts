import "server-only";

function requireServerEnv(name: string): string {
  const value = process.env[name]?.trim();

  if (!value) {
    throw new Error(`Missing required server environment variable: ${name}`);
  }

  return value;
}

function withoutTrailingSlash(value: string): string {
  return value.replace(/\/+$/, "");
}

export const BACKEND_API_URL = withoutTrailingSlash(
  requireServerEnv("KAAM_BACKEND_API_URL")
);

export const AUTH_SERVER = withoutTrailingSlash(
  requireServerEnv("KAAM_AUTH_SERVER")
);

export const CLIENT_ID = requireServerEnv("KAAM_CLIENT_ID");
export const CLIENT_SECRET = requireServerEnv("KAAM_CLIENT_SECRET");
export const REDIRECT_URI = requireServerEnv("KAAM_REDIRECT_URI");
