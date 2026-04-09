import type {
  AiChatRequest,
  AiChatResponse,
  AiLawyerMatchRequest,
  AiLawyerMatchResponse,
  AiPersona,
  AiModelInfo,
  AiOverviewResponse,
  AiPostGenerationRequest,
  AiPostGenerationResponse,
  AiSummaryRequest,
  AiSummaryResponse,
  CaseLawSuggestion,
  CaseLawSuggestionResponse,
  DiscussionInsight,
  DiscussionInsightResponse,
  JudgmentSummaryRequest,
  JudgmentSummaryResponse,
  LawyerProfileSummary,
  LegalNoticeDraftRequest,
  LegalNoticeDraftResponse,
  LegalSectionSuggestion,
  LegalSectionSuggestionResponse,
  LegalTermExplanationRequest,
  LegalTermExplanationResponse,
  MatterResearchRequest,
  PracticeArea
} from "@lexevo/contracts";

import { env } from "../../config/env";
import { listCommunicationsDashboard } from "../communications/communications.service";
import {
  findProfileByHandle,
  listProfileSummaries
} from "../profiles/profile.service";
import { generateAiPostDraft, listTrendTopics } from "../social/social.service";
import { generateWithOllama, isOllamaModelAvailable } from "./ollama";

const aiModel: AiModelInfo = {
  provider: "ollama-local",
  modelLabel: env.OLLAMA_MODEL,
  deployment: "self-host-ready",
  status: "demo",
  note: "Local-first AI scaffold shaped for an Ollama or open-source deployment, with deterministic prototype responses in this build."
};

const personaInstructions: Record<AiPersona, string> = {
  "client-advocate": "You are a calm, empathetic legal advocate who translates law into clear next steps for clients. Cite procedural posture, data protection, and practical instructions without legalese.",
  "litigation-strategist": "You are a high-stakes litigation strategist focused on court posture, evidence readiness, and risk management. Prioritize clarity on legal triggers, deadlines, and strategy trade-offs.",
  "business-counsel": "You are a business-focused counsel who blends legal precision with commercialization. Focus on contracts, governance, risk allocation, and how legal choices affect business momentum."
};

const ollamaBudgets = {
  fast: env.OLLAMA_NUM_PREDICT_FAST,
  standard: env.OLLAMA_NUM_PREDICT,
  deep: env.OLLAMA_NUM_PREDICT_DEEP
} as const;

const caseLawLibrary: CaseLawSuggestion[] = [
  {
    id: "case_arnesh_kumar",
    title: "Arnesh Kumar v. State of Bihar",
    court: "Supreme Court of India",
    year: 2014,
    practiceArea: "Criminal Law",
    keyHolding: "Arrest should not be automatic where the statute does not justify mechanical detention.",
    relevanceReason: "Useful when the query involves complaint escalation, arrest exposure, or the need for procedural restraint.",
    tags: ["arrest", "criminal procedure", "safeguards"]
  },
  {
    id: "case_sibbia",
    title: "Gurbaksh Singh Sibbia v. State of Punjab",
    court: "Supreme Court of India",
    year: 1980,
    practiceArea: "Criminal Law",
    keyHolding: "Anticipatory bail must be assessed on facts and cannot be reduced to rigid formulas.",
    relevanceReason: "Strong starting point when the matter involves anticipatory bail strategy and urgent criminal exposure.",
    tags: ["anticipatory bail", "bail", "urgency"]
  },
  {
    id: "case_vineeta_sharma",
    title: "Vineeta Sharma v. Rakesh Sharma",
    court: "Supreme Court of India",
    year: 2020,
    practiceArea: "Property Law",
    keyHolding: "Daughters have coparcenary rights by birth and need not rely on the father being alive on the amendment date.",
    relevanceReason: "Relevant to inheritance, partition, and family-property questions with title implications.",
    tags: ["property", "inheritance", "coparcenary"]
  },
  {
    id: "case_booz_allen",
    title: "Booz Allen & Hamilton Inc. v. SBI Home Finance Ltd.",
    court: "Supreme Court of India",
    year: 2011,
    practiceArea: "Arbitration",
    keyHolding: "Not every dispute is arbitrable; rights in rem require careful classification before referral to arbitration.",
    relevanceReason: "Useful when the issue turns on arbitrability, commercial disputes, and forum strategy.",
    tags: ["arbitration", "forum", "commercial disputes"]
  },
  {
    id: "case_vodafone",
    title: "Vodafone International Holdings BV v. Union of India",
    court: "Supreme Court of India",
    year: 2012,
    practiceArea: "Tax Law",
    keyHolding: "Tax exposure in cross-border structures requires careful analysis of underlying transaction substance and situs questions.",
    relevanceReason: "Strong anchor for cross-border tax structuring, indirect transfer, and transaction design questions.",
    tags: ["tax", "cross-border", "structuring"]
  },
  {
    id: "case_modi_entertainment",
    title: "Modi Entertainment Network v. W.S.G. Cricket Pte. Ltd.",
    court: "Supreme Court of India",
    year: 2003,
    practiceArea: "Civil Litigation",
    keyHolding: "Injunction and forum-related strategy require disciplined analysis of convenience, justice, and enforceability.",
    relevanceReason: "Useful for injunction thinking, forum contests, and high-stakes civil litigation posture.",
    tags: ["injunction", "civil litigation", "forum"]
  },
  {
    id: "case_shilpa_sailesh",
    title: "Shilpa Sailesh v. Varun Sreenivasan",
    court: "Supreme Court of India",
    year: 2023,
    practiceArea: "Family Law",
    keyHolding: "The court discussed when complete justice principles can resolve irretrievably broken matrimonial disputes.",
    relevanceReason: "Helpful in high-conflict matrimonial matters where settlement posture and dissolution strategy matter.",
    tags: ["family law", "matrimonial", "settlement"]
  },
  {
    id: "case_icici_v_incable",
    title: "ICICI Bank Ltd. v. Official Liquidator of APS Star Industries Ltd.",
    court: "Supreme Court of India",
    year: 2010,
    practiceArea: "Corporate Advisory",
    keyHolding: "Commercial rights, assignment structures, and insolvency-adjacent consequences require careful reading of transaction design.",
    relevanceReason: "Useful for corporate structuring, banking exposure, and transactional risk allocation.",
    tags: ["corporate", "assignment", "commercial"]
  }
];

const sectionLibrary: Array<LegalSectionSuggestion & { practiceAreas: PracticeArea[]; keywords: string[] }> = [
  {
    statute: "Code of Criminal Procedure",
    section: "Section 438",
    title: "Anticipatory bail",
    whyRelevant: "Useful where a client anticipates arrest and wants pre-arrest protection strategy.",
    caution: "Check factual urgency, maintainability, and forum before relying on it.",
    practiceAreas: ["Criminal Law"],
    keywords: ["arrest", "bail", "complaint", "police"]
  },
  {
    statute: "Code of Criminal Procedure",
    section: "Section 439",
    title: "Special powers regarding bail",
    whyRelevant: "Relevant for regular bail strategy once custody or higher-court intervention is in play.",
    caution: "Map custody posture and concurrent proceedings carefully.",
    practiceAreas: ["Criminal Law"],
    keywords: ["custody", "bail", "high court"]
  },
  {
    statute: "Indian Penal Code",
    section: "Section 420",
    title: "Cheating and dishonestly inducing delivery of property",
    whyRelevant: "Often raised in complaint narratives involving fraud, inducement, or business fallout.",
    caution: "Do not assume the criminal ingredients are made out just because a commercial dispute exists.",
    practiceAreas: ["Criminal Law", "Civil Litigation", "Corporate Advisory"],
    keywords: ["fraud", "cheating", "inducement", "business"]
  },
  {
    statute: "Constitution of India",
    section: "Article 21",
    title: "Protection of life and personal liberty",
    whyRelevant: "Grounds urgent liberty-focused arguments and fairness concerns in criminal and due-process matters.",
    caution: "Constitutional framing needs facts, forum discipline, and a clear rights theory.",
    practiceAreas: ["Criminal Law", "Civil Litigation"],
    keywords: ["liberty", "rights", "due process", "writ"]
  },
  {
    statute: "Constitution of India",
    section: "Article 226",
    title: "Writ jurisdiction of High Courts",
    whyRelevant: "Relevant where urgent writ relief is being considered for procedural unfairness or state action.",
    caution: "Maintainability, alternate remedy, and urgency still need to be evaluated.",
    practiceAreas: ["Criminal Law", "Civil Litigation", "Corporate Advisory"],
    keywords: ["writ", "high court", "relief", "state action"]
  },
  {
    statute: "Hindu Succession Act",
    section: "Section 6",
    title: "Devolution of interest in coparcenary property",
    whyRelevant: "Core starting point for partition, inheritance, and coparcenary property disputes.",
    caution: "Always pair with title history and family tree evidence.",
    practiceAreas: ["Property Law", "Family Law"],
    keywords: ["property", "inheritance", "partition", "family property"]
  },
  {
    statute: "Arbitration and Conciliation Act",
    section: "Section 11",
    title: "Appointment of arbitrators",
    whyRelevant: "Relevant once the parties are moving from dispute posture into constitution of the arbitral tribunal.",
    caution: "Check arbitration clause quality and prior notice requirements first.",
    practiceAreas: ["Arbitration", "Corporate Advisory"],
    keywords: ["arbitration", "tribunal", "appointment", "clause"]
  },
  {
    statute: "Arbitration and Conciliation Act",
    section: "Section 34",
    title: "Application for setting aside arbitral award",
    whyRelevant: "Useful when the question is post-award challenge strategy and limited grounds of interference.",
    caution: "Challenge grounds are narrow and timing matters.",
    practiceAreas: ["Arbitration"],
    keywords: ["award", "challenge", "set aside", "arbitration"]
  },
  {
    statute: "Income-tax Act",
    section: "Section 9(1)(i)",
    title: "Income deemed to accrue or arise in India",
    whyRelevant: "Useful in cross-border structuring, source rules, and transaction-design tax questions.",
    caution: "Pair with treaty analysis and the transaction architecture before drawing conclusions.",
    practiceAreas: ["Tax Law", "Corporate Advisory"],
    keywords: ["tax", "cross-border", "income", "transaction"]
  }
];

const legalTermDictionary: Record<
  string,
  Omit<LegalTermExplanationResponse, "term">
> = {
  "anticipatory bail": {
    simpleExplanation: "Anticipatory bail is a court order that protects someone from being taken into custody before arrest, subject to conditions.",
    whenItMatters: "It matters when a person reasonably expects arrest because of a complaint, FIR, or escalating criminal allegation.",
    plainLanguageExample: "If a founder fears arrest after a complaint is threatened, counsel may move for anticipatory bail instead of waiting for arrest to happen.",
    caution: "Availability depends on facts, the forum, and the exact procedural posture."
  },
  injunction: {
    simpleExplanation: "An injunction is a court order telling someone to do something or stop doing something for now or permanently.",
    whenItMatters: "It matters in urgent civil disputes where delay could cause harm that money alone cannot fix later.",
    plainLanguageExample: "A court may restrain a party from selling disputed property until the ownership fight is decided.",
    caution: "Urgency, balance of convenience, and irreparable harm still need to be shown."
  },
  indemnity: {
    simpleExplanation: "An indemnity is a promise that one party will cover a specific loss or liability if it arises.",
    whenItMatters: "It matters in contracts where risk needs to be allocated clearly between the parties.",
    plainLanguageExample: "A vendor may indemnify a buyer against losses caused by a breach of data-protection obligations.",
    caution: "The exact wording controls scope, survival, carve-outs, and enforcement."
  },
  "writ petition": {
    simpleExplanation: "A writ petition is a request to a constitutional court for urgent relief when legal rights are affected, often by state action.",
    whenItMatters: "It matters when ordinary procedures are too slow or inadequate to address a rights-based grievance.",
    plainLanguageExample: "A party may move a High Court through a writ petition to challenge arbitrary state action.",
    caution: "Courts still test maintainability, urgency, and alternative remedies."
  },
  arbitration: {
    simpleExplanation: "Arbitration is a private dispute-resolution process where parties agree to let an arbitrator decide the dispute instead of a regular court.",
    whenItMatters: "It matters in commercial contracts with arbitration clauses and cross-border business relationships.",
    plainLanguageExample: "Two companies may take a pricing dispute to arbitration because their contract requires it.",
    caution: "Arbitrability, clause wording, and seat-selection still matter a great deal."
  }
};

export async function getAiOverview(): Promise<AiOverviewResponse> {
  const modelAvailable = await isOllamaModelAvailable();

  return {
    model: {
      ...aiModel,
      status: modelAvailable ? "configured" : "demo",
      note: modelAvailable
        ? `Connected to local Ollama model ${env.OLLAMA_MODEL} at ${env.OLLAMA_BASE_URL}.`
        : `Local Ollama was not reachable with model ${env.OLLAMA_MODEL}. Falling back to deterministic prototype responses.`
    },
    capabilities: [
      "Case-law suggestion prototypes",
      "Legal section suggestion prototypes",
      "Judgment summarization",
      "Legal-term explanation in plain language",
      "Non-sensitive discussion insights",
      "Post drafting and legal notice drafting"
    ],
    recommendedWorkflows: [
      "Start with matter research, then review case-law and section suggestions together.",
      "Summarize long judgments before sending them into collaboration threads.",
      "Use the content assistant for social visibility and the notice assistant for formal drafting."
    ]
  };
}

export async function suggestCaseLaw(payload: MatterResearchRequest): Promise<CaseLawSuggestionResponse> {
  const normalizedQuery = payload.query.trim().toLowerCase();
  const generated = await generateCaseLawResponse(payload);

  if (generated) {
    return generated;
  }

  const suggestions = caseLawLibrary
    .filter((entry) => {
      if (payload.practiceArea && entry.practiceArea !== payload.practiceArea) {
        return false;
      }

      const haystack = [entry.title, entry.court, entry.keyHolding, entry.relevanceReason, ...entry.tags]
        .join(" ")
        .toLowerCase();

      if (!normalizedQuery) {
        return true;
      }

      return haystack.includes(normalizedQuery) || entry.tags.some((tag) => normalizedQuery.includes(tag.toLowerCase()));
    })
    .slice(0, 4);

  return {
    query: payload.query,
    suggestions: suggestions.length > 0 ? suggestions : fallbackCaseLaw(payload.practiceArea),
    caution:
      "These are AI-curated starting points for research direction, not a substitute for full reading, citation verification, or current-law checking."
  };
}

export async function suggestLegalSections(payload: MatterResearchRequest): Promise<LegalSectionSuggestionResponse> {
  const normalizedQuery = payload.query.trim().toLowerCase();
  const generated = await generateSectionResponse(payload);

  if (generated) {
    return generated;
  }

  const suggestions = sectionLibrary
    .filter((entry) => {
      if (payload.practiceArea && !entry.practiceAreas.includes(payload.practiceArea)) {
        return false;
      }

      if (!normalizedQuery) {
        return true;
      }

      return entry.keywords.some((keyword) => normalizedQuery.includes(keyword.toLowerCase()));
    })
    .slice(0, 5)
    .map(({ practiceAreas, keywords, ...suggestion }) => suggestion);

  return {
    query: payload.query,
    suggestions: suggestions.length > 0 ? suggestions : sectionLibrary.slice(0, 3).map(stripSectionMeta),
    caution:
      "These are structured issue-spotting suggestions only. Section numbering, amendments, maintainability, and forum strategy must still be checked."
  };
}

export async function summarizeJudgment(payload: JudgmentSummaryRequest): Promise<JudgmentSummaryResponse> {
  const text = payload.text.trim().replace(/\s+/g, " ");
  const sentences = splitSentences(text);
  const fallbackSummary = sentences.slice(0, 2).join(" ") || "No summary could be generated from the supplied text.";
  const issues = detectIssues(text);
  const ollamaSummary = await generateWithOllama(
    "You are a precise Indian legal research assistant. Produce concise practical summaries. Do not invent case names or holdings.",
    [
      `Title: ${payload.title.trim()}`,
      "Task: Summarize the judgment extract in 80 to 120 words.",
      "Focus on the real procedural posture, legal issue, and practical outcome.",
      "",
      text
    ].join("\n"),
    { numPredict: ollamaBudgets.standard }
  );

  return {
    title: payload.title.trim(),
    summary: ollamaSummary || fallbackSummary,
    issues,
    practicalTakeaways: [
      "Map the ratio separately from factual narrative before relying on the judgment.",
      "Check whether the judgment changes immediate drafting, filing, or argument strategy.",
      "Pair the summary with current procedural posture and forum-specific limits."
    ],
    riskNotes: [
      "Prototype summarization may miss nuance in exceptions, carve-outs, or later distinguishing cases.",
      "Always verify the actual holding and quoted language against the full judgment."
    ]
  };
}

export async function explainLegalTerm(
  payload: LegalTermExplanationRequest
): Promise<LegalTermExplanationResponse> {
  const normalizedTerm = payload.term.trim().toLowerCase();
  const known = legalTermDictionary[normalizedTerm];

  if (known) {
    const ollamaResponse = await generateWithOllama(
      "You explain legal concepts to non-lawyers in plain English. Stay concise, practical, and avoid legalese.",
      [
        `Legal term: ${payload.term.trim()}`,
        payload.context ? `Context: ${payload.context}` : "",
        "Respond in four labelled lines:",
        "EXPLANATION: ...",
        "WHEN: ...",
        "EXAMPLE: ...",
        "CAUTION: ..."
      ]
        .filter(Boolean)
        .join("\n"),
      { numPredict: ollamaBudgets.fast }
    );
    const parsed = ollamaResponse ? parseLabelledSections(ollamaResponse) : null;

    return {
      term: payload.term.trim(),
      simpleExplanation: parsed?.EXPLANATION || known.simpleExplanation,
      whenItMatters: parsed?.WHEN || known.whenItMatters,
      plainLanguageExample: parsed?.EXAMPLE || known.plainLanguageExample,
      caution: parsed?.CAUTION || known.caution
    };
  }

  const fallback: LegalTermExplanationResponse = {
    term: payload.term.trim(),
    simpleExplanation:
      "This term usually describes a formal legal concept that controls rights, procedure, or risk allocation in a dispute or transaction.",
    whenItMatters:
      payload.context?.trim() || "It matters when the term affects strategy, timing, or the legal consequences of a document or proceeding.",
    plainLanguageExample:
      "A lawyer would explain how this term changes what a client can do next, what evidence matters, and what risks follow from delay.",
    caution: "Meaning often shifts with statute, contract language, and procedural context."
  };
  const ollamaResponse = await generateWithOllama(
    "You explain legal concepts to non-lawyers in plain English. Stay concise, practical, and avoid legalese.",
    [
      `Legal term: ${payload.term.trim()}`,
      payload.context ? `Context: ${payload.context}` : "",
      "Respond in four labelled lines:",
      "EXPLANATION: ...",
      "WHEN: ...",
      "EXAMPLE: ...",
      "CAUTION: ..."
    ]
      .filter(Boolean)
      .join("\n"),
    { numPredict: ollamaBudgets.fast }
  );
  const parsed = ollamaResponse ? parseLabelledSections(ollamaResponse) : null;

  return {
    term: fallback.term,
    simpleExplanation: parsed?.EXPLANATION || fallback.simpleExplanation,
    whenItMatters: parsed?.WHEN || fallback.whenItMatters,
    plainLanguageExample: parsed?.EXAMPLE || fallback.plainLanguageExample,
    caution: parsed?.CAUTION || fallback.caution
  };
}

export function generateDiscussionInsights(): DiscussionInsightResponse {
  const dashboard = listCommunicationsDashboard();
  const trends = listTrendTopics();

  const insights: DiscussionInsight[] = [
    {
      id: "insight_1",
      title: "Urgency and chronology are recurring across active matters",
      insight:
        "Multiple conversations and group notes emphasize chronology-first intake before legal advice, especially in criminal and urgent consultation flows.",
      source: "conversation + group analysis",
      confidenceLabel: "high",
      recommendedAction: "Promote chronology checklists into intake forms, templates, and first-response messages."
    },
    {
      id: "insight_2",
      title: "Short educational content aligns with live demand signals",
      insight:
        `Trending feed topics such as ${trends
          .slice(0, 3)
          .map((trend) => `#${trend.hashtag}`)
          .join(", ")} overlap with the problems repeatedly raised in communication threads.`,
      source: "social trends + messaging",
      confidenceLabel: "medium",
      recommendedAction: "Convert the strongest repeated intake questions into short posts or reels before they become one-off replies."
    },
    {
      id: "insight_3",
      title: "Referral and group activity indicate practice-cluster value",
      insight:
        `There are ${dashboard.referrals.length} active referral records and ${dashboard.groups.length} collaboration groups, suggesting lawyers need lightweight, practice-based handoff infrastructure.`,
      source: "referrals + collaboration groups",
      confidenceLabel: "medium",
      recommendedAction: "Standardize referral briefs and shared-file checklists by practice area."
    }
  ];

  return {
    generatedAt: new Date().toISOString(),
    insights
  };
}

export async function chatWithAi(payload: AiChatRequest): Promise<AiChatResponse> {
  const conversation = payload.messages
    .slice(-8)
    .map((message) => {
      const speaker = message.role === "assistant" ? "Assistant" : "Client";
      return `${speaker}: ${message.content.trim()}`;
    })
    .join("\n");

  const prompt = [conversation, "Assistant:"].filter(Boolean).join("\n");
  const reply =
    (await generateWithOllama(
      personaInstructions[payload.persona],
      [
        "You are the chosen persona for this conversation. Keep answers clear, practical, and anchored to the user story.",
        prompt
      ]
        .filter(Boolean)
        .join("\n"),
      { numPredict: ollamaBudgets.fast }
    )) || "The AI is taking longer than expected. Please retry once the connection is ready.";

  return {
    reply
  };
}

export async function summarizeText(payload: AiSummaryRequest): Promise<AiSummaryResponse> {
  const lengthGuidance =
    payload.length === "short"
      ? "Produce a two-sentence summary."
      : payload.length === "medium"
        ? "Summarize in 3–4 sentences."
        : "Give a concise paragraph and highlight practical next steps.";

  const fallbackSummary = payload.text
    .trim()
    .split(/(?<=[.!?])\s+/)
    .slice(0, payload.length === "short" ? 2 : payload.length === "medium" ? 3 : 4)
    .join(" ")
    .trim();

  const response =
    (await generateWithOllama(
      "You condense legal intake notes for clients and lawyers. Keep the tone grounded and practical.",
      [
        `Context: ${payload.context ?? "Client intake narrative"}`,
        lengthGuidance,
        "Text:",
        payload.text,
        "Summary:"
      ].join("\n"),
      { numPredict: ollamaBudgets.standard }
    )) || fallbackSummary || "No summary could be generated.";

  const keyPoints = response
    .split(/(?<=[.!?])\s+/)
    .map((sentence) => sentence.trim())
    .filter(Boolean)
    .slice(0, 3);

  return {
    summary: response,
    keyPoints,
    tone: payload.length
  };
}

export async function matchLawyersForCase(payload: AiLawyerMatchRequest): Promise<AiLawyerMatchResponse> {
  const filters = {
    query: payload.caseSummary,
    practiceArea: payload.practiceArea,
    city: payload.city
  };
  const matches = listProfileSummaries(filters).slice(0, 3);

  const reason = (profile: LawyerProfileSummary) => {
    const parts = [];
    if (payload.practiceArea && profile.practiceAreas.includes(payload.practiceArea)) {
      parts.push(`${profile.practiceAreas.join(", ")} specialization`);
    }
    if (payload.city && profile.city.toLowerCase() === payload.city.toLowerCase()) {
      parts.push(`Local to ${profile.city}`);
    }
    parts.push(`${profile.experienceYears}+ years of experience`);
    parts.push(profile.headline);
    return parts.join(" • ");
  };

  const fallbackNarrative = matches.length
    ? `Based on the case summary the lawyers above match the expressed needs. Update the intake notes before booking.`
    : "No lawyers match that exact query yet. Try other cities or practice areas so we can route you to someone available.";

  const narrativePrompt = matches.length
    ? [
        "You are a structured referral assistant.",
        `Case context: ${payload.caseSummary}`,
        payload.goals ? `Goals: ${payload.goals}` : "",
        payload.urgency ? `Urgency: ${payload.urgency}` : "",
        "Recommended lawyers:",
        ...matches.map(
          (lawyer) =>
            `- ${lawyer.fullName} (${lawyer.practiceAreas.join(", ")}) in ${lawyer.city} — ${lawyer.headline}. Experience: ${lawyer.experienceYears} years.`
        ),
        "Explain why each lawyer aligns with the case, mention logistical fit, and add one immediate next step so the client knows what to ask."
      ]
        .filter(Boolean)
        .join("\n")
    : "";

  const generatedNarrative =
    matches.length > 0
      ? await generateWithOllama(
        "You match cases to lawyers objectively, referencing only the provided data.",
        narrativePrompt,
        { numPredict: ollamaBudgets.standard }
      )
      : null;

  return {
    narrative: generatedNarrative || fallbackNarrative,
    lawyers: matches.map((profile) => ({
      profile,
      reason: reason(profile)
    }))
  };
}

export async function draftContentPost(
  payload: AiPostGenerationRequest
): Promise<AiPostGenerationResponse | undefined> {
  const fallback = generateAiPostDraft(payload);

  if (!fallback) {
    return undefined;
  }

  const ollamaResponse = await generateWithOllama(
    "You are a lawyer-brand content assistant. Produce concise, specific legal content without hype or vague claims.",
    [
      `Author handle: ${payload.authorHandle}`,
      `Topic: ${payload.topic}`,
      `Audience: ${payload.audience}`,
      `Tone: ${payload.tone}`,
      `Format: ${payload.format}`,
      "Respond in three labelled blocks:",
      "HEADLINE: ...",
      "BODY: ...",
      "HASHTAGS: #tag #tag"
    ].join("\n"),
    { numPredict: ollamaBudgets.deep }
  );

  if (!ollamaResponse) {
    return fallback;
  }

  const parsed = parseLabelledSections(ollamaResponse);
  const parsedHashtags = (parsed?.HASHTAGS || "")
    .split(/\s+/)
    .map((tag) => tag.replace(/^#/, "").trim())
    .filter(Boolean);

  return {
    ...fallback,
    headline: parsed?.HEADLINE || fallback.headline,
    draftBody: parsed?.BODY || fallback.draftBody,
    hashtags: parsedHashtags.length > 0 ? parsedHashtags : fallback.hashtags
  };
}

export async function draftLegalNotice(
  payload: LegalNoticeDraftRequest
): Promise<LegalNoticeDraftResponse | undefined> {
  const author = findProfileByHandle(payload.authorHandle);

  if (!author) {
    return undefined;
  }

  const deadlineDays = payload.deadlineDays ?? 7;
  const demandLines = payload.demands.map((demand) => `- ${demand.trim()}`).join("\n");
  const toneLead =
    payload.tone === "urgent"
      ? "This notice addresses an urgent legal issue that requires immediate attention."
      : payload.tone === "firm"
        ? "This notice is issued to formally record the client position and required corrective action."
        : "This notice is issued in a measured manner to invite prompt compliance and avoid further escalation.";

  const fallback: LegalNoticeDraftResponse = {
    subject: `${payload.noticeType.trim()} notice to ${payload.recipientName.trim()}`,
    draftBody: [
      `From: ${author.fullName}, ${author.headline}`,
      `To: ${payload.recipientName.trim()}`,
      "",
      `Subject: ${payload.noticeType.trim()} notice`,
      "",
      toneLead,
      "",
      `Matter summary: ${payload.matterSummary.trim()}`,
      "",
      "Demands / required action:",
      demandLines || "- Specify the required corrective action.",
      "",
      `You are called upon to respond within ${deadlineDays} day(s) of receipt of this notice, failing which the client reserves all rights and remedies available in law.`,
      "",
      "This draft should be reviewed for facts, exhibits, jurisdiction, and statutory references before issue."
    ].join("\n"),
    checklist: [
      "Verify names, addresses, dates, and factual chronology.",
      "Add jurisdiction-specific statutory references and contractual clauses.",
      "Attach key documents, correspondence, or proof of demand.",
      "Review tone and escalation posture before final issue."
    ],
    recommendedAttachments: [
      "Key agreement or underlying document",
      "Chronology of events",
      "Proof of payment / communication trail",
      "Prior notices or responses"
    ],
    caution:
      "This is an AI-assisted drafting prototype. A lawyer should validate facts, legal basis, jurisdiction, and service mechanics before sending."
  };
  const ollamaResponse = await generateWithOllama(
    "You draft formal but practical Indian legal notices. Keep the drafting structured and avoid invented statutes.",
    [
      `Author: ${author.fullName}, ${author.headline}`,
      `Recipient: ${payload.recipientName.trim()}`,
      `Notice type: ${payload.noticeType.trim()}`,
      `Tone: ${payload.tone}`,
      `Deadline days: ${deadlineDays}`,
      `Matter summary: ${payload.matterSummary.trim()}`,
      "Demands:",
      ...payload.demands.map((demand) => `- ${demand.trim()}`),
      "",
      "Return only the draft notice body."
    ].join("\n"),
    { numPredict: ollamaBudgets.deep }
  );

  return {
    ...fallback,
    draftBody: ollamaResponse || fallback.draftBody
  };
}

interface GeneratedCaseLawSuggestion {
  title: string;
  court: string;
  year?: number | string;
  practiceArea?: PracticeArea;
  keyHolding: string;
  relevanceReason: string;
  tags?: string[];
}

interface GeneratedCaseLawResponse {
  suggestions: GeneratedCaseLawSuggestion[];
  caution?: string;
}

interface GeneratedSectionSuggestion {
  statute: string;
  section: string;
  title: string;
  whyRelevant: string;
  caution?: string;
}

interface GeneratedSectionResponse {
  suggestions: GeneratedSectionSuggestion[];
  caution?: string;
}

async function generateCaseLawResponse(payload: MatterResearchRequest): Promise<CaseLawSuggestionResponse | null> {
  const prompt = [
    "You are a precise Indian legal research assistant who distills precedent and highlights why it matters.",
    `Matter summary: ${payload.query.trim() || "General intake"} `,
    `Practice area: ${payload.practiceArea ?? "General practice"} `,
    "Return only a JSON object with keys 'suggestions' (array) and optional 'caution'.",
    "Each suggestion must include 'title', 'court', 'year', 'practiceArea', 'keyHolding', 'relevanceReason', and 'tags' (array).",
    "Limit to four entries and avoid invented case names."
  ].join("\n");

  const ollamaResponse = await generateWithOllama("Case-law research assistant", prompt, {
    numPredict: ollamaBudgets.standard
  });
  const parsed = safeJsonParse<GeneratedCaseLawResponse>(ollamaResponse);

  if (!parsed?.suggestions?.length) {
    return null;
  }

  const suggestions = parsed.suggestions
    .map((suggestion, index) => ({
      id: `generated_case_${index}`,
      title: suggestion.title?.trim() ?? "",
      court: suggestion.court?.trim() ?? "",
      year: Number.isFinite(Number(suggestion.year)) ? Number(suggestion.year) : new Date().getFullYear(),
      practiceArea: suggestion.practiceArea ?? payload.practiceArea ?? "Civil Litigation",
      keyHolding: suggestion.keyHolding?.trim() ?? "",
      relevanceReason: suggestion.relevanceReason?.trim() ?? "",
      tags: Array.isArray(suggestion.tags) ? suggestion.tags.map((tag) => tag.toString()) : []
    }))
    .filter((suggestion) => suggestion.title && suggestion.court)
    .slice(0, 4);

  if (!suggestions.length) {
    return null;
  }

  return {
    query: payload.query,
    suggestions,
    caution:
      parsed.caution ||
      "Generated research cues should be verified, cited, and connected to the actual record before adoption."
  };
}

async function generateSectionResponse(payload: MatterResearchRequest): Promise<LegalSectionSuggestionResponse | null> {
  const prompt = [
    "You are an issue-spotting research assistant who recommends statutes or provisions that matter.",
    `Matter summary: ${payload.query.trim() || "General intake"} `,
    `Practice area focus: ${payload.practiceArea ?? "General practice"} `,
    "Respond only with JSON containing 'suggestions' (array) and optional 'caution'.",
    "Each suggestion must include 'statute', 'section', 'title', 'whyRelevant', and 'caution'.",
    "Limit to five entries and stay grounded in readable legal language."
  ].join("\n");

  const ollamaResponse = await generateWithOllama("Section suggestion assistant", prompt, {
    numPredict: ollamaBudgets.standard
  });
  const parsed = safeJsonParse<GeneratedSectionResponse>(ollamaResponse);

  if (!parsed?.suggestions?.length) {
    return null;
  }

  const suggestions = parsed.suggestions
    .map((suggestion) => ({
      statute: suggestion.statute?.trim() ?? "",
      section: suggestion.section?.trim() ?? "",
      title: suggestion.title?.trim() ?? "",
      whyRelevant: suggestion.whyRelevant?.trim() ?? "",
      caution:
        suggestion.caution?.trim() ??
        "Cross-check the latest statutory text, amendments, and forum-specific applicability before using this section."
    }))
    .filter((suggestion) => suggestion.statute && suggestion.section)
    .slice(0, 5);

  if (!suggestions.length) {
    return null;
  }

  return {
    query: payload.query,
    suggestions,
    caution:
      parsed.caution ||
      "Generated section cues should be cross-checked for amendments, jurisdiction, and forum before relying on them."
  };
}

function safeJsonParse<T>(input: string | null | undefined): T | null {
  if (!input) {
    return null;
  }

  try {
    return JSON.parse(input) as T;
  } catch {
    return null;
  }
}

function parseLabelledSections(text: string) {
  const result: Record<string, string> = {};
  const matches = text.matchAll(/(^|\n)([A-Z]+):\s*([\s\S]*?)(?=\n[A-Z]+:|$)/g);

  for (const match of matches) {
    result[match[2]] = match[3].trim();
  }

  return Object.keys(result).length > 0 ? result : null;
}

function fallbackCaseLaw(practiceArea?: PracticeArea) {
  const filtered = practiceArea ? caseLawLibrary.filter((entry) => entry.practiceArea === practiceArea) : caseLawLibrary;
  return filtered.slice(0, 3);
}

function stripSectionMeta({
  practiceAreas,
  keywords,
  ...suggestion
}: LegalSectionSuggestion & { practiceAreas: PracticeArea[]; keywords: string[] }) {
  return suggestion;
}

function splitSentences(text: string) {
  return text
    .split(/(?<=[.!?])\s+/)
    .map((sentence) => sentence.trim())
    .filter(Boolean);
}

function detectIssues(text: string) {
  const normalized = text.toLowerCase();
  const issues = new Set<string>();

  if (normalized.includes("bail") || normalized.includes("arrest")) {
    issues.add("Liberty, arrest safeguards, and immediate criminal-procedure posture");
  }

  if (normalized.includes("contract") || normalized.includes("agreement")) {
    issues.add("Contract interpretation, obligations, and enforcement posture");
  }

  if (normalized.includes("property") || normalized.includes("inheritance") || normalized.includes("partition")) {
    issues.add("Title, inheritance, or partition-related rights");
  }

  if (normalized.includes("custody") || normalized.includes("matrimonial") || normalized.includes("divorce")) {
    issues.add("Family-law relief, settlement posture, and court-facing documentation");
  }

  if (normalized.includes("arbitration") || normalized.includes("award")) {
    issues.add("Arbitrability, tribunal process, or award-stage review");
  }

  if (issues.size === 0) {
    issues.add("Forum, relief, and evidentiary posture need to be separated before legal reliance.");
  }

  return Array.from(issues);
}
