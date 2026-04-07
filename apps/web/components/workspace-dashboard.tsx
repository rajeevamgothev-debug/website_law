"use client";

import Link from "next/link";
import { useEffect, useState, type FormEvent } from "react";

import type {
  PracticeArea,
  WorkspaceCase,
  WorkspaceCasePriority,
  WorkspaceCaseStatus,
  WorkspaceDashboardResponse,
  WorkspaceDocument,
  WorkspaceInvoice
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

const priorities: WorkspaceCasePriority[] = ["low", "medium", "high", "urgent"];
const statuses: WorkspaceCaseStatus[] = [
  "intake",
  "documents-pending",
  "strategy",
  "filing",
  "hearing",
  "closed"
];

export function WorkspaceDashboard() {
  const [dashboard, setDashboard] = useState<WorkspaceDashboardResponse | null>(null);
  const [selectedCaseId, setSelectedCaseId] = useState("");
  const [selectedCase, setSelectedCase] = useState<WorkspaceCase | null>(null);
  const [caseClientId, setCaseClientId] = useState("");
  const [caseLawyerHandle, setCaseLawyerHandle] = useState("adv-isha-reddy");
  const [caseTitle, setCaseTitle] = useState("New retained matter");
  const [casePracticeArea, setCasePracticeArea] = useState<PracticeArea>("Criminal Law");
  const [caseCourt, setCaseCourt] = useState("High Court");
  const [casePriority, setCasePriority] = useState<WorkspaceCasePriority>("high");
  const [caseNextAction, setCaseNextAction] = useState("Collect documents and prepare matter strategy.");
  const [caseHearingAt, setCaseHearingAt] = useState(nextDayLocalValue());
  const [noteBody, setNoteBody] = useState("");
  const [documentTitle, setDocumentTitle] = useState("");
  const [documentUrl, setDocumentUrl] = useState("");
  const [documentCategory, setDocumentCategory] = useState<WorkspaceDocument["category"]>("evidence");
  const [invoiceClientId, setInvoiceClientId] = useState("");
  const [invoiceLawyerHandle, setInvoiceLawyerHandle] = useState("adv-isha-reddy");
  const [invoiceTitle, setInvoiceTitle] = useState("Professional services invoice");
  const [invoiceDescription, setInvoiceDescription] = useState("Professional fee");
  const [invoiceQuantity, setInvoiceQuantity] = useState("1");
  const [invoiceRate, setInvoiceRate] = useState("5000");
  const [invoiceDueAt, setInvoiceDueAt] = useState(nextWeekLocalValue());
  const [busy, setBusy] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [noticeMessage, setNoticeMessage] = useState("");

  useEffect(() => {
    void loadDashboard();
  }, []);

  function syncSelectedCase(nextDashboard: WorkspaceDashboardResponse, preferredCaseId?: string) {
    const nextId = preferredCaseId || selectedCaseId || nextDashboard.cases[0]?.id || "";
    setSelectedCaseId(nextId);
    setSelectedCase(nextDashboard.cases.find((entry) => entry.id === nextId) ?? nextDashboard.cases[0] ?? null);
  }

  async function loadDashboard(preferredCaseId?: string) {
    try {
      const response = await fetch(`${apiBaseUrl}/api/workspace/dashboard`);

      if (!response.ok) {
        throw new Error("Workspace load failed.");
      }

      const payload = (await response.json()) as WorkspaceDashboardResponse;
      setDashboard(payload);
      setCaseClientId((current) => current || payload.clients[0]?.id || "");
      setInvoiceClientId((current) => current || payload.clients[0]?.id || "");
      syncSelectedCase(payload, preferredCaseId);
      setErrorMessage("");
    } catch {
      setErrorMessage("Workspace dashboard is unavailable. Confirm the API is running on port 4000.");
    }
  }

  async function createCase(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy("case");
    setErrorMessage("");

    try {
      const response = await fetch(`${apiBaseUrl}/api/workspace/cases`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clientId: caseClientId,
          lawyerHandle: caseLawyerHandle,
          title: caseTitle,
          practiceArea: casePracticeArea,
          court: caseCourt,
          priority: casePriority,
          nextAction: caseNextAction,
          nextHearingAt: new Date(caseHearingAt).toISOString()
        })
      });

      if (!response.ok) {
        throw new Error("Case create failed.");
      }

      const created = (await response.json()) as WorkspaceCase;
      await loadDashboard(created.id);
      setNoticeMessage(`Case created: ${created.title}.`);
    } catch {
      setErrorMessage("Case creation failed.");
    } finally {
      setBusy("");
    }
  }

  async function updateStatus(status: WorkspaceCaseStatus) {
    if (!selectedCase) {
      return;
    }

    setBusy("status");
    setErrorMessage("");

    try {
      const response = await fetch(`${apiBaseUrl}/api/workspace/cases/${selectedCase.id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status })
      });

      if (!response.ok) {
        throw new Error("Status update failed.");
      }

      await loadDashboard(selectedCase.id);
      setNoticeMessage(`Case moved to ${status}.`);
    } catch {
      setErrorMessage("Case status update failed.");
    } finally {
      setBusy("");
    }
  }

  async function addNote(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!selectedCase) {
      return;
    }

    setBusy("note");
    setErrorMessage("");

    try {
      const response = await fetch(`${apiBaseUrl}/api/workspace/cases/${selectedCase.id}/notes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          authorName: "Lexevo Workspace",
          body: noteBody
        })
      });

      if (!response.ok) {
        throw new Error("Note failed.");
      }

      await loadDashboard(selectedCase.id);
      setNoteBody("");
      setNoticeMessage("Case note added.");
    } catch {
      setErrorMessage("Case note creation failed.");
    } finally {
      setBusy("");
    }
  }

  async function addDocument(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!selectedCase) {
      return;
    }

    setBusy("document");
    setErrorMessage("");

    try {
      const response = await fetch(`${apiBaseUrl}/api/workspace/cases/${selectedCase.id}/documents`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clientId: selectedCase.clientId,
          title: documentTitle,
          category: documentCategory,
          url: documentUrl,
          uploadedBy: "Lexevo Workspace"
        })
      });

      if (!response.ok) {
        throw new Error("Document failed.");
      }

      await loadDashboard(selectedCase.id);
      setDocumentTitle("");
      setDocumentUrl("");
      setNoticeMessage("Document added to storage.");
    } catch {
      setErrorMessage("Document upload failed.");
    } finally {
      setBusy("");
    }
  }

  async function createInvoice(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy("invoice");
    setErrorMessage("");

    try {
      const response = await fetch(`${apiBaseUrl}/api/workspace/invoices`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clientId: invoiceClientId,
          lawyerHandle: invoiceLawyerHandle,
          title: invoiceTitle,
          dueAt: new Date(invoiceDueAt).toISOString(),
          lineItems: [
            {
              description: invoiceDescription,
              quantity: Number(invoiceQuantity),
              rateInr: Number(invoiceRate)
            }
          ]
        })
      });

      if (!response.ok) {
        throw new Error("Invoice failed.");
      }

      const invoice = (await response.json()) as WorkspaceInvoice;
      await loadDashboard(selectedCaseId);
      setNoticeMessage(`Invoice created: ${invoice.title}.`);
    } catch {
      setErrorMessage("Invoice generation failed.");
    } finally {
      setBusy("");
    }
  }

  if (!dashboard) {
    return (
      <main className="min-h-screen bg-ink px-6 py-8 text-sand sm:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="panel p-8">
            <p className="text-sm text-mist/75">Loading workspace...</p>
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
            <p className="eyebrow">Phase 6 professional tools</p>
            <h1 className="mt-4 max-w-4xl font-display text-6xl leading-none text-sand sm:text-7xl">
              Daily legal workflow now lives inside the platform.
            </h1>
            <p className="mt-6 max-w-3xl text-lg leading-8 text-mist/80">
              Case tracking, documents, notes, invoices, analytics, and direct AI handoff are now part of the local
              workspace layer.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/ai-workbench" className="button-secondary">
                Open AI workbench
              </Link>
              <Link href="/messages" className="button-secondary">
                Open message center
              </Link>
            </div>
          </div>
          <aside className="panel p-6">
            <p className="text-xs uppercase tracking-[0.28em] text-bronze">Analytics</p>
            <div className="mt-5 grid gap-4 sm:grid-cols-3">
              <article className="metric-card">
                <p className="metric-value">{dashboard.analytics.profileViews}</p>
                <p className="metric-label">Profile views</p>
              </article>
              <article className="metric-card">
                <p className="metric-value">{dashboard.analytics.leadsReceived}</p>
                <p className="metric-label">Leads received</p>
              </article>
              <article className="metric-card">
                <p className="metric-value">{dashboard.analytics.conversionRate}%</p>
                <p className="metric-label">Conversion rate</p>
              </article>
              <article className="metric-card">
                <p className="metric-value">{dashboard.analytics.engagementRate}%</p>
                <p className="metric-label">Engagement rate</p>
              </article>
              <article className="metric-card">
                <p className="metric-value">{dashboard.analytics.activeMessages}</p>
                <p className="metric-label">Active messages</p>
              </article>
              <article className="metric-card">
                <p className="metric-value">INR {dashboard.analytics.monthlyRevenueInr}</p>
                <p className="metric-label">Monthly revenue</p>
              </article>
            </div>
          </aside>
        </section>

        {errorMessage ? <p className="mt-4 text-sm text-rose-300">{errorMessage}</p> : null}
        {noticeMessage ? <p className="mt-4 text-sm text-emerald-300">{noticeMessage}</p> : null}

        <section className="mt-10 grid gap-6 lg:grid-cols-[0.36fr_0.64fr]">
          <aside className="space-y-6">
            <section className="panel p-6">
              <p className="text-xs uppercase tracking-[0.28em] text-bronze">Clients</p>
              <div className="mt-5 space-y-3">
                {dashboard.clients.map((client) => (
                  <article key={client.id} className="rounded-[1.5rem] border border-white/10 bg-white/5 p-4">
                    <p className="font-medium text-sand">{client.company ?? client.name}</p>
                    <p className="mt-2 text-xs uppercase tracking-[0.18em] text-bronze">
                      {client.city} | {client.practiceArea}
                    </p>
                    <p className="mt-3 text-sm text-mist/80">{client.contactPhone}</p>
                  </article>
                ))}
              </div>
            </section>

            <form className="panel p-6" onSubmit={createCase}>
              <p className="text-xs uppercase tracking-[0.28em] text-bronze">Create case</p>
              <div className="mt-5 grid gap-4">
                <label className="field">
                  <span>Client</span>
                  <select value={caseClientId} onChange={(event) => setCaseClientId(event.target.value)}>
                    {dashboard.clients.map((client) => (
                      <option key={`case-${client.id}`} value={client.id}>
                        {client.company ?? client.name}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="field">
                  <span>Lawyer handle</span>
                  <input value={caseLawyerHandle} onChange={(event) => setCaseLawyerHandle(event.target.value)} required />
                </label>
                <label className="field">
                  <span>Case title</span>
                  <input value={caseTitle} onChange={(event) => setCaseTitle(event.target.value)} required />
                </label>
                <label className="field">
                  <span>Practice area</span>
                  <select value={casePracticeArea} onChange={(event) => setCasePracticeArea(event.target.value as PracticeArea)}>
                    {practiceAreas.map((area) => (
                      <option key={area} value={area}>
                        {area}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="field">
                  <span>Court / forum</span>
                  <input value={caseCourt} onChange={(event) => setCaseCourt(event.target.value)} required />
                </label>
                <label className="field">
                  <span>Priority</span>
                  <select value={casePriority} onChange={(event) => setCasePriority(event.target.value as WorkspaceCasePriority)}>
                    {priorities.map((priority) => (
                      <option key={priority} value={priority}>
                        {priority}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="field">
                  <span>Next action</span>
                  <textarea rows={3} value={caseNextAction} onChange={(event) => setCaseNextAction(event.target.value)} required />
                </label>
                <label className="field">
                  <span>Next hearing</span>
                  <input type="datetime-local" value={caseHearingAt} onChange={(event) => setCaseHearingAt(event.target.value)} />
                </label>
              </div>
              <button className="button-primary mt-6" type="submit" disabled={busy === "case"}>
                {busy === "case" ? "Creating..." : "Create case"}
              </button>
            </form>
          </aside>

          <div className="space-y-6">
            <section className="panel p-6">
              <div className="flex flex-wrap items-end justify-between gap-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.28em] text-bronze">Active cases</p>
                  <h2 className="mt-3 font-display text-5xl text-sand">Retention workspace</h2>
                </div>
              </div>
              <div className="mt-6 grid gap-4 xl:grid-cols-2">
                {dashboard.cases.map((caseRecord) => (
                  <button
                    key={caseRecord.id}
                    type="button"
                    className={`rounded-[1.75rem] border p-5 text-left transition ${
                      selectedCaseId === caseRecord.id
                        ? "border-bronze/50 bg-bronze/10"
                        : "border-white/10 bg-white/5 hover:border-bronze/35"
                    }`}
                    onClick={() => {
                      setSelectedCaseId(caseRecord.id);
                      setSelectedCase(caseRecord);
                    }}
                  >
                    <p className="font-medium text-sand">{caseRecord.title}</p>
                    <p className="mt-2 text-xs uppercase tracking-[0.18em] text-bronze">
                      {caseRecord.practiceArea} | {caseRecord.status} | {caseRecord.priority}
                    </p>
                    <p className="mt-3 text-sm leading-7 text-mist/80">{caseRecord.nextAction}</p>
                  </button>
                ))}
              </div>
            </section>

            {selectedCase ? (
              <section className="panel p-6">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <p className="text-xs uppercase tracking-[0.28em] text-bronze">Selected case</p>
                    <h3 className="mt-3 font-display text-5xl text-sand">{selectedCase.title}</h3>
                    <p className="mt-3 text-sm leading-7 text-mist/80">{selectedCase.court}</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {statuses.map((status) => (
                      <button
                        key={status}
                        type="button"
                        className={selectedCase.status === status ? "button-primary" : "button-secondary"}
                        onClick={() => void updateStatus(status)}
                        disabled={busy === "status"}
                      >
                        {status}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="mt-6 grid gap-6 xl:grid-cols-[0.5fr_0.5fr]">
                  <div>
                    <p className="text-xs uppercase tracking-[0.24em] text-bronze">Notes</p>
                    <div className="mt-4 space-y-3">
                      {selectedCase.notes.map((note) => (
                        <article key={note.id} className="rounded-[1.5rem] border border-white/10 bg-white/5 p-4">
                          <p className="text-xs uppercase tracking-[0.18em] text-bronze">{note.authorName}</p>
                          <p className="mt-3 text-sm leading-7 text-sand/90">{note.body}</p>
                        </article>
                      ))}
                    </div>
                    <form className="mt-5" onSubmit={addNote}>
                      <label className="field">
                        <span>Add note</span>
                        <textarea rows={3} value={noteBody} onChange={(event) => setNoteBody(event.target.value)} required />
                      </label>
                      <button className="button-primary mt-4" type="submit" disabled={busy === "note"}>
                        {busy === "note" ? "Saving..." : "Add note"}
                      </button>
                    </form>
                  </div>

                  <div>
                    <p className="text-xs uppercase tracking-[0.24em] text-bronze">Documents</p>
                    <div className="mt-4 space-y-3">
                      {selectedCase.documents.map((document) => (
                        <a
                          key={document.id}
                          href={document.url}
                          target="_blank"
                          rel="noreferrer"
                          className="block rounded-[1.5rem] border border-white/10 bg-white/5 p-4"
                        >
                          <p className="font-medium text-sand">{document.title}</p>
                          <p className="mt-2 text-xs uppercase tracking-[0.18em] text-bronze">
                            {document.category} | {document.uploadedBy}
                          </p>
                        </a>
                      ))}
                    </div>
                    <form className="mt-5" onSubmit={addDocument}>
                      <div className="grid gap-4">
                        <label className="field">
                          <span>Document title</span>
                          <input value={documentTitle} onChange={(event) => setDocumentTitle(event.target.value)} required />
                        </label>
                        <label className="field">
                          <span>Document URL</span>
                          <input value={documentUrl} onChange={(event) => setDocumentUrl(event.target.value)} required />
                        </label>
                        <label className="field">
                          <span>Category</span>
                          <select value={documentCategory} onChange={(event) => setDocumentCategory(event.target.value as WorkspaceDocument["category"])}>
                            <option value="evidence">Evidence</option>
                            <option value="agreement">Agreement</option>
                            <option value="court-filing">Court filing</option>
                            <option value="note">Note</option>
                            <option value="invoice">Invoice</option>
                          </select>
                        </label>
                      </div>
                      <button className="button-primary mt-4" type="submit" disabled={busy === "document"}>
                        {busy === "document" ? "Saving..." : "Add document"}
                      </button>
                    </form>
                  </div>
                </div>
              </section>
            ) : null}

            <section className="grid gap-6 xl:grid-cols-[0.48fr_0.52fr]">
              <form className="panel p-6" onSubmit={createInvoice}>
                <p className="text-xs uppercase tracking-[0.28em] text-bronze">Invoice generator</p>
                <div className="mt-5 grid gap-4">
                  <label className="field">
                    <span>Client</span>
                    <select value={invoiceClientId} onChange={(event) => setInvoiceClientId(event.target.value)}>
                      {dashboard.clients.map((client) => (
                        <option key={`invoice-${client.id}`} value={client.id}>
                          {client.company ?? client.name}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="field">
                    <span>Lawyer handle</span>
                    <input value={invoiceLawyerHandle} onChange={(event) => setInvoiceLawyerHandle(event.target.value)} required />
                  </label>
                  <label className="field">
                    <span>Invoice title</span>
                    <input value={invoiceTitle} onChange={(event) => setInvoiceTitle(event.target.value)} required />
                  </label>
                  <label className="field">
                    <span>Line item</span>
                    <input value={invoiceDescription} onChange={(event) => setInvoiceDescription(event.target.value)} required />
                  </label>
                  <div className="grid gap-4 md:grid-cols-2">
                    <label className="field">
                      <span>Quantity</span>
                      <input type="number" min="1" value={invoiceQuantity} onChange={(event) => setInvoiceQuantity(event.target.value)} required />
                    </label>
                    <label className="field">
                      <span>Rate (INR)</span>
                      <input type="number" min="1" value={invoiceRate} onChange={(event) => setInvoiceRate(event.target.value)} required />
                    </label>
                  </div>
                  <label className="field">
                    <span>Due date</span>
                    <input type="datetime-local" value={invoiceDueAt} onChange={(event) => setInvoiceDueAt(event.target.value)} required />
                  </label>
                </div>
                <button className="button-primary mt-6" type="submit" disabled={busy === "invoice"}>
                  {busy === "invoice" ? "Generating..." : "Generate invoice"}
                </button>
              </form>

              <section className="panel p-6">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-xs uppercase tracking-[0.28em] text-bronze">Recent invoices</p>
                  <Link href="/ai-workbench" className="button-secondary">
                    Use local Ollama tools
                  </Link>
                </div>
                <div className="mt-5 space-y-3">
                  {dashboard.invoices.map((invoice) => (
                    <article key={invoice.id} className="rounded-[1.5rem] border border-white/10 bg-white/5 p-4">
                      <p className="font-medium text-sand">{invoice.title}</p>
                      <p className="mt-2 text-xs uppercase tracking-[0.18em] text-bronze">
                        {invoice.clientName} | {invoice.status}
                      </p>
                      <p className="mt-3 text-sm text-mist/80">Subtotal: INR {invoice.subtotalInr}</p>
                      <p className="mt-1 text-sm text-mist/80">Tax: INR {invoice.taxInr}</p>
                      <p className="mt-1 text-sm text-sand/90">Total: INR {invoice.totalInr}</p>
                    </article>
                  ))}
                </div>
              </section>
            </section>
          </div>
        </section>
      </div>
    </main>
  );
}

function nextDayLocalValue() {
  const next = new Date(Date.now() + 24 * 60 * 60 * 1000);
  return next.toISOString().slice(0, 16);
}

function nextWeekLocalValue() {
  const next = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  return next.toISOString().slice(0, 16);
}
