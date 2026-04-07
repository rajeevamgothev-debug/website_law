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

export function AiWorkbench() {
  const [overview, setOverview] = useState<AiOverviewResponse | null>(null);
  const [lawyers, setLawyers] = useState<LawyerProfileSummary[]>([]);
  const [query, setQuery] = useState("Urgent criminal complaint and anticipatory bail strategy");
  const [practiceArea, setPracticeArea] = useState<PracticeArea>("Criminal Law");
  const [caseLaw, setCaseLaw] = useState<CaseLawSuggestionResponse | null>(null);
  const [sections, setSections] = useState<LegalSectionSuggestionResponse | null>(null);
  const [judgmentTitle, setJudgmentTitle] = useState("Prototype judgment intake");
  const [judgmentText, setJudgmentText] = useState(
    "The petitioner sought urgent relief after coercive steps were threatened despite incomplete procedural safeguards. The court examined liberty concerns, the chronology of events, and whether the state action could continue without closer scrutiny. It held that procedural discipline mattered and interim protection was justified while the matter was examined further."
  );
  const [judgmentSummary, setJudgmentSummary] = useState<JudgmentSummaryResponse | null>(null);
  const [term, setTerm] = useState("anticipatory bail");
  const [termExplanation, setTermExplanation] = useState<LegalTermExplanationResponse | null>(null);
  const [insights, setInsights] = useState<DiscussionInsightResponse | null>(null);
  const [postDraft, setPostDraft] = useState<AiPostGenerationResponse | null>(null);
  const [noticeDraft, setNoticeDraft] = useState<LegalNoticeDraftResponse | null>(null);
  const [postAuthor, setPostAuthor] = useState("");
  const [noticeAuthor, setNoticeAuthor] = useState("");
  const [postTopic, setPostTopic] = useState("Urgent complaint response checklist");
  const [postAudience, setPostAudience] = useState("founders and first-time private clients");
  const [postTone, setPostTone] = useState<"authoritative" | "approachable" | "urgent" | "educational">("educational");
  const [postFormat, setPostFormat] = useState<"post" | "thread" | "video-script">("thread");
  const [noticeRecipient, setNoticeRecipient] = useState("Counterparty / Respondent");
  const [noticeType, setNoticeType] = useState("Breach of contract");
  const [noticeSummary, setNoticeSummary] = useState(
    "The recipient failed to perform contractual obligations despite prior follow-up and caused commercial prejudice."
  );
  const [noticeDemands, setNoticeDemands] = useState(
    "Cease the breach immediately\nCure the default within 7 days\nConfirm compliance in writing"
  );
  const [noticeTone, setNoticeTone] = useState<"firm" | "measured" | "urgent">("firm");
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState("");
  const [noticeMessage, setNoticeMessage] = useState("");
  const [chatHistory, setChatHistory] = useState<AiChatMessage[]>([
    {
      role: "assistant",
      content:
        "Hi there! Tell me about your legal problem or ask for a summary, a persona-guided insight, or lawyer matching."
    }
  ]);
  const [chatInput, setChatInput] = useState("");
  const [chatPersona, setChatPersona] = useState<AiPersona>("client-advocate");
  const [chatLoading, setChatLoading] = useState(false);
  const [chatError, setChatError] = useState("");
  const [summaryInput, setSummaryInput] = useState(
    "The client fears arrest after a heated business dispute in Bengaluru. The complaint mentions breach of trust and misappropriation of funds linked to a short-term joint venture."
  );
  const [summaryLength, setSummaryLength] = useState<AiSummaryLength>("medium");
  const [summaryResult, setSummaryResult] = useState<AiSummaryResponse | null>(null);
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [summaryError, setSummaryError] = useState("");
  const [matchCaseSummary, setMatchCaseSummary] = useState(
    "A founder shares a matter involving a breach-of-promissory note dispute tied to property shading, plus an imminent hearing scheduled in the coming 10 days."
  );
  const [matchPracticeArea, setMatchPracticeArea] = useState<PracticeArea>("Criminal Law");
  const [matchCity, setMatchCity] = useState("Hyderabad");
  const [matchUrgency, setMatchUrgency] = useState("Urgent: need pretrial protection and rapid guidance.");
  const [matchGoals, setMatchGoals] = useState("Lock in anticipatory bail strategy while keeping the dispute confidential.");
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
    const updatedHistory = [...chatHistory, { role: "user", content: trimmed }];
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

  if (loading) {
    return (
      <main className="min-h-screen bg-ink px-6 py-8 text-sand sm:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="panel p-8">
            <p className="text-sm text-mist/75">Loading AI workbench...</p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-ink px-6 py-8 text-sand sm:px-8">
      <div className="mx-auto max-w-7xl">
        <section className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
          <div>
            <p className="eyebrow">Phase 5 AI intelligence</p>
            <h1 className="mt-4 max-w-4xl font-display text-6xl leading-none text-sand sm:text-7xl">
              Research, summarize, explain, and draft from one AI legal workbench.
            </h1>
            <p className="mt-6 max-w-3xl text-lg leading-8 text-mist/80">
              This phase adds a local-first intelligence layer shaped for Ollama or open-source deployment across
              research, drafting, and non-sensitive collaboration insights.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/creator-studio" className="button-secondary">
                Open creator studio
              </Link>
              <Link href="/messages" className="button-secondary">
                Open message center
              </Link>
            </div>
          </div>
          <aside className="panel p-6">
            <p className="text-xs uppercase tracking-[0.28em] text-bronze">Model</p>
            <div className="mt-5 rounded-[1.5rem] border border-bronze/20 bg-bronze/10 p-4 text-sm leading-7 text-sand/90">
              <p className="font-medium">
                {overview?.model.modelLabel} | {overview?.model.provider}
              </p>
              <p className="mt-2 text-mist/75">{overview?.model.note}</p>
            </div>
          </aside>
        </section>

        {errorMessage ? <p className="mt-4 text-sm text-rose-300">{errorMessage}</p> : null}
        {noticeMessage ? <p className="mt-4 text-sm text-emerald-300">{noticeMessage}</p> : null}

        <section className="mt-10 grid gap-6 xl:grid-cols-2">
          <form className="panel p-6" onSubmit={runResearch}>
            <p className="text-xs uppercase tracking-[0.28em] text-bronze">Matter research</p>
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
            <p className="text-xs uppercase tracking-[0.28em] text-bronze">Research output</p>
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
        </section>

        <section className="mt-10 grid gap-6 xl:grid-cols-[0.58fr_0.42fr]">
          <form className="panel p-6" onSubmit={runJudgmentSummary}>
            <p className="text-xs uppercase tracking-[0.28em] text-bronze">Judgment summarizer</p>
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
              <p className="text-xs uppercase tracking-[0.28em] text-bronze">Explain legal term</p>
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
              </div>
            </section>
          </div>
        </section>

        <section className="mt-10 grid gap-6 xl:grid-cols-2">
          <form className="panel p-6" onSubmit={runPostDraft}>
            <p className="text-xs uppercase tracking-[0.28em] text-bronze">AI post assistant</p>
            <label className="field mt-5">
              <span>Author</span>
              <select value={postAuthor} onChange={(event) => setPostAuthor(event.target.value)}>
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
            <button className="button-primary mt-6" type="submit" disabled={busy === "post"}>
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
            <p className="text-xs uppercase tracking-[0.28em] text-bronze">AI legal notice assistant</p>
            <label className="field mt-5">
              <span>Author</span>
              <select value={noticeAuthor} onChange={(event) => setNoticeAuthor(event.target.value)}>
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
            <button className="button-primary mt-6" type="submit" disabled={busy === "notice"}>
              {busy === "notice" ? "Drafting..." : "Draft legal notice"}
            </button>
            {noticeDraft ? (
              <div className="mt-6 rounded-[1.5rem] border border-white/10 bg-white/5 p-4">
                <p className="font-medium text-sand">{noticeDraft.subject}</p>
                <p className="mt-4 whitespace-pre-wrap text-sm leading-7 text-mist/80">{noticeDraft.draftBody}</p>
              </div>
            ) : null}
          </form>
        </section>
        <section className="mt-10 grid gap-6 lg:grid-cols-[0.62fr_0.38fr]">
          <form className="panel p-6" onSubmit={runChat}>
            <p className="text-xs uppercase tracking-[0.28em] text-bronze">Conversational assistant</p>
            <p className="mt-3 text-sm leading-7 text-mist/70">
              Switch personas, share your case details, and let the assistant answer follow-up questions in chat.
            </p>
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
            <div className="mt-5 space-y-3 overflow-y-auto rounded-[1.5rem] border border-white/10 bg-white/5 p-4 text-sm leading-7 text-mist/80 max-h-60">
              {chatHistory.map((message, index) => (
                <div key={`${message.role}-${index}`} className="rounded-2xl border border-white/5 bg-ink/40 p-4">
                  <p className="text-[0.65rem] uppercase tracking-[0.3em] text-bronze">
                    {message.role === "assistant" ? "AI advisor" : "You"}
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
              <p className="text-xs uppercase tracking-[0.28em] text-bronze">Case summarizer</p>
              <label className="field mt-5">
                <span>Client intake text</span>
                <textarea rows={5} value={summaryInput} onChange={(event) => setSummaryInput(event.target.value)} required />
              </label>
              <label className="field mt-4">
                <span>Preferred length</span>
                <select value={summaryLength} onChange={(event) => setSummaryLength(event.target.value as AiSummaryLength)}>
                  <option value="short">Short (2 sentences)</option>
                  <option value="medium">Medium (3–4 sentences)</option>
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
              <p className="text-xs uppercase tracking-[0.28em] text-bronze">Lawyer match finder</p>
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
                            {match.profile.practiceAreas.join(", ")} • {match.profile.responseTimeLabel}
                          </p>
                          <p className="mt-3 text-sm leading-7 text-mist/80">{match.reason}</p>
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
        </section>
      </div>
    </main>
  );
}
