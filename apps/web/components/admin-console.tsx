"use client";

import Link from "next/link";
import { useEffect, useState, type FormEvent } from "react";

import { apiBaseUrl } from "./api-base-url";
import { clearAdminSessionToken, readAdminSessionToken, writeAdminSessionToken } from "./admin-session";

const adminSessionHeaderName = "x-admin-session";
const defaultAdminCredentials = {
  email: "rajeev@sagiam.com",
  password: "Sagiam.com"
};

type AdminSessionPayload = {
  sessionToken: string;
  createdAt: string;
  expiresAt: string;
  admin: {
    email: string;
    displayName: string;
  };
};

type AdminOverviewPayload = {
  generatedAt: string;
  admin: {
    email: string;
    displayName: string;
  };
  snapshot: {
    totalLawyers: number;
    totalCities: number;
    totalPracticeAreas: number;
    liveApiRoutes: number;
    averageRating: number;
    averageConsultationFeeInr: number;
  };
  practiceAreas: string[];
  cityCoverage: Array<{
    city: string;
    lawyers: number;
  }>;
  lawyers: Array<{
    handle: string;
    fullName: string;
    city: string;
    practiceAreas: string[];
    averageRating: number;
    consultationFeeInr: number;
    responseTimeLabel: string;
  }>;
  routes: Array<{
    label: string;
    path: string;
  }>;
};

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(new Date(value));
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0
  }).format(value);
}

export function AdminConsole() {
  const [credentials, setCredentials] = useState(defaultAdminCredentials);
  const [session, setSession] = useState<AdminSessionPayload | null>(null);
  const [overview, setOverview] = useState<AdminOverviewPayload | null>(null);
  const [isBootstrapping, setIsBootstrapping] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [statusMessage, setStatusMessage] = useState("");

  async function fetchAdminSession(token: string) {
    const response = await fetch(`${apiBaseUrl}/api/auth/admin/session`, {
      headers: {
        [adminSessionHeaderName]: token
      },
      cache: "no-store"
    });

    if (!response.ok) {
      throw new Error("Admin session missing or expired.");
    }

    return (await response.json()) as AdminSessionPayload;
  }

  async function fetchAdminOverview(token: string) {
    const response = await fetch(`${apiBaseUrl}/api/admin/overview`, {
      headers: {
        [adminSessionHeaderName]: token
      },
      cache: "no-store"
    });

    if (!response.ok) {
      throw new Error("Admin overview could not be loaded.");
    }

    return (await response.json()) as AdminOverviewPayload;
  }

  async function hydrateAdmin(token: string, message: string) {
    const currentSession = await fetchAdminSession(token);
    const currentOverview = await fetchAdminOverview(currentSession.sessionToken);

    writeAdminSessionToken(currentSession.sessionToken);
    setSession(currentSession);
    setOverview(currentOverview);
    setErrorMessage("");
    setStatusMessage(message);
  }

  useEffect(() => {
    const token = readAdminSessionToken();

    if (!token) {
      setIsBootstrapping(false);
      return;
    }

    void (async () => {
      try {
        await hydrateAdmin(token, "Admin session restored.");
      } catch (error) {
        console.error("Failed to restore admin session.", error);
        clearAdminSessionToken();
        setSession(null);
        setOverview(null);
        setErrorMessage("Saved admin session expired. Sign in again.");
      } finally {
        setIsBootstrapping(false);
      }
    })();
  }, []);

  function updateField(field: "email" | "password", value: string) {
    setCredentials((current) => ({
      ...current,
      [field]: value
    }));
  }

  async function handleLogin(event?: FormEvent<HTMLFormElement>) {
    event?.preventDefault();

    if (!credentials.email.trim() || !credentials.password) {
      setErrorMessage("Enter the admin email and password.");
      setStatusMessage("");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch(`${apiBaseUrl}/api/auth/admin/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          email: credentials.email,
          password: credentials.password
        })
      });

      if (!response.ok) {
        throw new Error(response.status === 401 ? "Invalid admin email or password." : "Admin login failed.");
      }

      const payload = (await response.json()) as AdminSessionPayload;
      await hydrateAdmin(payload.sessionToken, `Signed in as ${payload.admin.email}.`);
    } catch (error) {
      console.error("Failed to log in as admin.", error);
      clearAdminSessionToken();
      setSession(null);
      setOverview(null);
      setErrorMessage(error instanceof Error ? error.message : "Admin login failed.");
      setStatusMessage("");
    } finally {
      setIsSubmitting(false);
      setIsBootstrapping(false);
    }
  }

  async function handleRefresh() {
    const token = readAdminSessionToken();

    if (!token) {
      setErrorMessage("Sign in again to refresh the dashboard.");
      setStatusMessage("");
      return;
    }

    setIsRefreshing(true);

    try {
      await hydrateAdmin(token, "Dashboard refreshed.");
    } catch (error) {
      console.error("Failed to refresh admin dashboard.", error);
      clearAdminSessionToken();
      setSession(null);
      setOverview(null);
      setErrorMessage(error instanceof Error ? error.message : "Dashboard refresh failed.");
      setStatusMessage("");
    } finally {
      setIsRefreshing(false);
    }
  }

  async function handleLogout() {
    const token = readAdminSessionToken();

    try {
      if (token) {
        await fetch(`${apiBaseUrl}/api/auth/admin/logout`, {
          method: "POST",
          headers: {
            [adminSessionHeaderName]: token
          }
        });
      }
    } catch (error) {
      console.error("Failed to end admin session cleanly.", error);
    }

    clearAdminSessionToken();
    setSession(null);
    setOverview(null);
    setErrorMessage("");
    setStatusMessage("Admin session ended.");
  }

  if (isBootstrapping) {
    return (
      <div className="panel p-5 sm:p-6">
        <p className="text-xs uppercase tracking-[0.3em] text-bronze">Admin access</p>
        <p className="mt-4 text-sm leading-7 text-mist/75">Checking for an active admin session in this browser.</p>
      </div>
    );
  }

  if (!session || !overview) {
    return (
      <form className="panel p-5 sm:p-6" onSubmit={(event) => void handleLogin(event)}>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-bronze">Admin login</p>
            <h2 className="mt-3 font-display text-3xl text-sand sm:text-4xl">Open the Lexevo control room.</h2>
          </div>
          <span className="w-fit rounded-full border border-white/10 px-3 py-1 text-xs text-mist/65">Protected route</span>
        </div>

        <p className="mt-4 max-w-2xl text-sm leading-7 text-mist/75">
          This prototype admin flow now checks credentials against the API, restores a saved session, and blocks the
          dashboard until authentication succeeds.
        </p>
        <p className="mt-3 text-sm text-mist/60">The demo admin email and password are already filled in below.</p>

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <label className="field">
            <span>Admin email</span>
            <input
              value={credentials.email}
              onChange={(event) => updateField("email", event.target.value)}
              placeholder="rajeev@sagiam.com"
              autoComplete="username"
            />
          </label>
          <label className="field">
            <span>Password</span>
            <input
              type="password"
              value={credentials.password}
              onChange={(event) => updateField("password", event.target.value)}
              placeholder="Sagiam.com"
              autoComplete="current-password"
            />
          </label>
        </div>

        {errorMessage ? <p className="mt-4 text-sm text-rose-300">{errorMessage}</p> : null}
        {statusMessage ? <p className="mt-4 text-sm text-emerald-300">{statusMessage}</p> : null}

        <div className="mt-6 grid gap-3 sm:flex sm:flex-wrap">
          <button
            className="button-primary w-full sm:w-auto"
            type="submit"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Signing in..." : "Sign in as admin"}
          </button>
          <Link href="/" className="button-secondary w-full sm:w-auto">
            Return to website
          </Link>
        </div>
      </form>
    );
  }

  return (
    <div className="space-y-6">
      <div className="panel p-5 sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-start sm:justify-between">
          <div className="min-w-0">
            <p className="text-xs uppercase tracking-[0.3em] text-bronze">Admin session active</p>
            <h2 className="mt-3 font-display text-3xl text-sand sm:text-4xl">Control room for {session.admin.displayName}</h2>
            <p className="mt-3 text-sm leading-7 text-mist/75">
              Signed in with <span className="break-all">{session.admin.email}</span>. Session expires {formatDate(session.expiresAt)}.
            </p>
          </div>
          <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
            <button className="button-secondary w-full sm:w-auto" type="button" onClick={() => void handleRefresh()} disabled={isRefreshing}>
              {isRefreshing ? "Refreshing..." : "Refresh dashboard"}
            </button>
            <button className="button-secondary w-full sm:w-auto" type="button" onClick={() => void handleLogout()}>
              Sign out
            </button>
          </div>
        </div>

        {statusMessage ? <p className="mt-4 text-sm text-emerald-300">{statusMessage}</p> : null}

        <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-6">
          <article className="metric-card">
            <p className="metric-value">{overview.snapshot.totalLawyers}</p>
            <p className="metric-label">Lawyer profiles</p>
          </article>
          <article className="metric-card">
            <p className="metric-value">{overview.snapshot.totalCities}</p>
            <p className="metric-label">City coverage</p>
          </article>
          <article className="metric-card">
            <p className="metric-value">{overview.snapshot.totalPracticeAreas}</p>
            <p className="metric-label">Practice areas</p>
          </article>
          <article className="metric-card">
            <p className="metric-value">{overview.snapshot.liveApiRoutes}</p>
            <p className="metric-label">Tracked API routes</p>
          </article>
          <article className="metric-card">
            <p className="metric-value">{overview.snapshot.averageRating.toFixed(1)}</p>
            <p className="metric-label">Average rating</p>
          </article>
          <article className="metric-card">
            <p className="metric-value">{formatCurrency(overview.snapshot.averageConsultationFeeInr)}</p>
            <p className="metric-label">Average consultation fee</p>
          </article>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <section className="panel p-5 sm:p-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-bronze">Lawyer coverage</p>
              <h3 className="mt-3 font-display text-2xl text-sand sm:text-3xl">Current profiles on the platform</h3>
            </div>
            <p className="text-xs uppercase tracking-[0.22em] text-mist/60">Updated {formatDate(overview.generatedAt)}</p>
          </div>

          <div className="mt-6 space-y-4">
            {overview.lawyers.map((lawyer) => (
              <article key={lawyer.handle} className="rounded-[1.75rem] border border-white/10 bg-white/5 p-4 sm:p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-display text-2xl text-sand sm:text-3xl">{lawyer.fullName}</p>
                    <p className="mt-2 text-xs uppercase tracking-[0.24em] text-bronze">{lawyer.city}</p>
                  </div>
                  <Link href={`/lawyers/${lawyer.handle}`} className="button-secondary w-full sm:w-auto">
                    Open profile
                  </Link>
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  {lawyer.practiceAreas.map((area) => (
                    <span key={area} className="tag">
                      {area}
                    </span>
                  ))}
                </div>
                <div className="mt-4 grid gap-3 sm:grid-cols-3">
                  <div className="rounded-3xl border border-white/10 bg-white/5 p-4">
                    <p className="text-xs uppercase tracking-[0.2em] text-mist/60">Rating</p>
                    <p className="mt-2 text-lg text-sand">{lawyer.averageRating.toFixed(1)} / 5</p>
                  </div>
                  <div className="rounded-3xl border border-white/10 bg-white/5 p-4">
                    <p className="text-xs uppercase tracking-[0.2em] text-mist/60">Consultation fee</p>
                    <p className="mt-2 text-lg text-sand">{formatCurrency(lawyer.consultationFeeInr)}</p>
                  </div>
                  <div className="rounded-3xl border border-white/10 bg-white/5 p-4">
                    <p className="text-xs uppercase tracking-[0.2em] text-mist/60">Response time</p>
                    <p className="mt-2 text-lg text-sand">{lawyer.responseTimeLabel}</p>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>

        <div className="space-y-6">
          <section className="panel p-5 sm:p-6">
            <p className="text-xs uppercase tracking-[0.3em] text-bronze">City footprint</p>
            <h3 className="mt-3 font-display text-2xl text-sand sm:text-3xl">Where the current directory is live</h3>
            <div className="mt-6 space-y-3">
              {overview.cityCoverage.map((item) => (
                <div
                  key={item.city}
                  className="flex flex-col gap-3 rounded-3xl border border-white/10 bg-white/5 p-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div>
                    <p className="text-lg text-sand">{item.city}</p>
                    <p className="mt-1 text-xs uppercase tracking-[0.2em] text-mist/60">Directory coverage</p>
                  </div>
                  <span className="w-fit rounded-full border border-bronze/30 px-3 py-1 text-xs text-bronze">
                    {item.lawyers} lawyer{item.lawyers === 1 ? "" : "s"}
                  </span>
                </div>
              ))}
            </div>
          </section>

          <section className="panel p-5 sm:p-6">
            <p className="text-xs uppercase tracking-[0.3em] text-bronze">Practice map</p>
            <h3 className="mt-3 font-display text-2xl text-sand sm:text-3xl">Covered segments</h3>
            <div className="mt-6 flex flex-wrap gap-3">
              {overview.practiceAreas.map((area) => (
                <span key={area} className="tag">
                  {area}
                </span>
              ))}
            </div>
          </section>

          <section className="panel p-5 sm:p-6">
            <p className="text-xs uppercase tracking-[0.3em] text-bronze">Quick actions</p>
            <h3 className="mt-3 font-display text-2xl text-sand sm:text-3xl">Move between live surfaces</h3>
            <div className="mt-6 grid gap-3 sm:flex sm:flex-wrap">
              <Link href="/find-lawyers" className="button-secondary w-full sm:w-auto">
                Discovery
              </Link>
              <Link href="/network" className="button-secondary w-full sm:w-auto">
                Social feed
              </Link>
              <Link href="/messages" className="button-secondary w-full sm:w-auto">
                Messages
              </Link>
              <Link href="/workspace" className="button-secondary w-full sm:w-auto">
                Workspace
              </Link>
            </div>
            <div className="mt-6 space-y-3">
              <p className="text-xs uppercase tracking-[0.22em] text-mist/60">API endpoints</p>
              {overview.routes.map((route) => (
                <a
                  key={route.path}
                  href={`${apiBaseUrl}${route.path.replace(":handle", overview.lawyers[0]?.handle ?? "adv-isha-reddy")}`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex flex-col gap-2 rounded-3xl border border-white/10 bg-white/5 p-4 text-sm text-mist/80 transition hover:border-bronze/35 hover:text-sand sm:flex-row sm:items-center sm:justify-between"
                >
                  <span>{route.label}</span>
                  <span className="break-all text-xs uppercase tracking-[0.2em] text-bronze">{route.path}</span>
                </a>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
