import { randomUUID } from "crypto";
import type { Request } from "express";

import { env } from "../../config/env";

export const adminSessionHeaderName = "x-admin-session";

type AdminIdentity = {
  email: string;
  displayName: string;
};

type AdminSessionRecord = {
  token: string;
  createdAt: number;
  expiresAt: number;
} & AdminIdentity;

const adminSessions = new Map<string, AdminSessionRecord>();

function getAdminIdentity(): AdminIdentity {
  return {
    email: env.ADMIN_EMAIL,
    displayName: "Rajeev"
  };
}

function clearExpiredSessions() {
  const now = Date.now();

  for (const [token, session] of adminSessions.entries()) {
    if (session.expiresAt <= now) {
      adminSessions.delete(token);
    }
  }
}

function serializeSession(session: AdminSessionRecord) {
  return {
    sessionToken: session.token,
    createdAt: new Date(session.createdAt).toISOString(),
    expiresAt: new Date(session.expiresAt).toISOString(),
    admin: {
      email: session.email,
      displayName: session.displayName
    }
  };
}

function getSessionFromToken(token: string | undefined) {
  if (!token) {
    return null;
  }

  clearExpiredSessions();

  const session = adminSessions.get(token);

  if (!session) {
    return null;
  }

  if (session.expiresAt <= Date.now()) {
    adminSessions.delete(token);
    return null;
  }

  return session;
}

export function loginAdmin(email: string, password: string) {
  const normalizedEmail = email.trim().toLowerCase();
  const adminIdentity = getAdminIdentity();

  if (normalizedEmail !== adminIdentity.email.toLowerCase() || password !== env.ADMIN_PASSWORD) {
    return null;
  }

  const createdAt = Date.now();
  const expiresAt = createdAt + env.ADMIN_SESSION_TTL_MINUTES * 60_000;
  const token = randomUUID();

  const session: AdminSessionRecord = {
    token,
    createdAt,
    expiresAt,
    email: adminIdentity.email,
    displayName: adminIdentity.displayName
  };

  adminSessions.set(token, session);

  return serializeSession(session);
}

export function readAdminSession(request: Request) {
  const token = request.header(adminSessionHeaderName)?.trim();
  const session = getSessionFromToken(token);

  if (!session) {
    return null;
  }

  return serializeSession(session);
}

export function revokeAdminSession(request: Request) {
  const token = request.header(adminSessionHeaderName)?.trim();

  if (token) {
    adminSessions.delete(token);
  }
}
