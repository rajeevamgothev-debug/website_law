"use client";

import Link from "next/link";
import { useEffect, useState, type FormEvent } from "react";

import type {
  CallMode,
  CallRoom,
  CommunicationEvent,
  CommunicationsDashboardResponse,
  ConversationDetail,
  ConversationSummary,
  SharedFileKind
} from "@lexevo/contracts";

import { apiBaseUrl } from "./api-base-url";

interface AttachmentDraft {
  title: string;
  url: string;
  fileKind: SharedFileKind;
}

const defaultAttachment: AttachmentDraft = {
  title: "",
  url: "",
  fileKind: "pdf"
};

export function MessageCenter() {
  const [conversations, setConversations] = useState<ConversationSummary[]>([]);
  const [calls, setCalls] = useState<CallRoom[]>([]);
  const [selectedConversationId, setSelectedConversationId] = useState("");
  const [conversation, setConversation] = useState<ConversationDetail | null>(null);
  const [messageBody, setMessageBody] = useState("");
  const [attachment, setAttachment] = useState<AttachmentDraft>(defaultAttachment);
  const [callTitle, setCallTitle] = useState("Phase 4 consultation room");
  const [callMode, setCallMode] = useState<CallMode>("video");
  const [callAgenda, setCallAgenda] = useState("Review facts, documents, and the immediate next action.");
  const [callTime, setCallTime] = useState(nextHourLocalValue());
  const [activity, setActivity] = useState<CommunicationEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [creatingCall, setCreatingCall] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [noticeMessage, setNoticeMessage] = useState("");

  useEffect(() => {
    void loadDashboard();
  }, []);

  useEffect(() => {
    if (!selectedConversationId) {
      return;
    }

    void loadConversation(selectedConversationId);
  }, [selectedConversationId]);

  useEffect(() => {
    const source = new EventSource(`${apiBaseUrl}/api/communications/stream`);

    source.onmessage = (event) => {
      const payload = JSON.parse(event.data) as CommunicationEvent | { type: string; createdAt: string };

      if (payload.type === "ready") {
        return;
      }

      const communicationEvent = payload as CommunicationEvent;
      setActivity((current) => [communicationEvent, ...current].slice(0, 8));
      void loadDashboard(false);

      if (selectedConversationId) {
        void loadConversation(selectedConversationId, false);
      }
    };

    source.onerror = () => {
      source.close();
    };

    return () => {
      source.close();
    };
  }, [selectedConversationId]);

  async function loadDashboard(showLoading = true) {
    if (showLoading) {
      setLoading(true);
    }

    try {
      const response = await fetch(`${apiBaseUrl}/api/communications/dashboard`);

      if (!response.ok) {
        throw new Error("Dashboard request failed.");
      }

      const payload = (await response.json()) as CommunicationsDashboardResponse;
      setConversations(payload.conversations);
      setCalls(payload.calls);
      setErrorMessage("");

      if (!selectedConversationId && payload.conversations[0]) {
        setSelectedConversationId(payload.conversations[0].id);
      }
    } catch {
      setErrorMessage("Communication dashboard is unavailable. Confirm the API is running on port 4000.");
    } finally {
      if (showLoading) {
        setLoading(false);
      }
    }
  }

  async function loadConversation(conversationId: string, clearNotice = true) {
    try {
      const response = await fetch(`${apiBaseUrl}/api/communications/conversations/${conversationId}`);

      if (!response.ok) {
        throw new Error("Conversation request failed.");
      }

      const payload = (await response.json()) as ConversationDetail;
      setConversation(payload);

      if (clearNotice) {
        setNoticeMessage("");
      }
    } catch {
      setErrorMessage("The selected conversation could not be loaded.");
      setConversation(null);
    }
  }

  async function handleSendMessage(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!conversation) {
      return;
    }

    setSending(true);
    setErrorMessage("");

    try {
      const response = await fetch(`${apiBaseUrl}/api/communications/conversations/${conversation.id}/messages`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          authorName: "Lexevo Viewer",
          authorRole: conversation.kind === "lawyer-lawyer" ? "Lawyer" : "Client",
          body: messageBody,
          attachment: attachment.title && attachment.url ? attachment : undefined
        })
      });

      if (!response.ok) {
        throw new Error("Send message failed.");
      }

      const payload = (await response.json()) as ConversationDetail;
      setConversation(payload);
      setMessageBody("");
      setAttachment(defaultAttachment);
      setNoticeMessage("Message sent.");
      setConversations((current) =>
        current.map((entry) =>
          entry.id === payload.id
            ? {
                id: payload.id,
                kind: payload.kind,
                counterpartHandle: payload.counterpartHandle,
                counterpartName: payload.counterpartName,
                counterpartHeadline: payload.counterpartHeadline,
                city: payload.city,
                unreadCount: payload.unreadCount,
                lastMessagePreview: payload.lastMessagePreview,
                updatedAt: payload.updatedAt,
                callReady: payload.callReady
              }
            : entry
        )
      );
    } catch {
      setErrorMessage("Message delivery failed.");
    } finally {
      setSending(false);
    }
  }

  async function handleCreateCall(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setCreatingCall(true);
    setErrorMessage("");

    try {
      const participants = conversation
        ? ["Lexevo Viewer", conversation.counterpartName]
        : ["Lexevo Viewer"];

      const response = await fetch(`${apiBaseUrl}/api/communications/calls`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          title: callTitle,
          mode: callMode,
          hostName: participants[participants.length - 1],
          participants,
          agenda: callAgenda,
          scheduledFor: new Date(callTime).toISOString()
        })
      });

      if (!response.ok) {
        throw new Error("Create call failed.");
      }

      const payload = (await response.json()) as CallRoom;
      setCalls((current) => [payload, ...current]);
      setNoticeMessage(`Call room created with join code ${payload.joinCode}.`);
    } catch {
      setErrorMessage("Call room creation failed.");
    } finally {
      setCreatingCall(false);
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-ink px-6 py-8 text-sand sm:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="panel p-8">
            <p className="text-sm text-mist/75">Loading communication center...</p>
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
            <p className="eyebrow">Phase 4 communication</p>
            <h1 className="mt-4 max-w-4xl font-display text-6xl leading-none text-sand sm:text-7xl">
              Messaging, calls, and live activity for active legal work.
            </h1>
            <p className="mt-6 max-w-3xl text-lg leading-8 text-mist/80">
              Phase 4 turns the platform from profile and discovery surfaces into a working communication layer with
              live conversations, call rooms, and shared context.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/groups" className="button-secondary">
                Open groups
              </Link>
              <Link href="/referrals" className="button-secondary">
                Open referrals
              </Link>
              <Link href="/network" className="button-secondary">
                Back to social feed
              </Link>
            </div>
          </div>

          <aside className="panel p-6">
            <p className="text-xs uppercase tracking-[0.28em] text-bronze">Live collaboration signals</p>
            <div className="mt-5 grid gap-4 sm:grid-cols-3">
              <article className="metric-card">
                <p className="metric-value">{conversations.length}</p>
                <p className="metric-label">Active threads</p>
              </article>
              <article className="metric-card">
                <p className="metric-value">{calls.length}</p>
                <p className="metric-label">Call rooms</p>
              </article>
              <article className="metric-card">
                <p className="metric-value">{activity.length}</p>
                <p className="metric-label">Live events</p>
              </article>
            </div>
          </aside>
        </section>

        {errorMessage ? <p className="mt-4 text-sm text-rose-300">{errorMessage}</p> : null}
        {noticeMessage ? <p className="mt-4 text-sm text-emerald-300">{noticeMessage}</p> : null}

        <section className="mt-10 grid gap-6 lg:grid-cols-[0.38fr_0.62fr]">
          <aside className="panel p-6">
            <p className="text-xs uppercase tracking-[0.28em] text-bronze">Inbox</p>
            <div className="mt-5 space-y-4">
              {conversations.map((entry) => (
                <button
                  key={entry.id}
                  type="button"
                  className={`w-full rounded-[1.75rem] border p-4 text-left transition ${
                    selectedConversationId === entry.id
                      ? "border-bronze/50 bg-bronze/10"
                      : "border-white/10 bg-white/5 hover:border-bronze/35"
                  }`}
                  onClick={() => setSelectedConversationId(entry.id)}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-display text-3xl text-sand">{entry.counterpartName}</p>
                      <p className="mt-2 text-xs uppercase tracking-[0.22em] text-bronze">
                        {entry.city} | {entry.kind}
                      </p>
                    </div>
                    {entry.unreadCount > 0 ? <span className="tag">{entry.unreadCount} new</span> : null}
                  </div>
                  <p className="mt-3 text-sm leading-7 text-mist/80">{entry.counterpartHeadline}</p>
                  <p className="mt-4 text-sm leading-7 text-sand/85">{entry.lastMessagePreview}</p>
                </button>
              ))}
            </div>
          </aside>

          <div className="space-y-6">
            <section className="panel p-6">
              {conversation ? (
                <>
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <p className="text-xs uppercase tracking-[0.28em] text-bronze">Selected conversation</p>
                      <h2 className="mt-3 font-display text-5xl text-sand">{conversation.counterpartName}</h2>
                      <p className="mt-3 max-w-3xl text-sm leading-7 text-mist/80">{conversation.counterpartHeadline}</p>
                    </div>
                    <div className="flex flex-wrap gap-3">
                      {conversation.counterpartHandle ? (
                        <Link href={`/lawyers/${conversation.counterpartHandle}`} className="button-secondary">
                          Open profile
                        </Link>
                      ) : null}
                      {conversation.callReady ? <span className="tag">Call ready</span> : null}
                    </div>
                  </div>

                  <div className="mt-6 max-h-[24rem] space-y-4 overflow-y-auto pr-1">
                    {conversation.messages.map((message) => (
                      <article key={message.id} className="rounded-[1.5rem] border border-white/10 bg-white/5 p-4">
                        <div className="flex items-center justify-between gap-3">
                          <p className="text-sm uppercase tracking-[0.2em] text-bronze">
                            {message.authorName} | {message.authorRole}
                          </p>
                          <p className="text-xs uppercase tracking-[0.18em] text-mist/60">
                            {formatDateTime(message.createdAt)}
                          </p>
                        </div>
                        <p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-sand/90">{message.body}</p>
                        {message.attachment ? (
                          <a
                            href={message.attachment.url}
                            target="_blank"
                            rel="noreferrer"
                            className="mt-4 inline-flex rounded-full border border-bronze/25 bg-bronze/10 px-4 py-2 text-xs uppercase tracking-[0.18em] text-bronze"
                          >
                            {message.attachment.title} | {message.attachment.fileKind}
                          </a>
                        ) : null}
                      </article>
                    ))}
                  </div>

                  <form className="mt-6" onSubmit={handleSendMessage}>
                    <label className="field">
                      <span>Message</span>
                      <textarea
                        rows={4}
                        value={messageBody}
                        onChange={(event) => setMessageBody(event.target.value)}
                        placeholder="Write a response, send intake guidance, or share a working note."
                        required
                      />
                    </label>
                    <div className="mt-4 grid gap-4 md:grid-cols-3">
                      <label className="field">
                        <span>Attachment title</span>
                        <input
                          value={attachment.title}
                          onChange={(event) => setAttachment((current) => ({ ...current, title: event.target.value }))}
                          placeholder="Optional file title"
                        />
                      </label>
                      <label className="field">
                        <span>Attachment URL</span>
                        <input
                          value={attachment.url}
                          onChange={(event) => setAttachment((current) => ({ ...current, url: event.target.value }))}
                          placeholder="https://example.com/file.pdf"
                        />
                      </label>
                      <label className="field">
                        <span>File type</span>
                        <select
                          value={attachment.fileKind}
                          onChange={(event) =>
                            setAttachment((current) => ({
                              ...current,
                              fileKind: event.target.value as SharedFileKind
                            }))
                          }
                        >
                          <option value="pdf">PDF</option>
                          <option value="doc">DOC</option>
                          <option value="image">Image</option>
                          <option value="video">Video</option>
                        </select>
                      </label>
                    </div>
                    <div className="mt-6 flex flex-wrap gap-3">
                      <button className="button-primary" type="submit" disabled={sending}>
                        {sending ? "Sending..." : "Send message"}
                      </button>
                      <button
                        className="button-secondary"
                        type="button"
                        onClick={() => {
                          setMessageBody("");
                          setAttachment(defaultAttachment);
                        }}
                      >
                        Clear draft
                      </button>
                    </div>
                  </form>
                </>
              ) : (
                <p className="text-sm text-mist/75">Select a conversation from the inbox.</p>
              )}
            </section>

            <section className="grid gap-6 lg:grid-cols-[0.54fr_0.46fr]">
              <form className="panel p-6" onSubmit={handleCreateCall}>
                <p className="text-xs uppercase tracking-[0.28em] text-bronze">Call room</p>
                <div className="mt-6 grid gap-4">
                  <label className="field">
                    <span>Room title</span>
                    <input value={callTitle} onChange={(event) => setCallTitle(event.target.value)} required />
                  </label>
                  <label className="field">
                    <span>Mode</span>
                    <select value={callMode} onChange={(event) => setCallMode(event.target.value as CallMode)}>
                      <option value="audio">Audio</option>
                      <option value="video">Video</option>
                    </select>
                  </label>
                  <label className="field">
                    <span>Agenda</span>
                    <textarea rows={3} value={callAgenda} onChange={(event) => setCallAgenda(event.target.value)} required />
                  </label>
                  <label className="field">
                    <span>Schedule time</span>
                    <input type="datetime-local" value={callTime} onChange={(event) => setCallTime(event.target.value)} required />
                  </label>
                </div>
                <button className="button-primary mt-6" type="submit" disabled={creatingCall}>
                  {creatingCall ? "Creating room..." : "Create call room"}
                </button>
              </form>

              <div className="space-y-6">
                <section className="panel p-6">
                  <p className="text-xs uppercase tracking-[0.28em] text-bronze">Call rooms</p>
                  <div className="mt-5 space-y-3">
                    {calls.map((call) => (
                      <article key={call.id} className="rounded-[1.5rem] border border-white/10 bg-white/5 p-4">
                        <p className="font-medium text-sand">{call.title}</p>
                        <p className="mt-2 text-xs uppercase tracking-[0.2em] text-bronze">
                          {call.mode} | {call.status} | {call.joinCode}
                        </p>
                        <p className="mt-3 text-sm leading-7 text-mist/80">{call.agenda}</p>
                        <p className="mt-3 text-xs uppercase tracking-[0.18em] text-mist/60">
                          {formatDateTime(call.scheduledFor)}
                        </p>
                      </article>
                    ))}
                  </div>
                </section>

                <section className="panel p-6">
                  <p className="text-xs uppercase tracking-[0.28em] text-bronze">Live activity</p>
                  <div className="mt-5 space-y-3">
                    {activity.length === 0 ? (
                      <p className="text-sm text-mist/70">Waiting for communication events...</p>
                    ) : (
                      activity.map((event) => (
                        <div key={event.id} className="rounded-[1.5rem] border border-white/10 bg-white/5 p-4">
                          <p className="text-sm leading-7 text-sand/90">{event.message}</p>
                          <p className="mt-2 text-xs uppercase tracking-[0.18em] text-mist/60">{formatDateTime(event.createdAt)}</p>
                        </div>
                      ))
                    )}
                  </div>
                </section>
              </div>
            </section>
          </div>
        </section>
      </div>
    </main>
  );
}

function formatDateTime(value: string) {
  return new Date(value).toLocaleString();
}

function nextHourLocalValue() {
  const next = new Date(Date.now() + 60 * 60 * 1000);
  next.setMinutes(0, 0, 0);
  return next.toISOString().slice(0, 16);
}
