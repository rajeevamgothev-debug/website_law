"use client";

import Link from "next/link";
import { useEffect, useState, type ChangeEvent, type FormEvent } from "react";

import type {
  ConsultationBookingResponse,
  LawyerProfile,
  PaymentProvider,
  PracticeArea
} from "@lexevo/contracts";

import { apiBaseUrl } from "./api-base-url";

interface ConsultationBookingFormProps {
  handle: string;
}

interface BookingState {
  clientName: string;
  clientPhone: string;
  clientEmail: string;
  city: string;
  practiceArea: string;
  court: string;
  preferredDay: string;
  preferredSlot: string;
  budgetInr: string;
  summary: string;
  paymentProvider: PaymentProvider;
  notifyOnWhatsApp: boolean;
}

export function ConsultationBookingForm({ handle }: ConsultationBookingFormProps) {
  const [profile, setProfile] = useState<LawyerProfile | null>(null);
  const [booking, setBooking] = useState<BookingState>({
    clientName: "",
    clientPhone: "",
    clientEmail: "",
    city: "",
    practiceArea: "",
    court: "",
    preferredDay: "",
    preferredSlot: "",
    budgetInr: "",
    summary: "",
    paymentProvider: "razorpay",
    notifyOnWhatsApp: true
  });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [result, setResult] = useState<ConsultationBookingResponse | null>(null);

  useEffect(() => {
    async function loadProfile() {
      try {
        const response = await fetch(`${apiBaseUrl}/api/profiles/${handle}`);

        if (!response.ok) {
          throw new Error("Lawyer profile not found.");
        }

        const payload = (await response.json()) as LawyerProfile;
        setProfile(payload);
        setBooking((current) => ({
          ...current,
          city: payload.city,
          practiceArea: payload.practiceAreas[0] ?? "",
          court: payload.courtsHandled[0] ?? "",
          preferredDay: payload.availability[0]?.day ?? "",
          preferredSlot: payload.availability[0]?.slots[0] ?? "",
          budgetInr: String(payload.consultationFeeInr)
        }));
      } catch {
        setErrorMessage("The consultation flow could not load the selected lawyer.");
      } finally {
        setLoading(false);
      }
    }

    void loadProfile();
  }, [handle]);

  function updateBooking<K extends keyof BookingState>(field: K, value: BookingState[K]) {
    setBooking((current) => ({
      ...current,
      [field]: value
    }));
  }

  function handleDayChange(event: ChangeEvent<HTMLSelectElement>) {
    const nextDay = event.target.value;
    const matchedWindow = profile?.availability.find((window) => window.day === nextDay);

    setBooking((current) => ({
      ...current,
      preferredDay: nextDay,
      preferredSlot: matchedWindow?.slots[0] ?? ""
    }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!profile) {
      return;
    }

    setSubmitting(true);
    setErrorMessage("");

    try {
      const response = await fetch(`${apiBaseUrl}/api/leads/consultations`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          lawyerHandle: profile.handle,
          clientName: booking.clientName,
          clientPhone: booking.clientPhone,
          clientEmail: booking.clientEmail || undefined,
          city: booking.city,
          practiceArea: booking.practiceArea as PracticeArea,
          court: booking.court,
          preferredDay: booking.preferredDay,
          preferredSlot: booking.preferredSlot,
          budgetInr: booking.budgetInr ? Number(booking.budgetInr) : undefined,
          summary: booking.summary,
          paymentProvider: booking.paymentProvider,
          notifyOnWhatsApp: booking.notifyOnWhatsApp
        })
      });

      if (!response.ok) {
        throw new Error("Booking submission failed.");
      }

      const payload = (await response.json()) as ConsultationBookingResponse;
      setResult(payload);
    } catch {
      setErrorMessage("Lead submission failed. Confirm the API is running on port 4000.");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-ink px-6 py-8 text-sand sm:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="panel p-8">
            <p className="text-sm text-mist/75">Loading consultation flow...</p>
          </div>
        </div>
      </main>
    );
  }

  if (!profile) {
    return (
      <main className="min-h-screen bg-ink px-6 py-8 text-sand sm:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="panel p-8">
            <p className="eyebrow">Consultation booking</p>
            <h1 className="mt-3 font-display text-5xl">The selected lawyer profile could not be loaded.</h1>
            <p className="mt-4 text-sm leading-7 text-mist/75">{errorMessage}</p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link href="/find-lawyers" className="button-primary">
                Back to directory
              </Link>
            </div>
          </div>
        </div>
      </main>
    );
  }

  const selectedWindow = profile.availability.find((window) => window.day === booking.preferredDay);

  return (
    <main className="min-h-screen bg-ink px-6 py-8 text-sand sm:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="eyebrow">Phase 2 booking</p>
            <h1 className="mt-4 max-w-4xl font-display text-6xl leading-none text-sand sm:text-7xl">
              Book a consultation with {profile.fullName}.
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-mist/80">
              Capture the lead, choose a slot, and generate the payment plus WhatsApp follow-up payload in one step.
            </p>
          </div>
          <div className="panel p-5">
            <p className="text-xs uppercase tracking-[0.28em] text-bronze">Lawyer snapshot</p>
            <div className="mt-4 space-y-2 text-sm text-mist/80">
              <p>{profile.city}</p>
              <p>{profile.practiceAreas.join(", ")}</p>
              <p>Fee: INR {profile.consultationFeeInr}</p>
              <p>Response: {profile.responseTimeLabel}</p>
            </div>
          </div>
        </div>

        <section className="mt-10 grid gap-6 lg:grid-cols-[1fr_0.9fr]">
          <form className="panel p-6" onSubmit={handleSubmit}>
            <p className="text-xs uppercase tracking-[0.28em] text-bronze">Consultation intake</p>
            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <label className="field">
                <span>Your name</span>
                <input
                  value={booking.clientName}
                  onChange={(event) => updateBooking("clientName", event.target.value)}
                  placeholder="Rohan Sharma"
                  required
                />
              </label>
              <label className="field">
                <span>Phone</span>
                <input
                  value={booking.clientPhone}
                  onChange={(event) => updateBooking("clientPhone", event.target.value)}
                  placeholder="+91 98765 43210"
                  required
                />
              </label>
              <label className="field">
                <span>Email</span>
                <input
                  value={booking.clientEmail}
                  onChange={(event) => updateBooking("clientEmail", event.target.value)}
                  placeholder="rohan@example.com"
                />
              </label>
              <label className="field">
                <span>City</span>
                <input value={booking.city} onChange={(event) => updateBooking("city", event.target.value)} required />
              </label>
              <label className="field">
                <span>Practice area</span>
                <select value={booking.practiceArea} onChange={(event) => updateBooking("practiceArea", event.target.value)}>
                  {profile.practiceAreas.map((area) => (
                    <option key={area} value={area}>
                      {area}
                    </option>
                  ))}
                </select>
              </label>
              <label className="field">
                <span>Court</span>
                <select value={booking.court} onChange={(event) => updateBooking("court", event.target.value)}>
                  {profile.courtsHandled.map((court) => (
                    <option key={court} value={court}>
                      {court}
                    </option>
                  ))}
                </select>
              </label>
              <label className="field">
                <span>Preferred day</span>
                <select value={booking.preferredDay} onChange={handleDayChange}>
                  {profile.availability.map((window) => (
                    <option key={window.day} value={window.day}>
                      {window.day}
                    </option>
                  ))}
                </select>
              </label>
              <label className="field">
                <span>Preferred slot</span>
                <select value={booking.preferredSlot} onChange={(event) => updateBooking("preferredSlot", event.target.value)}>
                  {(selectedWindow?.slots ?? []).map((slot) => (
                    <option key={slot} value={slot}>
                      {slot}
                    </option>
                  ))}
                </select>
              </label>
              <label className="field">
                <span>Budget (INR)</span>
                <input
                  type="number"
                  min="0"
                  value={booking.budgetInr}
                  onChange={(event) => updateBooking("budgetInr", event.target.value)}
                />
              </label>
              <label className="field">
                <span>Payment provider</span>
                <select
                  value={booking.paymentProvider}
                  onChange={(event) => updateBooking("paymentProvider", event.target.value as PaymentProvider)}
                >
                  <option value="razorpay">Razorpay</option>
                  <option value="stripe">Stripe</option>
                </select>
              </label>
              <label className="field md:col-span-2">
                <span>Matter summary</span>
                <textarea
                  rows={5}
                  value={booking.summary}
                  onChange={(event) => updateBooking("summary", event.target.value)}
                  placeholder="Short description of the issue, urgency, and what kind of consultation you need."
                  required
                />
              </label>
            </div>

            <label className="mt-6 flex items-center gap-3 text-sm text-mist/75">
              <input
                type="checkbox"
                checked={booking.notifyOnWhatsApp}
                onChange={(event) => updateBooking("notifyOnWhatsApp", event.target.checked)}
                className="mt-0 h-4 w-4 rounded border border-white/10 bg-white/5"
              />
              Generate WhatsApp-ready notification text
            </label>

            {errorMessage ? <p className="mt-4 text-sm text-rose-300">{errorMessage}</p> : null}

            <div className="mt-6 flex flex-wrap gap-3">
              <button className="button-primary" type="submit" disabled={submitting}>
                {submitting ? "Capturing lead..." : "Confirm consultation"}
              </button>
              <Link href={`/lawyers/${profile.handle}`} className="button-secondary">
                Back to lawyer profile
              </Link>
            </div>
          </form>

          <div className="space-y-6">
            <div className="panel p-6">
              <p className="text-xs uppercase tracking-[0.28em] text-bronze">Conversion notes</p>
              <div className="mt-5 space-y-3 text-sm leading-7 text-mist/80">
                <p>{profile.leadOffer}</p>
                <p>Initial discovery filters and booking intake are tuned for higher-intent leads.</p>
                <p>Payment handoff is mocked in this prototype and returns a checkout reference instead of a live transaction.</p>
              </div>
            </div>

            {result ? (
              <div className="panel p-6">
                <p className="text-xs uppercase tracking-[0.28em] text-bronze">Lead captured</p>
                <div className="mt-5 grid gap-3 text-sm text-mist/80">
                  <div className="rounded-[1.5rem] border border-white/10 bg-white/5 p-4">
                    Lead ID: <span className="text-sand">{result.leadId}</span>
                  </div>
                  <div className="rounded-[1.5rem] border border-white/10 bg-white/5 p-4">
                    Scheduled: <span className="text-sand">{result.scheduledLabel}</span>
                  </div>
                  <div className="rounded-[1.5rem] border border-white/10 bg-white/5 p-4">
                    Checkout: <span className="text-sand">{result.checkoutProvider} / {result.checkoutReference}</span>
                  </div>
                  <div className="rounded-[1.5rem] border border-white/10 bg-white/5 p-4">
                    Free lead applied: <span className="text-sand">{result.freeLeadApplied ? "Yes" : "No"}</span>
                  </div>
                  <div className="rounded-[1.5rem] border border-bronze/20 bg-bronze/10 p-4 leading-7 text-sand/90">
                    {result.whatsAppPreview}
                  </div>
                </div>
                {booking.notifyOnWhatsApp ? (
                  <a
                    href={`https://wa.me/?text=${encodeURIComponent(result.whatsAppPreview)}`}
                    target="_blank"
                    rel="noreferrer"
                    className="button-secondary mt-6"
                  >
                    Open WhatsApp draft
                  </a>
                ) : null}
              </div>
            ) : null}
          </div>
        </section>
      </div>
    </main>
  );
}
