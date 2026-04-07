import { OnboardingForm } from "../../components/onboarding-form";

const onboardingSteps = [
  {
    step: "01",
    title: "Access",
    body: "Phone or email OTP gets the lawyer into the platform in one short step without forcing a long signup form."
  },
  {
    step: "02",
    title: "Identity",
    body: "Capture name, city, practice areas, years of experience, and language so the public profile is usable immediately."
  },
  {
    step: "03",
    title: "Presence",
    body: "Enable sections, set privacy controls, and publish a profile that can later map to a subdomain or custom domain."
  }
];

export default function OnboardingPage() {
  return (
    <main className="min-h-screen bg-ink px-6 py-10 text-sand sm:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="eyebrow">Three-step signup</p>
            <h1 className="section-heading max-w-3xl">
              Onboarding is designed to publish a credible public profile fast, not trap lawyers in admin setup.
            </h1>
          </div>
          <p className="max-w-lg text-sm leading-7 text-mist/75">
            This screen now saves the identity draft locally, then moves into profile setup so you can preview and
            publish a lawyer profile in the same session.
          </p>
        </div>

        <section className="mt-10 grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="panel p-6">
            <p className="text-xs uppercase tracking-[0.3em] text-bronze">Flow snapshot</p>
            <div className="mt-6 space-y-4">
              {onboardingSteps.map((item) => (
                <div key={item.step} className="rounded-3xl border border-white/10 bg-white/5 p-5">
                  <div className="flex items-center gap-4">
                    <span className="rounded-full border border-bronze/30 px-3 py-1 text-xs text-bronze">
                      {item.step}
                    </span>
                    <p className="font-display text-3xl">{item.title}</p>
                  </div>
                  <p className="mt-3 text-sm leading-7 text-mist/80">{item.body}</p>
                </div>
              ))}
            </div>
          </div>

          <OnboardingForm />
        </section>
      </div>
    </main>
  );
}
