"use client";

import Link from "next/link";
import { useEffect, useState, type FormEvent } from "react";

import type {
  AiChatMessage,
  AiChatResponse,
  AiLawyerMatchResponse,
  AiOverviewResponse,
  AiPostGenerationResponse,
  AiSummaryLength,
  AiPersona,
  AiSummaryResponse,
  CaseLawSuggestionResponse,
  DiscussionInsightResponse,
  JudgmentSummaryResponse,
  LawyerProfileSummary,
  LegalNoticeDraftResponse,
  LegalSectionSuggestionResponse,
  LegalTermExplanationResponse,
  PracticeArea
} from "@lexevo/contracts";

import { apiBaseUrl } from "./api-base-url";

const practiceAreas: PracticeArea[] = [
  "Criminal Law",
  "Civil Litigation",
  "Corporate Advisory",
  "Family Law",
  "Property Law",
  "Tax Law",
  "Arbitration"
];

const personaOptions: { id: AiPersona; label: string; description: string }[] = [
  {
    id: "client-advocate",
    label: "Client Advocate",
    description: "Keeps the tone reassuring and explains next steps for the client."
  },
  {
    id: "litigation-strategist",
    label: "Litigation Strategist",
    description: "Focuses on courtroom posture, evidence, and risk trade-offs."
  },
  {
    id: "business-counsel",
    label: "Business Counsel",
    description: "Balances legal precision with commercial outcomes and governance."
  }
];

const signalChain = [
  {
    title: "Speech Capture",
    body: "Optional front-end speech-to-text converts voice into clean legal intake before analysis begins."
  },
  {
    title: "Live Legal Retrieval",
    body: "Up-to-date legal APIs enrich the matter with statutes, judgments, and structured context."
  },
  {
    title: "Local Model Reasoning",
    body: "A GPU-backed local LLaMA or Ollama stack produces contextual answers without cloud dependency."
  },
  {
    title: "Text + Voice Reply",
    body: "The answer returns as text and can be read back with text-to-speech for hands-free review."
  }
];

const defaultResearchQuery = "Urgent criminal complaint and anticipatory bail strategy";
const defaultJudgmentTitle = "Prototype judgment intake";
const defaultJudgmentText =
  "The petitioner sought urgent relief after coercive steps were threatened despite incomplete procedural safeguards. The court examined liberty concerns, the chronology of events, and whether the state action could continue without closer scrutiny. It held that procedural discipline mattered and interim protection was justified while the matter was examined further.";
const defaultTerm = "anticipatory bail";
const defaultPostTopic = "Urgent complaint response checklist";
const defaultPostAudience = "founders and first-time private clients";
const defaultNoticeRecipient = "Counterparty / Respondent";
const defaultNoticeType = "Breach of contract";
const defaultNoticeSummary =
  "The recipient failed to perform contractual obligations despite prior follow-up and caused commercial prejudice.";
const defaultNoticeDemands =
  "Cease the breach immediately\nCure the default within 7 days\nConfirm compliance in writing";
const defaultChatGreeting: AiChatMessage = {
  role: "assistant",
  content:
    "Hi there! Tell me about your legal problem or ask for a summary, a persona-guided insight, or lawyer matching."
};
const defaultChatPrompt =
  "Explain the safest immediate steps when a client fears arrest after a business dispute complaint.";
const defaultSummaryInput =
  "The client fears arrest after a heated business dispute in Bengaluru. The complaint mentions breach of trust and misappropriation of funds linked to a short-term joint venture.";
const defaultMatchCaseSummary =
  "A founder shares a matter involving a breach-of-promissory note dispute tied to property shading, plus an imminent hearing scheduled in the coming 10 days.";
const defaultMatchCity = "Hyderabad";
const defaultMatchUrgency = "Urgent: need pretrial protection and rapid guidance.";
const defaultMatchGoals = "Lock in anticipatory bail strategy while keeping the dispute confidential.";

const quickStartGuides = [
  {
    id: "research-grid",
    step: "01",
    title: "Analyze the matter",
    body: "Paste the issue, choose a practice area, and run legal research."
  },
  {
    id: "interpretation-lab",
    step: "02",
    title: "Summarize or explain",
    body: "Turn long text into a short brief or explain a legal term in plain language."
  },
  {
    id: "drafting-deck",
    step: "03",
    title: "Draft output",
    body: "Generate a post or legal notice with the deeper drafting lane."
  },
  {
    id: "counsel-console",
    step: "04",
    title: "Ask and route",
    body: "Chat with the assistant, compress intake, and match the right lawyer."
  }
];

export function AiWorkbench() {
  const [overview, setOverview] = useState<AiOverviewResponse | null>(null);
  const [lawyers, setLawyers] = useState<LawyerProfileSummary[]>([]);
  const [query, setQuery] = useState(defaultResearchQuery);
  const [practiceArea, setPracticeArea] = useState<PracticeArea>("Criminal Law");
  const [caseLaw, setCaseLaw] = useState<CaseLawSuggestionResponse | null>(null);
  const [sections, setSections] = useState<LegalSectionSuggestionResponse | null>(null);
  const [judgmentTitle, setJudgmentTitle] = useState(defaultJudgmentTitle);
  const [judgmentText, setJudgmentText] = useState(defaultJudgmentText);
  const [judgmentSummary, setJudgmentSummary] = useState<JudgmentSummaryResponse | null>(null);
  const [term, setTerm] = useState(defaultTerm);
  const [termExplanation, setTermExplanation] = useState<LegalTermExplanationResponse | null>(null);
  const [insights, setInsights] = useState<DiscussionInsightResponse | null>(null);
  const [postDraft, setPostDraft] = useState<AiPostGenerationResponse | null>(null);
  const [noticeDraft, setNoticeDraft] = useState<LegalNoticeDraftResponse | null>(null);
  const [postAuthor, setPostAuthor] = useState("");
  const [noticeAuthor, setNoticeAuthor] = useState("");
  const [postTopic, setPostTopic] = useState(defaultPostTopic);
  const [postAudience, setPostAudience] = useState(defaultPostAudience);
  const [postTone, setPostTone] = useState<"authoritative" | "approachable" | "urgent" | "educational">("educational");
  const [postFormat, setPostFormat] = useState<"post" | "thread" | "video-script">("thread");
  const [noticeRecipient, setNoticeRecipient] = useState(defaultNoticeRecipient);
  const [noticeType, setNoticeType] = useState(defaultNoticeType);
  const [noticeSummary, setNoticeSummary] = useState(defaultNoticeSummary);
  const [noticeDemands, setNoticeDemands] = useState(defaultNoticeDemands);
  const [noticeTone, setNoticeTone] = useState<"firm" | "measured" | "urgent">("firm");
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState("");
  const [noticeMessage, setNoticeMessage] = useState("");
  const [chatHistory, setChatHistory] = useState<AiChatMessage[]>([defaultChatGreeting]);
  const [chatInput, setChatInput] = useState("");
  const [chatPersona, setChatPersona] = useState<AiPersona>("client-advocate");
  const [chatLoading, setChatLoading] = useState(false);
  const [chatError, setChatError] = useState("");
  const [summaryInput, setSummaryInput] = useState(defaultSummaryInput);
  const [summaryLength, setSummaryLength] = useState<AiSummaryLength>("medium");
  const [summaryResult, setSummaryResult] = useState<AiSummaryResponse | null>(null);
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [summaryError, setSummaryError] = useState("");
  const [matchCaseSummary, setMatchCaseSummary] = useState(defaultMatchCaseSummary);
  const [matchPracticeArea, setMatchPracticeArea] = useState<PracticeArea>("Criminal Law");
  const [matchCity, setMatchCity] = useState(defaultMatchCity);
  const [matchUrgency, setMatchUrgency] = useState(defaultMatchUrgency);
  const [matchGoals, setMatchGoals] = useState(defaultMatchGoals);
  const [matchResult, setMatchResult] = useState<AiLawyerMatchResponse | null>(null);
  const [matchLoading, setMatchLoading] = useState(false);
  const [matchError, setMatchError] = useState("");

  useEffect(() => {
    async function loadContext() {
      try {
        const [overviewResponse, insightsResponse, lawyersResponse] = await Promise.all([
          fetch(`${apiBaseUrl}/api/ai/overview`),
          fetch(`${apiBaseUrl}/api/ai/discussion-insights`),
          fetch(`${apiBaseUrl}/api/search/lawyers`)
        ]);

        if (!overviewResponse.ok || !insightsResponse.ok || !lawyersResponse.ok) {
          throw new Error("Context load failed.");
        }

        const overviewPayload = (await overviewResponse.json()) as AiOverviewResponse;
        const insightsPayload = (await insightsResponse.json()) as DiscussionInsightResponse;
        const lawyersPayload = (await lawyersResponse.json()) as { results: LawyerProfileSummary[] };
        const defaultAuthor = lawyersPayload.results[0]?.handle ?? "";

        setOverview(overviewPayload);
        setInsights(insightsPayload);
        setLawyers(lawyersPayload.results);
        setPostAuthor(defaultAuthor);
        setNoticeAuthor(defaultAuthor);
      } catch {
        setErrorMessage("AI workbench could not load. Confirm the API is running on port 4000.");
      } finally {
        setLoading(false);
      }
    }

    void loadContext();
  }, []);

  function loadResearchDemo() {
    setQuery(defaultResearchQuery);
    setPracticeArea("Criminal Law");
    setErrorMessage("");
    setNoticeMessage("Demo matter loaded.");
  }

  function clearResearchOutput() {
    setCaseLaw(null);
    setSections(null);
    setErrorMessage("");
    setNoticeMessage("Research output cleared.");
  }

  function loadInterpretationDemo() {
    setJudgmentTitle(defaultJudgmentTitle);
    setJudgmentText(defaultJudgmentText);
    setTerm(defaultTerm);
    setErrorMessage("");
    setNoticeMessage("Interpretation demo loaded.");
  }

  function clearInterpretationOutput() {
    setJudgmentSummary(null);
    setTermExplanation(null);
    setErrorMessage("");
    setNoticeMessage("Interpretation output cleared.");
  }

  function clearPostOutput() {
    setPostDraft(null);
    setErrorMessage("");
    setNoticeMessage("Post draft cleared.");
  }

  function clearNoticeOutput() {
    setNoticeDraft(null);
    setErrorMessage("");
    setNoticeMessage("Notice draft cleared.");
  }

  function loadChatDemo() {
    setChatPersona("client-advocate");
    setChatInput(defaultChatPrompt);
    setChatError("");
    setNoticeMessage("Demo question loaded into chat.");
  }

  function resetChat() {
    setChatHistory([defaultChatGreeting]);
    setChatInput("");
    setChatError("");
    setNoticeMessage("Chat reset.");
  }

  function loadSummaryDemo() {
    setSummaryInput(defaultSummaryInput);
    setSummaryLength("medium");
    setSummaryError("");
    setNoticeMessage("Summary example loaded.");
  }

  function clearSummaryOutput() {
    setSummaryResult(null);
    setSummaryError("");
    setNoticeMessage("Summary output cleared.");
  }

  function loadMatchDemo() {
    setMatchCaseSummary(defaultMatchCaseSummary);
    setMatchPracticeArea("Criminal Law");
    setMatchCity(defaultMatchCity);
    setMatchUrgency(defaultMatchUrgency);
    setMatchGoals(defaultMatchGoals);
    setMatchError("");
    setNoticeMessage("Lawyer-match demo loaded.");
  }

  function clearMatchOutput() {
    setMatchResult(null);
    setMatchError("");
    setNoticeMessage("Lawyer-match output cleared.");
  }

  async function runResearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy("research");
    setErrorMessage("");
    try {
      const payload = { query, practiceArea };
      const [caseLawResponse, sectionResponse] = await Promise.all([
        fetch(`${apiBaseUrl}/api/ai/case-law`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        }),
        fetch(`${apiBaseUrl}/api/ai/legal-sections`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        })
      ]);
      if (!caseLawResponse.ok || !sectionResponse.ok) {
        throw new Error("Research failed.");
      }
      setCaseLaw((await caseLawResponse.json()) as CaseLawSuggestionResponse);
      setSections((await sectionResponse.json()) as LegalSectionSuggestionResponse);
      setNoticeMessage("AI research suggestions updated.");
    } catch {
      setErrorMessage("AI research request failed.");
    } finally {
      setBusy("");
    }
  }

  async function runJudgmentSummary(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy("judgment");
    setErrorMessage("");
    try {
      const response = await fetch(`${apiBaseUrl}/api/ai/summarize-judgment`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: judgmentTitle, text: judgmentText })
      });
      if (!response.ok) {
        throw new Error("Summary failed.");
      }
      setJudgmentSummary((await response.json()) as JudgmentSummaryResponse);
      setNoticeMessage("Judgment summary generated.");
    } catch {
      setErrorMessage("Judgment summarization failed.");
    } finally {
      setBusy("");
    }
  }

  async function runTermExplain(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy("term");
    setErrorMessage("");
    try {
      const response = await fetch(`${apiBaseUrl}/api/ai/explain-term`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ term })
      });
      if (!response.ok) {
        throw new Error("Explain failed.");
      }
      setTermExplanation((await response.json()) as LegalTermExplanationResponse);
      setNoticeMessage("Legal term explanation generated.");
    } catch {
      setErrorMessage("Legal term explanation failed.");
    } finally {
      setBusy("");
    }
  }

  async function refreshInsights() {
    setBusy("insights");
    setErrorMessage("");
    try {
      const response = await fetch(`${apiBaseUrl}/api/ai/discussion-insights`);
      if (!response.ok) {
        throw new Error("Insights failed.");
      }
      setInsights((await response.json()) as DiscussionInsightResponse);
      setNoticeMessage("Discussion insights refreshed.");
    } catch {
      setErrorMessage("Discussion insight refresh failed.");
    } finally {
      setBusy("");
    }
  }

  async function runPostDraft(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy("post");
    setErrorMessage("");
    try {
      const response = await fetch(`${apiBaseUrl}/api/ai/content/post-draft`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          authorHandle: postAuthor,
          topic: postTopic,
          audience: postAudience,
          tone: postTone,
          format: postFormat,
          includeHashtags: true
        })
      });
      if (!response.ok) {
        throw new Error("Post draft failed.");
      }
      setPostDraft((await response.json()) as AiPostGenerationResponse);
      setNoticeMessage("AI post draft generated.");
    } catch {
      setErrorMessage("AI post drafting failed.");
    } finally {
      setBusy("");
    }
  }

  async function runNoticeDraft(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy("notice");
    setErrorMessage("");
    try {
      const response = await fetch(`${apiBaseUrl}/api/ai/content/legal-notice`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          authorHandle: noticeAuthor,
          recipientName: noticeRecipient,
          noticeType,
          matterSummary: noticeSummary,
          demands: noticeDemands.split("\n").map((item) => item.trim()).filter(Boolean),
          tone: noticeTone,
          deadlineDays: 7
        })
      });
      if (!response.ok) {
        throw new Error("Notice failed.");
      }
      setNoticeDraft((await response.json()) as LegalNoticeDraftResponse);
      setNoticeMessage("AI legal notice draft generated.");
    } catch {
      setErrorMessage("AI legal notice drafting failed.");
    } finally {
      setBusy("");
    }
  }

  async function runChat(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmed = chatInput.trim();

    if (!trimmed) {
      return;
    }

    setChatError("");
    setChatLoading(true);
    const updatedHistory: AiChatMessage[] = [...chatHistory, { role: "user", content: trimmed }];
    setChatHistory(updatedHistory);
    setChatInput("");

    try {
      const response = await fetch(`${apiBaseUrl}/api/ai/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          persona: chatPersona,
          messages: updatedHistory.slice(-12)
        })
      });

      if (!response.ok) {
        throw new Error("Chat request failed.");
      }

      const payload = (await response.json()) as AiChatResponse;
      setChatHistory((current) => [...current, { role: "assistant", content: payload.reply }]);
    } catch {
      setChatError("Chat failed. Please try again.");
    } finally {
      setChatLoading(false);
    }
  }

  async function runSummary(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSummaryError("");
    setSummaryLoading(true);

    try {
      const response = await fetch(`${apiBaseUrl}/api/ai/summarize`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: summaryInput,
          length: summaryLength
        })
      });

      if (!response.ok) {
        throw new Error("Summary request failed.");
      }

      setSummaryResult((await response.json()) as AiSummaryResponse);
      setNoticeMessage("AI summary generated.");
    } catch {
      setSummaryError("Summary generation failed.");
    } finally {
      setSummaryLoading(false);
    }
  }

  async function runMatch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMatchError("");
    setMatchLoading(true);

    try {
      const response = await fetch(`${apiBaseUrl}/api/ai/match-lawyers`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          caseSummary: matchCaseSummary,
          practiceArea: matchPracticeArea,
          city: matchCity.trim() || undefined,
          urgency: matchUrgency,
          goals: matchGoals
        })
      });

      if (!response.ok) {
        throw new Error("Lawyer match request failed.");
      }

      setMatchResult((await response.json()) as AiLawyerMatchResponse);
      setNoticeMessage("Lawyer matches refined.");
    } catch {
      setMatchError("Lawyer matching failed.");
    } finally {
      setMatchLoading(false);
    }
  }

  const heroMetrics = [
    {
      label: "Active model",
      value: overview?.model.modelLabel ?? "Offline",
      note: overview?.model.provider === "ollama-local" ? "Local Ollama stack" : "Open-source stack"
    },
    {
      label: "Profiles in context",
      value: `${lawyers.length}`.padStart(2, "0"),
      note: "Available for drafting and lawyer matching"
    },
    {
      label: "Advisory personas",
      value: `${personaOptions.length}`.padStart(2, "0"),
      note: "Client, litigation, and business modes"
    }
  ];

  const outputMetrics = [
    {
      label: "Research hits",
      value: `${(caseLaw?.suggestions.length ?? 0) + (sections?.suggestions.length ?? 0)}`.padStart(2, "0"),
      note: "Cases and sections surfaced"
    },
    {
      label: "Judgment briefs",
      value: judgmentSummary ? "01" : "00",
      note: "Summary layer ready"
    },
    {
      label: "Lawyer matches",
      value: matchResult?.lawyers.length ? `${matchResult.lawyers.length}`.padStart(2, "0") : "00",
      note: "Reasoned recommendations"
    }
  ];
  const activePersona = personaOptions.find((persona) => persona.id === chatPersona) ?? personaOptions[0];
  const hasLawyerProfiles = lawyers.length > 0;

  if (loading) {
    return (
      <main className="relative min-h-screen overflow-hidden bg-ink px-6 py-8 text-sand sm:px-8">
        <div className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute inset-0 bg-grid bg-[size:72px_72px] opacity-[0.07]" />
          <div className="absolute left-[8%] top-12 h-56 w-56 rounded-full bg-[rgba(86,233,255,0.14)] blur-3xl" />
          <div className="absolute right-[10%] top-20 h-64 w-64 rounded-full bg-bronze/20 blur-3xl" />
        </div>
        <div className="mx-auto max-w-7xl">
          <div className="panel neon-panel p-8">
            <p className="text-sm text-mist/75">Loading the AI workbench...</p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-ink px-6 py-8 text-sand sm:px-8">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-grid bg-[size:72px_72px] opacity-[0.07]" />
        <div className="absolute left-[6%] top-12 h-64 w-64 rounded-full bg-[rgba(86,233,255,0.16)] blur-3xl" />
        <div className="absolute right-[8%] top-16 h-72 w-72 rounded-full bg-bronze/20 blur-3xl" />
        <div className="absolute bottom-8 left-1/2 h-80 w-80 -translate-x-1/2 rounded-full bg-[rgba(124,92,255,0.12)] blur-3xl" />
      </div>
      <div className="mx-auto max-w-7xl">
        <section className="panel neon-panel overflow-hidden p-6 sm:p-8 lg:p-10">
          <div className="grid gap-8 xl:grid-cols-[1.08fr_0.92fr]">
            <div>
              <div className="flex flex-wrap gap-3">
                <span className="status-pill">Clean pro UI</span>
                <span className="status-pill">Local LLaMA lane</span>
                <span className="status-pill">Research + drafting</span>
              </div>
              <p className="eyebrow mt-6">AI workbench</p>
              <h1 className="mt-4 max-w-5xl font-display text-5xl leading-[0.93] text-sand sm:text-6xl lg:text-7xl">
                One clear screen to research, explain, draft, and route legal work.
              </h1>
              <p className="mt-6 max-w-3xl text-base leading-8 text-mist/80 sm:text-lg">
                Start with the matter summary, move into explanation or drafting, and finish with chat or lawyer
                matching. Each section is grouped by task so first-time users can understand what to do next.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <a href="#research-grid" className="button-primary">
                  Start with research
                </a>
                <a href="#interpretation-lab" className="button-secondary">
                  Explain or summarize
                </a>
                <a href="#drafting-deck" className="button-secondary">
                  Open drafting
                </a>
                <a href="#counsel-console" className="button-secondary">
                  Ask AI and match lawyer
                </a>
                <Link href="/messages" className="button-secondary">
                  Open messages
                </Link>
              </div>
              <div className="mt-8 grid gap-4 md:grid-cols-2">
                {quickStartGuides.map((guide) => (
                  <a key={guide.id} href={`#${guide.id}`} className="feature-card">
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-xs uppercase tracking-[0.28em] text-bronze">Step {guide.step}</p>
                      <span className="rounded-full border border-white/10 px-3 py-1 text-[0.65rem] uppercase tracking-[0.24em] text-mist/65">
                        Open section
                      </span>
                    </div>
                    <p className="mt-4 font-display text-2xl text-sand">{guide.title}</p>
                    <p className="mt-3 text-sm leading-7 text-mist/78">{guide.body}</p>
                  </a>
                ))}
              </div>
              <div className="mt-10 grid gap-4 md:grid-cols-3">
                {heroMetrics.map((item) => (
                  <article key={item.label} className="console-card">
                    <p className="text-2xl font-semibold text-sand sm:text-3xl">{item.value}</p>
                    <p className="mt-2 text-xs uppercase tracking-[0.28em] text-[#98ecff]/80">{item.label}</p>
                    <p className="mt-3 text-sm leading-6 text-mist/70">{item.note}</p>
                  </article>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <aside className="console-card">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-xs uppercase tracking-[0.28em] text-[#98ecff]/80">Model core</p>
                    <h2 className="mt-3 font-display text-3xl leading-none text-sand sm:text-4xl">
                      {overview?.model.modelLabel}
                    </h2>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs uppercase tracking-[0.22em] text-mist/75">
                      {overview?.model.provider}
                    </span>
                    <span className="rounded-full border border-[#98ecff]/20 bg-[#98ecff]/10 px-3 py-1 text-xs uppercase tracking-[0.22em] text-[#b5f3ff]">
                      {overview?.model.deployment}
                    </span>
                    <span className="rounded-full border border-bronze/20 bg-bronze/10 px-3 py-1 text-xs uppercase tracking-[0.22em] text-bronze">
                      {overview?.model.status}
                    </span>
                  </div>
                </div>
                <p className="mt-5 text-sm leading-7 text-mist/78">{overview?.model.note}</p>
                <div className="mt-6 grid gap-3 sm:grid-cols-2">
                  {(overview?.capabilities ?? []).slice(0, 4).map((capability) => (
                    <div key={capability} className="rounded-[1.4rem] border border-white/10 bg-white/[0.03] p-4">
                      <p className="text-sm leading-7 text-sand/88">{capability}</p>
                    </div>
                  ))}
                </div>
              </aside>

              <div className="grid gap-4 lg:grid-cols-3">
                {outputMetrics.map((item) => (
                  <article key={item.label} className="console-card">
                    <p className="text-xs uppercase tracking-[0.28em] text-mist/65">{item.label}</p>
                    <p className="mt-4 text-4xl font-semibold text-sand">{item.value}</p>
                    <p className="mt-3 text-sm leading-6 text-mist/70">{item.note}</p>
                  </article>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-8 grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
            <div className="console-card">
              <p className="text-xs uppercase tracking-[0.28em] text-[#98ecff]/80">How to use this screen</p>
              <p className="mt-4 text-sm leading-7 text-mist/75">
                Use the sections in order when you want a full workflow: research the issue, explain or summarize the
                material, generate a draft, then use chat or lawyer matching to close the loop.
              </p>
              <div className="mt-5 flex flex-wrap gap-2">
                {(overview?.recommendedWorkflows ?? []).map((workflow) => (
                  <span
                    key={workflow}
                    className="rounded-full border border-white/10 bg-white/5 px-3 py-2 text-xs uppercase tracking-[0.2em] text-mist/80"
                  >
                    {workflow}
                  </span>
                ))}
              </div>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              {signalChain.map((stage) => (
                <article key={stage.title} className="signal-step">
                  <p className="text-xs uppercase tracking-[0.28em] text-bronze">{stage.title}</p>
                  <p className="mt-3 text-sm leading-7 text-mist/82">{stage.body}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        {errorMessage || noticeMessage ? (
          <div className="mt-4 flex flex-wrap gap-3">
            {errorMessage ? (
              <p className="rounded-full border border-rose-300/20 bg-rose-400/10 px-4 py-2 text-sm text-rose-200">
                {errorMessage}
              </p>
            ) : null}
            {noticeMessage ? (
              <p className="rounded-full border border-emerald-300/20 bg-emerald-400/10 px-4 py-2 text-sm text-emerald-200">
                {noticeMessage}
              </p>
            ) : null}
          </div>
        ) : null}

        <section id="research-grid" className="mt-12">
          <div className="mb-6 flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="eyebrow">Research grid</p>
              <h2 className="mt-3 max-w-3xl font-display text-4xl leading-tight text-sand sm:text-5xl">
                Start here when you need the laws, cases, and context around a matter.
              </h2>
            </div>
            <p className="max-w-2xl text-sm leading-7 text-mist/72">
              Paste the issue, pick the practice area, then run research. The right side fills with suggested cases and
              legal sections.
            </p>
          </div>
          <div className="grid gap-6 xl:grid-cols-2">
          <form className="panel p-6" onSubmit={runResearch}>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-[0.28em] text-bronze">Matter research</p>
                <p className="mt-3 max-w-xl text-sm leading-7 text-mist/72">
                  Best for first-pass analysis before you move into drafting or chat.
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <button className="button-secondary" type="button" onClick={loadResearchDemo}>
                  Use demo matter
                </button>
                <button className="button-secondary" type="button" onClick={clearResearchOutput}>
                  Clear output
                </button>
              </div>
            </div>
            <label className="field mt-5">
              <span>Matter summary</span>
              <textarea rows={4} value={query} onChange={(event) => setQuery(event.target.value)} required />
            </label>
            <label className="field mt-4">
              <span>Practice area</span>
              <select value={practiceArea} onChange={(event) => setPracticeArea(event.target.value as PracticeArea)}>
                {practiceAreas.map((area) => (
                  <option key={area} value={area}>
                    {area}
                  </option>
                ))}
              </select>
            </label>
            <button className="button-primary mt-6" type="submit" disabled={busy === "research"}>
              {busy === "research" ? "Running..." : "Run AI research"}
            </button>
          </form>

          <section className="panel p-6">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-[0.28em] text-bronze">Research output</p>
                <p className="mt-3 text-sm leading-7 text-mist/72">
                  Review the suggested cases and sections, then jump to chat or drafting with the same issue.
                </p>
              </div>
              <a href="#counsel-console" className="button-secondary">
                Continue to chat
              </a>
            </div>
            <div className="mt-5 grid gap-4">
              {caseLaw?.suggestions.map((item) => (
                <div key={item.id} className="rounded-[1.5rem] border border-white/10 bg-white/5 p-4">
                  <p className="font-medium text-sand">{item.title}</p>
                  <p className="mt-2 text-xs uppercase tracking-[0.18em] text-bronze">
                    {item.court} | {item.year}
                  </p>
                  <p className="mt-3 text-sm leading-7 text-mist/80">{item.relevanceReason}</p>
                </div>
              ))}
              {sections?.suggestions.map((item) => (
                <div key={`${item.statute}-${item.section}`} className="rounded-[1.5rem] border border-white/10 bg-white/5 p-4">
                  <p className="font-medium text-sand">
                    {item.statute} | {item.section}
                  </p>
                  <p className="mt-3 text-sm leading-7 text-mist/80">{item.whyRelevant}</p>
                </div>
              ))}
              {!caseLaw && !sections ? <p className="text-sm text-mist/70">Run AI research to populate this panel.</p> : null}
            </div>
          </section>
          </div>
        </section>

        <section id="interpretation-lab" className="mt-12">
          <div className="mb-6 flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="eyebrow">Interpretation lab</p>
              <h2 className="mt-3 max-w-3xl font-display text-4xl leading-tight text-sand sm:text-5xl">
                Use this area to turn complex text into something a lawyer or client can read quickly.
              </h2>
            </div>
            <p className="max-w-2xl text-sm leading-7 text-mist/72">
              Summarize orders, explain terms in plain language, and refresh discussion insights without leaving the page.
            </p>
          </div>
          <div className="grid gap-6 xl:grid-cols-[0.58fr_0.42fr]">
            <form className="panel p-6" onSubmit={runJudgmentSummary}>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-[0.28em] text-bronze">Judgment summarizer</p>
                <p className="mt-3 text-sm leading-7 text-mist/72">
                  Paste a long order or extract and generate a shorter brief with issues.
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <button className="button-secondary" type="button" onClick={loadInterpretationDemo}>
                  Load sample
                </button>
                <button className="button-secondary" type="button" onClick={clearInterpretationOutput}>
                  Clear output
                </button>
              </div>
            </div>
            <label className="field mt-5">
              <span>Title</span>
              <input value={judgmentTitle} onChange={(event) => setJudgmentTitle(event.target.value)} required />
            </label>
            <label className="field mt-4">
              <span>Judgment text</span>
              <textarea rows={8} value={judgmentText} onChange={(event) => setJudgmentText(event.target.value)} required />
            </label>
            <button className="button-primary mt-6" type="submit" disabled={busy === "judgment"}>
              {busy === "judgment" ? "Summarizing..." : "Summarize judgment"}
            </button>
            {judgmentSummary ? (
              <div className="mt-6 rounded-[1.5rem] border border-white/10 bg-white/5 p-4">
                <p className="text-sm leading-7 text-sand/90">{judgmentSummary.summary}</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {judgmentSummary.issues.map((issue) => (
                    <span key={issue} className="tag">
                      {issue}
                    </span>
                  ))}
                </div>
              </div>
            ) : null}
          </form>

          <div className="space-y-6">
            <form className="panel p-6" onSubmit={runTermExplain}>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-xs uppercase tracking-[0.28em] text-bronze">Explain legal term</p>
                  <p className="mt-3 text-sm leading-7 text-mist/72">
                    Use this when you need a simple explanation for a client or intake team member.
                  </p>
                </div>
                <button className="button-secondary" type="button" onClick={loadInterpretationDemo}>
                  Load sample
                </button>
              </div>
              <label className="field mt-5">
                <span>Term</span>
                <input value={term} onChange={(event) => setTerm(event.target.value)} required />
              </label>
              <button className="button-primary mt-6" type="submit" disabled={busy === "term"}>
                {busy === "term" ? "Explaining..." : "Explain"}
              </button>
              {termExplanation ? (
                <div className="mt-6 rounded-[1.5rem] border border-white/10 bg-white/5 p-4">
                  <p className="text-sm leading-7 text-mist/80">{termExplanation.simpleExplanation}</p>
                  <p className="mt-3 text-sm leading-7 text-sand/90">{termExplanation.plainLanguageExample}</p>
                </div>
              ) : null}
            </form>

            <section className="panel p-6">
              <div className="flex items-center justify-between gap-3">
                <p className="text-xs uppercase tracking-[0.28em] text-bronze">Discussion insights</p>
                <button className="button-secondary" type="button" onClick={() => void refreshInsights()} disabled={busy === "insights"}>
                  {busy === "insights" ? "Refreshing..." : "Refresh"}
                </button>
              </div>
              <div className="mt-5 space-y-3">
                {insights?.insights.map((item) => (
                  <div key={item.id} className="rounded-[1.5rem] border border-white/10 bg-white/5 p-4">
                    <p className="font-medium text-sand">{item.title}</p>
                    <p className="mt-3 text-sm leading-7 text-mist/80">{item.insight}</p>
                  </div>
                ))}
                {!insights?.insights.length ? <p className="text-sm text-mist/70">Refresh to load the latest insights.</p> : null}
              </div>
            </section>
          </div>
          </div>
        </section>

        <section id="drafting-deck" className="mt-12">
          <div className="mb-6 flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="eyebrow">Drafting deck</p>
              <h2 className="mt-3 max-w-3xl font-display text-4xl leading-tight text-sand sm:text-5xl">
                Generate polished drafts once the facts and research are clear.
              </h2>
            </div>
            <p className="max-w-2xl text-sm leading-7 text-mist/72">
              This section handles client-facing content and longer legal drafting. It works best after the research and
              explanation steps above.
            </p>
          </div>
          <div className="grid gap-6 xl:grid-cols-2">
            <form className="panel p-6" onSubmit={runPostDraft}>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-[0.28em] text-bronze">AI post assistant</p>
                <p className="mt-3 text-sm leading-7 text-mist/72">
                  Draft a clear public-facing post for legal education, awareness, or marketing.
                </p>
              </div>
              <button className="button-secondary" type="button" onClick={clearPostOutput}>
                Clear draft
              </button>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              <span className="status-pill">Extended lane</span>
              <span className="status-pill">Deeper draft budget</span>
            </div>
            {!hasLawyerProfiles ? (
              <p className="mt-4 text-sm text-mist/70">Load lawyer profiles first so the assistant can attribute the draft.</p>
            ) : null}
            <label className="field mt-5">
              <span>Author</span>
              <select value={postAuthor} onChange={(event) => setPostAuthor(event.target.value)} disabled={!hasLawyerProfiles}>
                {lawyers.map((lawyer) => (
                  <option key={lawyer.handle} value={lawyer.handle}>
                    {lawyer.fullName}
                  </option>
                ))}
              </select>
            </label>
            <label className="field mt-4">
              <span>Topic</span>
              <input value={postTopic} onChange={(event) => setPostTopic(event.target.value)} required />
            </label>
            <label className="field mt-4">
              <span>Audience</span>
              <input value={postAudience} onChange={(event) => setPostAudience(event.target.value)} required />
            </label>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <label className="field">
                <span>Tone</span>
                <select value={postTone} onChange={(event) => setPostTone(event.target.value as typeof postTone)}>
                  <option value="authoritative">Authoritative</option>
                  <option value="approachable">Approachable</option>
                  <option value="urgent">Urgent</option>
                  <option value="educational">Educational</option>
                </select>
              </label>
              <label className="field">
                <span>Format</span>
                <select value={postFormat} onChange={(event) => setPostFormat(event.target.value as typeof postFormat)}>
                  <option value="post">Post</option>
                  <option value="thread">Thread</option>
                  <option value="video-script">Video script</option>
                </select>
              </label>
            </div>
            <button className="button-primary mt-6" type="submit" disabled={busy === "post" || !hasLawyerProfiles}>
              {busy === "post" ? "Generating..." : "Generate post draft"}
            </button>
            {postDraft ? (
              <div className="mt-6 rounded-[1.5rem] border border-white/10 bg-white/5 p-4">
                <p className="font-medium text-sand">{postDraft.headline}</p>
                <p className="mt-4 whitespace-pre-wrap text-sm leading-7 text-mist/80">{postDraft.draftBody}</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {postDraft.hashtags.map((hashtag) => (
                    <span key={hashtag} className="tag">
                      #{hashtag}
                    </span>
                  ))}
                </div>
                <Link href="/creator-studio" className="button-secondary mt-6">
                  Open creator studio
                </Link>
              </div>
            ) : null}
          </form>

          <form className="panel p-6" onSubmit={runNoticeDraft}>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-[0.28em] text-bronze">AI legal notice assistant</p>
                <p className="mt-3 text-sm leading-7 text-mist/72">
                  Draft a structured notice once you know the recipient, issue, and demands.
                </p>
              </div>
              <button className="button-secondary" type="button" onClick={clearNoticeOutput}>
                Clear draft
              </button>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              <span className="status-pill">Extended lane</span>
              <span className="status-pill">Long-form notice mode</span>
            </div>
            {!hasLawyerProfiles ? (
              <p className="mt-4 text-sm text-mist/70">Load lawyer profiles first so the notice can be attributed correctly.</p>
            ) : null}
            <label className="field mt-5">
              <span>Author</span>
              <select value={noticeAuthor} onChange={(event) => setNoticeAuthor(event.target.value)} disabled={!hasLawyerProfiles}>
                {lawyers.map((lawyer) => (
                  <option key={`notice-${lawyer.handle}`} value={lawyer.handle}>
                    {lawyer.fullName}
                  </option>
                ))}
              </select>
            </label>
            <label className="field mt-4">
              <span>Recipient</span>
              <input value={noticeRecipient} onChange={(event) => setNoticeRecipient(event.target.value)} required />
            </label>
            <label className="field mt-4">
              <span>Notice type</span>
              <input value={noticeType} onChange={(event) => setNoticeType(event.target.value)} required />
            </label>
            <label className="field mt-4">
              <span>Matter summary</span>
              <textarea rows={4} value={noticeSummary} onChange={(event) => setNoticeSummary(event.target.value)} required />
            </label>
            <label className="field mt-4">
              <span>Demands, one per line</span>
              <textarea rows={4} value={noticeDemands} onChange={(event) => setNoticeDemands(event.target.value)} required />
            </label>
            <label className="field mt-4">
              <span>Tone</span>
              <select value={noticeTone} onChange={(event) => setNoticeTone(event.target.value as typeof noticeTone)}>
                <option value="firm">Firm</option>
                <option value="measured">Measured</option>
                <option value="urgent">Urgent</option>
              </select>
            </label>
            <button className="button-primary mt-6" type="submit" disabled={busy === "notice" || !hasLawyerProfiles}>
              {busy === "notice" ? "Drafting..." : "Draft legal notice"}
            </button>
            {noticeDraft ? (
              <div className="mt-6 rounded-[1.5rem] border border-white/10 bg-white/5 p-4">
                <p className="font-medium text-sand">{noticeDraft.subject}</p>
                <p className="mt-4 whitespace-pre-wrap text-sm leading-7 text-mist/80">{noticeDraft.draftBody}</p>
              </div>
            ) : null}
          </form>
          </div>
        </section>
        <section id="counsel-console" className="mt-12">
          <div className="mb-6 flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="eyebrow">Counsel console</p>
              <h2 className="mt-3 max-w-3xl font-display text-4xl leading-tight text-sand sm:text-5xl">
                Ask follow-up questions, compress intake, and route the matter to the right lawyer.
              </h2>
            </div>
            <p className="max-w-2xl text-sm leading-7 text-mist/72">
              This is the final action layer. Use it when you want practical guidance or a recommended lawyer shortlist.
            </p>
          </div>
          <div className="grid gap-6 lg:grid-cols-[0.62fr_0.38fr]">
            <form className="panel p-6" onSubmit={runChat}>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-[0.28em] text-bronze">Conversational assistant</p>
                <p className="mt-3 text-sm leading-7 text-mist/70">
                  Switch personas, share the matter, and ask follow-up questions in the faster response lane.
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <button className="button-secondary" type="button" onClick={loadChatDemo}>
                  Load demo question
                </button>
                <button className="button-secondary" type="button" onClick={resetChat}>
                  Clear chat
                </button>
              </div>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              <span className="status-pill">Fast lane</span>
              <span className="status-pill">Lower latency chat</span>
            </div>
            <div className="mt-5 grid gap-2 sm:grid-cols-3">
              {personaOptions.map((persona) => (
                <button
                  key={persona.id}
                  type="button"
                  className={`rounded-full border px-3 py-1 text-xs transition ${
                    chatPersona === persona.id
                      ? "border-bronze bg-bronze/10 text-sand"
                      : "border-white/10 text-mist/70 hover:border-white/40"
                  }`}
                  onClick={() => setChatPersona(persona.id)}
                >
                  {persona.label}
                </button>
              ))}
            </div>
            <p className="mt-4 text-sm leading-7 text-mist/72">{activePersona.description}</p>
            <div className="mt-5 space-y-3 overflow-y-auto rounded-[1.5rem] border border-white/10 bg-white/5 p-4 text-sm leading-7 text-mist/80 max-h-60">
              {chatHistory.map((message, index) => (
                <div key={`${message.role}-${index}`} className="rounded-2xl border border-white/5 bg-ink/40 p-4">
                  <p className="text-[0.65rem] uppercase tracking-[0.3em] text-bronze">
                    {message.role === "assistant" ? "AI advisor" : "Operator"}
                  </p>
                  <p className="mt-2 text-sm leading-7 text-sand/90 whitespace-pre-wrap">{message.content}</p>
                </div>
              ))}
            </div>
            {chatError ? <p className="mt-3 text-sm text-rose-300">{chatError}</p> : null}
            <label className="field mt-5">
              <span>Message</span>
              <textarea
                rows={3}
                value={chatInput}
                onChange={(event) => setChatInput(event.target.value)}
                placeholder="Describe the matter, ask about the next step, or ask for organized advice."
                required
              />
            </label>
            <button className="button-primary mt-6" type="submit" disabled={chatLoading}>
              {chatLoading ? "Thinking..." : "Send message"}
            </button>
          </form>

          <div className="space-y-6">
            <form className="panel p-6" onSubmit={runSummary}>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-xs uppercase tracking-[0.28em] text-bronze">Case summarizer</p>
                  <p className="mt-3 text-sm leading-7 text-mist/72">
                    Convert a long intake note into a short internal summary or client-ready brief.
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button className="button-secondary" type="button" onClick={loadSummaryDemo}>
                    Load sample
                  </button>
                  <button className="button-secondary" type="button" onClick={clearSummaryOutput}>
                    Clear output
                  </button>
                </div>
              </div>
              <label className="field mt-5">
                <span>Client intake text</span>
                <textarea rows={5} value={summaryInput} onChange={(event) => setSummaryInput(event.target.value)} required />
              </label>
              <label className="field mt-4">
                <span>Preferred length</span>
                <select value={summaryLength} onChange={(event) => setSummaryLength(event.target.value as AiSummaryLength)}>
                  <option value="short">Short (2 sentences)</option>
                  <option value="medium">Medium (3-4 sentences)</option>
                  <option value="detailed">Detailed (paragraph + next steps)</option>
                </select>
              </label>
              <button className="button-primary mt-6" type="submit" disabled={summaryLoading}>
                {summaryLoading ? "Summarizing..." : "Generate summary"}
              </button>
              {summaryError ? <p className="mt-3 text-sm text-rose-300">{summaryError}</p> : null}
              {summaryResult ? (
                <div className="mt-6 space-y-3 rounded-[1.5rem] border border-white/10 bg-white/5 p-4">
                  <p className="text-sm leading-7 text-sand/90">{summaryResult.summary}</p>
                  {summaryResult.keyPoints.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {summaryResult.keyPoints.map((point) => (
                        <span key={point} className="tag">
                          {point}
                        </span>
                      ))}
                    </div>
                  ) : null}
                </div>
              ) : null}
            </form>

            <form className="panel p-6" onSubmit={runMatch}>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-xs uppercase tracking-[0.28em] text-bronze">Lawyer match finder</p>
                  <p className="mt-3 text-sm leading-7 text-mist/72">
                    Use the case facts, urgency, and location to narrow the right lawyer fit.
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button className="button-secondary" type="button" onClick={loadMatchDemo}>
                    Load sample
                  </button>
                  <button className="button-secondary" type="button" onClick={clearMatchOutput}>
                    Clear output
                  </button>
                </div>
              </div>
              <label className="field mt-5">
                <span>Case summary</span>
                <textarea rows={4} value={matchCaseSummary} onChange={(event) => setMatchCaseSummary(event.target.value)} required />
              </label>
              <label className="field mt-4">
                <span>Practice area</span>
                <select value={matchPracticeArea} onChange={(event) => setMatchPracticeArea(event.target.value as PracticeArea)}>
                  {practiceAreas.map((area) => (
                    <option key={area} value={area}>
                      {area}
                    </option>
                  ))}
                </select>
              </label>
              <label className="field mt-4">
                <span>City</span>
                <input value={matchCity} onChange={(event) => setMatchCity(event.target.value)} />
              </label>
              <label className="field mt-4">
                <span>Urgency</span>
                <textarea rows={2} value={matchUrgency} onChange={(event) => setMatchUrgency(event.target.value)} />
              </label>
              <label className="field mt-4">
                <span>Goals</span>
                <textarea rows={2} value={matchGoals} onChange={(event) => setMatchGoals(event.target.value)} />
              </label>
              <button className="button-primary mt-6" type="submit" disabled={matchLoading}>
                {matchLoading ? "Searching..." : "Match lawyers"}
              </button>
              {matchError ? <p className="mt-3 text-sm text-rose-300">{matchError}</p> : null}
              {matchResult ? (
                <div className="mt-6 space-y-4 rounded-[1.5rem] border border-white/10 bg-white/5 p-4">
                  <p className="text-sm text-mist/80">{matchResult.narrative}</p>
                  {matchResult.lawyers.length > 0 ? (
                    <div className="space-y-3">
                      {matchResult.lawyers.map((match) => (
                        <article
                          key={match.profile.handle}
                          className="rounded-[1.5rem] border border-white/5 bg-ink/40 p-4"
                        >
                          <div className="flex items-center justify-between gap-3">
                            <p className="font-medium text-sand">{match.profile.fullName}</p>
                            <span className="text-xs uppercase tracking-[0.28em] text-bronze">
                              {match.profile.city}
                            </span>
                          </div>
                          <p className="mt-1 text-xs text-mist/60">
                            {match.profile.practiceAreas.join(", ")} | {match.profile.responseTimeLabel}
                          </p>
                          <p className="mt-3 text-sm leading-7 text-mist/80">{match.reason}</p>
                          <div className="mt-4 flex flex-wrap gap-3">
                            <Link href={`/lawyers/${match.profile.handle}`} className="button-secondary">
                              View profile
                            </Link>
                            <Link href={`/consultations/${match.profile.handle}`} className="button-secondary">
                              Book consultation
                            </Link>
                          </div>
                        </article>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-mist/70">No matches surfaced for that input yet.</p>
                  )}
                </div>
              ) : (
                <p className="mt-4 text-sm text-mist/70">Generate a match to see lawyers and reasoning.</p>
              )}
            </form>
          </div>
          </div>
        </section>
      </div>
    </main>
  );
}
