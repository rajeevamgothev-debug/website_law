import Link from "next/link";

import { AdminConsole } from "../../components/admin-console";

const adminTracks = [
  {
    title: "Protected access",
    body: "The dashboard now stays behind API-validated admin credentials instead of being another public page."
  },
  {
    title: "Live product snapshot",
    body: "Once signed in, the admin surface pulls current lawyer, city, and route coverage directly from the backend."
  },
  {
    title: "Reusable session",
    body: "An active admin token is stored locally so the control room can restore itself on refresh during local work."
  }
];

export default function AdminPage() {
  return (
    <main className="min-h-screen overflow-x-hidden bg-ink px-6 py-10 text-sand sm:px-8">
      <div className="absolute inset-0 -z-10 bg-grid bg-[size:42px_42px] opacity-20" />
      <div className="absolute right-0 top-16 -z-10 h-[28rem] w-[28rem] rounded-full bg-bronze/15 blur-3xl" />

      <div className="mx-auto max-w-7xl">
        <header className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="eyebrow">Lexevo admin</p>
            <h1 className="mt-4 max-w-4xl font-display text-6xl leading-none text-sand sm:text-7xl">
              Manage the platform from one protected control surface.
            </h1>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-mist/75">
              The admin route now has actual login logic, session validation, and a dashboard that reflects the current
              local platform state.
            </p>
          </div>
          <Link href="/" className="button-secondary">
            Back to website
          </Link>
        </header>

        <section className="mt-10 grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
          <aside className="panel p-6">
            <p className="text-xs uppercase tracking-[0.3em] text-bronze">Admin stack</p>
            <div className="mt-6 space-y-4">
              {adminTracks.map((track) => (
                <div key={track.title} className="rounded-[1.75rem] border border-white/10 bg-white/5 p-5">
                  <p className="font-display text-3xl text-sand">{track.title}</p>
                  <p className="mt-3 text-sm leading-7 text-mist/75">{track.body}</p>
                </div>
              ))}
            </div>
          </aside>

          <AdminConsole />
        </section>
      </div>
    </main>
  );
}
