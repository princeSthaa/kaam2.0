import crypto from "crypto";

export interface AuthSession {
  accessToken: string;
  refreshToken?: string;
  expiresAt: number;
}

type GlobalSessionStore = typeof globalThis & {
  __kaamSessions?: Map<string, AuthSession>;
};

const globalStore = globalThis as GlobalSessionStore;

const sessions =
  globalStore.__kaamSessions ??
  new Map<string, AuthSession>();

globalStore.__kaamSessions = sessions;

export function createSession(
  session: AuthSession
): string {
  const sessionId =
    crypto.randomBytes(32).toString("base64url");

  sessions.set(sessionId, session);

  console.log(
    "SESSION CREATED:",
    sessionId,
    "TOTAL:",
    sessions.size
  );

  return sessionId;
}

export function getSession(
  sessionId: string
): AuthSession | undefined {
  const session = sessions.get(sessionId);

  console.log(
    "SESSION LOOKUP:",
    sessionId,
    session ? "FOUND" : "MISSING",
    "TOTAL:",
    sessions.size
  );

  return session;
}

export function updateSession(
  sessionId: string,
  session: AuthSession
) {
  sessions.set(sessionId, session);
}

export function deleteSession(
  sessionId: string
) {
  sessions.delete(sessionId);
}