"use client";

import Link from "next/link";
import { useEffect, useState, type FormEvent } from "react";

import type { LawyerProfileSummary, PracticeArea } from "@lexevo/contracts";

import { apiBaseUrl } from "./api-base-url";

const practiceAreaOptions: PracticeArea[] = [
  "Criminal Law",
  "Civil Litigation",
  "Corporate Advisory",
  "Family Law",
  "Property Law",
  "Tax Law",
  "Arbitration"
];

const languageOptions = ["English", "Telugu", "Hindi", "Punjabi"];

interface DiscoveryExplorerProps {
  title: string;
  description: string;
  initialCity?: string;
  highlightLabel: string;
}

interface SearchState {
  query: string;
  city: string;
  practiceArea: string;
  court: string;
  language: string;
  budget: string;
}

const defaultFilters: SearchState = {
  query: "",
  city: "",
  practiceArea: "",
  court: "",
  language: "",
  budget: ""
};

export function DiscoveryExplorer({
  title,
  description,
  initialCity = "",
  highlightLabel
}: DiscoveryExplorerProps) {
  const [filters, setFilters] = useState<SearchState>({
    ...defaultFilters,
    city: initialCity
  });
  const [results, setResults] = useState<LawyerProfileSummary[]>([]);
  const [cities, setCities] = useState<string[]>([]);
  const [citiesErrorMessage, setCitiesErrorMessage] = useState("");
  const [searchErrorMessage, setSearchErrorMessage] = useState("");
  const [loadingCities, setLoadingCities] = useState(true);
  const [loadingResults, setLoadingResults] = useState(false);

  useEffect(() => {
    const controller = new AbortController();

    async function loadCities() {
      const endpoint = `${apiBaseUrl}/api/search/cities`;

      try {
        const response = await fetch(endpoint, {
          signal: controller.signal
        });

        if (!response.ok) {
          throw new Error(`Discovery cities request failed with status ${response.status}.`);
        }

        const payload = (await response.json()) as { cities: string[] };

        if (!Array.isArray(payload.cities)) {
          throw new Error("Discovery cities payload is missing the cities array.");
        }

        setCities(payload.cities);
        setCitiesErrorMessage("");
      } catch (error) {
        if (controller.signal.aborted) {
          return;
        }

        console.error("Failed to load discovery cities.", {
          endpoint,
          error
        });
        setCities([]);
        setCitiesErrorMessage("Discovery cities could not be loaded. Please try again later.");
      } finally {
        if (!controller.signal.aborted) {
          setLoadingCities(false);
        }
      }
    }

    void loadCities();

    return () => {
      controller.abort();
    };
  }, []);

  useEffect(() => {
    const nextFilters = {
      ...defaultFilters,
      city: initialCity
    };

    setFilters(nextFilters);
    void runSearch(nextFilters);
  }, [initialCity]);

  async function runSearch(nextFilters: SearchState) {
    const params = new URLSearchParams();

    if (nextFilters.query) {
      params.set("query", nextFilters.query);
    }

    if (nextFilters.city) {
      params.set("city", nextFilters.city);
    }

    if (nextFilters.practiceArea) {
      params.set("practiceArea", nextFilters.practiceArea);
    }

    if (nextFilters.court) {
      params.set("court", nextFilters.court);
    }

    if (nextFilters.language) {
      params.set("language", nextFilters.language);
    }

    if (nextFilters.budget) {
      params.set("maxConsultationFeeInr", nextFilters.budget);
    }

    const queryString = params.toString();
    const endpoint = queryString
      ? `${apiBaseUrl}/api/search/lawyers?${queryString}`
      : `${apiBaseUrl}/api/search/lawyers`;

    setLoadingResults(true);
    setSearchErrorMessage("");

    try {
      const response = await fetch(endpoint);

      if (!response.ok) {
        throw new Error(`Search request failed with status ${response.status}.`);
      }

      const payload = (await response.json()) as {
        results: LawyerProfileSummary[];
      };

      if (!Array.isArray(payload.results)) {
        throw new Error("Discovery search payload is missing the results array.");
      }

      setResults(payload.results);
    } catch (error) {
      console.error("Failed to load discovery search results.", {
        endpoint,
        filters: nextFilters,
        error
      });

      setResults([]);
      setSearchErrorMessage("Search is unavailable right now. Please try again shortly.");
    } finally {
      setLoadingResults(false);
    }
  }

  function updateFilter<K extends keyof SearchState>(field: K, value: SearchState[K]) {
    setFilters((current) => ({
      ...current,
      [field]: value
    }));
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void runSearch(filters);
  }

  function handleReset() {
    const nextFilters = {
      ...defaultFilters,
      city: initialCity
    };

    setFilters(nextFilters);
    void runSearch(nextFilters);
  }

  return (
    <main className="min-h-screen bg-ink px-6 py-8 text-sand sm:px-8">
      <div className="mx-auto max-w-7xl">
        <section className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
          <div>
            <p className="eyebrow">{highlightLabel}</p>
            <h1 className="mt-4 max-w-4xl font-display text-6xl leading-none text-sand sm:text-7xl">
              {title}
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-mist/80">{description}</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/find-lawyers/near-me" className="button-secondary">
                Lawyer near me
              </Link>
              <Link href="/" className="button-secondary">
                Back to platform
              </Link>
            </div>
          </div>

          <aside className="panel p-6">
            <p className="text-xs uppercase tracking-[0.28em] text-bronze">Quick cities</p>
            <div className="mt-5 flex flex-wrap gap-3">
              {loadingCities ? (
                <p className="text-sm text-mist/70">Loading cities...</p>
              ) : citiesErrorMessage ? (
                <p className="text-sm text-rose-300">{citiesErrorMessage}</p>
              ) : cities.length === 0 ? (
                <p className="text-sm text-mist/70">No discovery cities are available right now.</p>
              ) : (
                cities.map((city) => (
                  <Link key={city} href={`/find-lawyers/city/${encodeURIComponent(city)}`} className="tag">
                    {city}
                  </Link>
                ))
              )}
            </div>
            <div className="mt-6 rounded-[1.75rem] border border-bronze/20 bg-bronze/10 p-4 text-sm leading-7 text-sand/90">
              <p className="font-medium">Phase 2 intent</p>
              <p className="mt-2 text-mist/75">
                Search pages, city landing pages, booking flow, mocked payment checkout, and WhatsApp-ready lead text
                are now part of the local client-acquisition layer.
              </p>
            </div>
          </aside>
        </section>

        <section className="section-shell mt-10">
          <form className="grid gap-4 lg:grid-cols-6" onSubmit={handleSubmit}>
            <label className="field lg:col-span-2">
              <span>Search</span>
              <input
                value={filters.query}
                onChange={(event) => updateFilter("query", event.target.value)}
                placeholder="Criminal lawyer, startup counsel, custody"
              />
            </label>
            <label className="field">
              <span>City</span>
              <select value={filters.city} onChange={(event) => updateFilter("city", event.target.value)}>
                <option value="">All cities</option>
                {cities.map((city) => (
                  <option key={city} value={city}>
                    {city}
                  </option>
                ))}
              </select>
            </label>
            <label className="field">
              <span>Practice area</span>
              <select value={filters.practiceArea} onChange={(event) => updateFilter("practiceArea", event.target.value)}>
                <option value="">All areas</option>
                {practiceAreaOptions.map((area) => (
                  <option key={area} value={area}>
                    {area}
                  </option>
                ))}
              </select>
            </label>
            <label className="field">
              <span>Court</span>
              <input
                value={filters.court}
                onChange={(event) => updateFilter("court", event.target.value)}
                placeholder="High Court"
              />
            </label>
            <label className="field">
              <span>Language</span>
              <select value={filters.language} onChange={(event) => updateFilter("language", event.target.value)}>
                <option value="">Any</option>
                {languageOptions.map((language) => (
                  <option key={language} value={language}>
                    {language}
                  </option>
                ))}
              </select>
            </label>
            <label className="field">
              <span>Budget up to (INR)</span>
              <input
                type="number"
                min="0"
                value={filters.budget}
                onChange={(event) => updateFilter("budget", event.target.value)}
                placeholder="3000"
              />
            </label>
            <div className="flex flex-wrap gap-3 lg:col-span-6">
              <button className="button-primary" type="submit">
                {loadingResults ? "Searching..." : "Find lawyers"}
              </button>
              <button className="button-secondary" type="button" onClick={handleReset}>
                Reset filters
              </button>
            </div>
          </form>

          {searchErrorMessage ? <p className="mt-4 text-sm text-rose-300">{searchErrorMessage}</p> : null}

          <div className="mt-8 flex items-center justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-[0.28em] text-bronze">Results</p>
              <p className="mt-2 text-sm text-mist/75">
                {loadingResults ? "Loading matching lawyers..." : `${results.length} lawyers matched these filters.`}
              </p>
            </div>
          </div>

          <div className="mt-8 grid gap-5 lg:grid-cols-2">
            {results.map((lawyer) => (
              <article key={lawyer.handle} className="feature-card">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="font-display text-4xl text-sand">{lawyer.fullName}</p>
                    <p className="mt-2 text-sm uppercase tracking-[0.25em] text-bronze">
                      {lawyer.city} · {lawyer.responseTimeLabel}
                    </p>
                  </div>
                  <span className="rounded-full border border-bronze/30 px-3 py-1 text-xs text-bronze">
                    {lawyer.averageRating.toFixed(1)} / 5
                  </span>
                </div>
                <p className="mt-5 text-sm leading-7 text-mist/80">{lawyer.headline}</p>
                <div className="mt-5 flex flex-wrap gap-2">
                  {lawyer.practiceAreas.map((area) => (
                    <span key={area} className="tag">
                      {area}
                    </span>
                  ))}
                </div>
                <div className="mt-5 grid gap-2 text-sm text-mist/75">
                  <p>Languages: {lawyer.languages.join(", ")}</p>
                  <p>Courts: {lawyer.courtsHandled.join(", ")}</p>
                  <p>Consultation fee: INR {lawyer.consultationFeeInr}</p>
                </div>
                <div className="mt-5 rounded-[1.5rem] border border-bronze/20 bg-bronze/10 p-4 text-sm leading-7 text-sand/90">
                  {lawyer.leadOffer}
                </div>
                <p className="mt-5 text-sm leading-7 text-sand/85">&quot;{lawyer.featuredReview}&quot;</p>
                <div className="mt-6 flex flex-wrap gap-3">
                  <Link href={`/consultations/${lawyer.handle}`} className="button-primary">
                    Book consultation
                  </Link>
                  <Link href={`/lawyers/${lawyer.handle}`} className="button-secondary">
                    View profile
                  </Link>
                </div>
              </article>
            ))}

            {!loadingResults && !searchErrorMessage && results.length === 0 ? (
              <div className="rounded-[2rem] border border-white/10 bg-white/5 p-8 text-sm leading-7 text-mist/75 lg:col-span-2">
                No lawyers matched the current filters. Try a broader city, remove the court filter, or raise the budget cap.
              </div>
            ) : null}
          </div>
        </section>
      </div>
    </main>
  );
}
