"use client";

const adminSessionStorageKey = "lexevo.admin.session.token";

export function readAdminSessionToken() {
  if (typeof window === "undefined") {
    return null;
  }

  return window.localStorage.getItem(adminSessionStorageKey);
}

export function writeAdminSessionToken(token: string) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(adminSessionStorageKey, token);
}

export function clearAdminSessionToken() {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.removeItem(adminSessionStorageKey);
}
