"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { apiBaseUrl } from "./api-base-url";
import {
  defaultDraft,
  languageOptions,
  practiceAreaOptions,
  readDraft,
  withDerivedHandle,
  writeDraft,
  type OnboardingDraft
} from "./onboarding-storage";

const requiredFieldLabels = {
  phoneOrEmail: "Phone or email",
  fullName: "Full name",
  headline: "Headline",
  city: "City",
  experienceYears: "Experience",
  practiceAreas: "Practice areas",
  about: "About"
};

export function OnboardingForm() {
  const router = useRouter();
  const [draft, setDraft] = useState<OnboardingDraft>(defaultDraft);
  const [otpCode, setOtpCode] = useState("");
  const [otpMessage, setOtpMessage] = useState("");
  const [statusMessage, setStatusMessage] = useState("");
  const [validationMessage, setValidationMessage] = useState("");

  useEffect(() => {
    const savedDraft = readDraft();

    if (savedDraft) {
      setDraft(savedDraft);
    }
  }, []);

  function updateDraft<K extends keyof OnboardingDraft>(field: K, value: OnboardingDraft[K]) {
    setDraft((current) => ({
      ...current,
      [field]: value
    }));
  }

  function togglePracticeArea(area: (typeof practiceAreaOptions)[number]) {
    setDraft((current) => {
      const practiceAreas = current.practiceAreas.includes(area)
        ? current.practiceAreas.filter((item) => item !== area)
        : [...current.practiceAreas, area];

      return {
        ...current,
        practiceAreas
      };
    });
  }

  function persistDraft(nextDraft: OnboardingDraft) {
    const draftWithHandle = withDerivedHandle(nextDraft);

    writeDraft(draftWithHandle);
    setDraft(draftWithHandle);
    return draftWithHandle;
  }

  function handleSaveDraft() {
    persistDraft(draft);
    setValidationMessage("");
    setStatusMessage("Draft saved locally in this browser.");
  }

  async function handleRequestOtp() {
    if (!draft.phoneOrEmail.trim()) {
      setValidationMessage("Enter phone or email before requesting OTP.");
      return;
    }

    const endpoint = `${apiBaseUrl}/api/auth/request-otp`;

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          phoneOrEmail: draft.phoneOrEmail
        })
      });

      if (!response.ok) {
        throw new Error(`OTP request failed with status ${response.status}.`);
      }

      const payload = (await response.json()) as {
        deliveryChannel: string;
        retryInSeconds: number;
      };

      setOtpMessage(`Mock OTP sent via ${payload.deliveryChannel}. Use any 6 digits to verify in this prototype.`);
      setStatusMessage("");
      setValidationMessage("");
    } catch (error) {
      console.error("Failed to request OTP.", {
        endpoint,
        phoneOrEmail: draft.phoneOrEmail,
        error
      });
      setOtpMessage("API not reachable. In this local prototype, you can still enter any 6-digit OTP and verify.");
      setStatusMessage("");
    }
  }

  function handleVerifyOtp() {
    if (!/^\d{6}$/.test(otpCode.trim())) {
      setValidationMessage("Enter any 6-digit OTP to verify in this local prototype.");
      return;
    }

    const nextDraft = {
      ...draft,
      otpVerified: true
    };

    persistDraft(nextDraft);
    setDraft(nextDraft);
    setOtpMessage("OTP verified. You can continue to profile setup.");
    setValidationMessage("");
  }

  function handleContinue() {
    const missingFields: string[] = [];

    if (!draft.otpVerified) {
      missingFields.push("OTP verification");
    }

    if (!draft.phoneOrEmail.trim()) {
      missingFields.push(requiredFieldLabels.phoneOrEmail);
    }

    if (!draft.fullName.trim()) {
      missingFields.push(requiredFieldLabels.fullName);
    }

    if (!draft.headline.trim()) {
      missingFields.push(requiredFieldLabels.headline);
    }

    if (!draft.city.trim()) {
      missingFields.push(requiredFieldLabels.city);
    }

    if (!draft.experienceYears) {
      missingFields.push(requiredFieldLabels.experienceYears);
    }

    if (draft.practiceAreas.length === 0) {
      missingFields.push(requiredFieldLabels.practiceAreas);
    }

    if (!draft.about.trim()) {
      missingFields.push(requiredFieldLabels.about);
    }

    if (missingFields.length > 0) {
      setStatusMessage("");
      setValidationMessage(`Add these fields before continuing: ${missingFields.join(", ")}.`);
      return;
    }

    persistDraft(draft);
    setValidationMessage("");
    setStatusMessage("");
    router.push("/onboarding/profile-setup");
  }

  return (
    <div className="panel p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-bronze">Identity form</p>
          <p className="mt-2 text-sm leading-7 text-mist/75">
            Fill the lawyer basics, save a local draft, and continue into profile setup.
          </p>
        </div>
        <span className="rounded-full border border-white/10 px-3 py-1 text-xs text-mist/65">Step 1 of 3</span>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <label className="field">
          <span>Phone or email</span>
          <input
            value={draft.phoneOrEmail}
            onChange={(event) => {
              updateDraft("phoneOrEmail", event.target.value);
              updateDraft("otpVerified", false);
            }}
            placeholder="lawyer@lexevo.in"
          />
        </label>
        <div className="field">
          <span>OTP access</span>
          <div className="mt-2 flex flex-wrap gap-3">
            <button className="button-secondary" type="button" onClick={handleRequestOtp}>
              Request OTP
            </button>
            <span className="rounded-full border border-white/10 px-3 py-3 text-xs text-mist/65">
              {draft.otpVerified ? "Verified" : "Pending"}
            </span>
          </div>
        </div>
        <label className="field">
          <span>Full name</span>
          <input
            value={draft.fullName}
            onChange={(event) => updateDraft("fullName", event.target.value)}
            placeholder="Adv. Isha Reddy"
          />
        </label>
        <label className="field md:col-span-2">
          <span>Public headline</span>
          <input
            value={draft.headline}
            onChange={(event) => updateDraft("headline", event.target.value)}
            placeholder="High-stakes criminal defense and constitutional strategy"
          />
        </label>
        <label className="field">
          <span>Enter OTP</span>
          <input value={otpCode} onChange={(event) => setOtpCode(event.target.value)} placeholder="123456" />
        </label>
        <div className="field">
          <span>Verify OTP</span>
          <div className="mt-2">
            <button className="button-secondary" type="button" onClick={handleVerifyOtp}>
              Verify access
            </button>
          </div>
        </div>
        <label className="field">
          <span>City</span>
          <input value={draft.city} onChange={(event) => updateDraft("city", event.target.value)} placeholder="Hyderabad" />
        </label>
        <label className="field">
          <span>Experience</span>
          <input
            type="number"
            min="0"
            value={draft.experienceYears || ""}
            onChange={(event) => updateDraft("experienceYears", Number(event.target.value))}
            placeholder="11"
          />
        </label>
        <label className="field">
          <span>Primary language</span>
          <select value={draft.primaryLanguage} onChange={(event) => updateDraft("primaryLanguage", event.target.value)}>
            {languageOptions.map((language) => (
              <option key={language} value={language}>
                {language}
              </option>
            ))}
          </select>
        </label>
        <label className="field">
          <span>Office address</span>
          <input
            value={draft.officeAddress}
            onChange={(event) => updateDraft("officeAddress", event.target.value)}
            placeholder="Banjara Hills, Hyderabad"
          />
        </label>
      </div>

      <div className="mt-6">
        <p className="text-sm text-mist/75">Practice areas</p>
        <div className="mt-3 flex flex-wrap gap-3">
          {practiceAreaOptions.map((area) => {
            const selected = draft.practiceAreas.includes(area);

            return (
              <button
                key={area}
                type="button"
                onClick={() => togglePracticeArea(area)}
                className={
                  selected
                    ? "rounded-full border border-bronze/40 bg-bronze px-4 py-2 text-xs uppercase tracking-[0.18em] text-ink"
                    : "rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs uppercase tracking-[0.18em] text-mist/75 transition hover:border-bronze/35 hover:text-sand"
                }
              >
                {area}
              </button>
            );
          })}
        </div>
      </div>

      <label className="field mt-6 block">
        <span>About</span>
        <textarea
          rows={5}
          value={draft.about}
          onChange={(event) => updateDraft("about", event.target.value)}
          placeholder="Short public-facing introduction for the lawyer profile"
        />
      </label>

      {otpMessage ? <p className="mt-4 text-sm text-sky-300">{otpMessage}</p> : null}
      {validationMessage ? <p className="mt-4 text-sm text-rose-300">{validationMessage}</p> : null}
      {statusMessage ? <p className="mt-4 text-sm text-emerald-300">{statusMessage}</p> : null}

      <div className="mt-6 flex flex-wrap gap-3">
        <button className="button-primary" type="button" onClick={handleContinue}>
          Continue to profile setup
        </button>
        <button className="button-secondary" type="button" onClick={handleSaveDraft}>
          Save draft
        </button>
      </div>
    </div>
  );
}
