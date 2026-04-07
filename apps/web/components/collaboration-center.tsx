"use client";

import Link from "next/link";
import { useEffect, useState, type FormEvent } from "react";

import type {
  CollaborationGroup,
  CommunicationEvent,
  CommunicationsDashboardResponse,
  LawyerProfileSummary,
  ReferralRequest,
  SharedFileKind
} from "@lexevo/contracts";

import { apiBaseUrl } from "./api-base-url";

interface CollaborationCenterProps {
  focus: "groups" | "referrals";
}

export function CollaborationCenter({ focus }: CollaborationCenterProps) {
  const [groups, setGroups] = useState<CollaborationGroup[]>([]);
  const [referrals, setReferrals] = useState<ReferralRequest[]>([]);
  const [lawyers, setLawyers] = useState<LawyerProfileSummary[]>([]);
  const [selectedGroupId, setSelectedGroupId] = useState("");
  const [selectedGroup, setSelectedGroup] = useState<CollaborationGroup | null>(null);
  const [groupMessage, setGroupMessage] = useState("");
  const [groupName, setGroupName] = useState("Litigation Working Circle");
  const [groupPracticeArea, setGroupPracticeArea] = useState("Civil Litigation");
  const [groupDescription, setGroupDescription] = useState(
    "Practice-based working group for ongoing discussion, referrals, and reusable files."
  );
  const [fileTitle, setFileTitle] = useState("");
  const [fileUrl, setFileUrl] = useState("");
  const [fileKind, setFileKind] = useState<SharedFileKind>("pdf");
  const [referralFrom, setReferralFrom] = useState("adv-isha-reddy");
  const [referralTo, setReferralTo] = useState("naina-kapoor-familylaw");
  const [referralPracticeArea, setReferralPracticeArea] = useState("Family Law");
  const [referralCity, setReferralCity] = useState("Delhi");
  const [referralNote, setReferralNote] = useState(
    "Need practice-area aligned counsel for a structured referral with clear matter context."
  );
  const [activity, setActivity] = useState<CommunicationEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [sharing, setSharing] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [noticeMessage, setNoticeMessage] = useState("");

  useEffect(() => {
    void loadDashboard();
    void loadLawyers();
  }, []);

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
    };

    source.onerror = () => {
      source.close();
    };

    return () => {
      source.close();
    };
  }, []);

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
      setGroups(payload.groups);
      setReferrals(payload.referrals);
      setErrorMessage("");

      const nextSelectedGroupId = selectedGroupId || payload.groups[0]?.id || "";
      setSelectedGroupId(nextSelectedGroupId);
      setSelectedGroup(payload.groups.find((group) => group.id === nextSelectedGroupId) ?? payload.groups[0] ?? null);
    } catch {
      setErrorMessage("Collaboration data is unavailable. Confirm the API is running on port 4000.");
    } finally {
      if (showLoading) {
        setLoading(false);
      }
    }
  }

  async function loadLawyers() {
    try {
      const response = await fetch(`${apiBaseUrl}/api/search/lawyers`);

      if (!response.ok) {
        throw new Error("Lawyer request failed.");
      }

      const payload = (await response.json()) as { results: LawyerProfileSummary[] };
      setLawyers(payload.results);
    } catch {
      setLawyers([]);
    }
  }

  async function handleCreateGroup(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setErrorMessage("");

    try {
      const response = await fetch(`${apiBaseUrl}/api/communications/groups`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          name: groupName,
          practiceArea: groupPracticeArea,
          description: groupDescription
        })
      });

      if (!response.ok) {
        throw new Error("Group create failed.");
      }

      const payload = (await response.json()) as CollaborationGroup;
      setGroups((current) => [payload, ...current]);
      setSelectedGroupId(payload.id);
      setSelectedGroup(payload);
      setNoticeMessage(`Group created: ${payload.name}.`);
    } catch {
      setErrorMessage("Group creation failed.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleSendGroupMessage(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!selectedGroup) {
      return;
    }

    setSubmitting(true);
    setErrorMessage("");

    try {
      const response = await fetch(`${apiBaseUrl}/api/communications/groups/${selectedGroup.id}/messages`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          authorName: "Lexevo Viewer",
          authorRole: "Lawyer",
          body: groupMessage
        })
      });

      if (!response.ok) {
        throw new Error("Group message failed.");
      }

      const payload = (await response.json()) as CollaborationGroup;
      syncUpdatedGroup(payload);
      setGroupMessage("");
      setNoticeMessage("Group discussion updated.");
    } catch {
      setErrorMessage("Group message failed.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleShareFile(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!selectedGroup) {
      return;
    }

    setSharing(true);
    setErrorMessage("");

    try {
      const response = await fetch(`${apiBaseUrl}/api/communications/groups/${selectedGroup.id}/files`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          authorName: "Lexevo Viewer",
          title: fileTitle,
          url: fileUrl,
          fileKind
        })
      });

      if (!response.ok) {
        throw new Error("Share file failed.");
      }

      const payload = (await response.json()) as CollaborationGroup;
      syncUpdatedGroup(payload);
      setFileTitle("");
      setFileUrl("");
      setFileKind("pdf");
      setNoticeMessage("File shared with the group.");
    } catch {
      setErrorMessage("Group file sharing failed.");
    } finally {
      setSharing(false);
    }
  }

  async function handleCreateReferral(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setErrorMessage("");

    try {
      const response = await fetch(`${apiBaseUrl}/api/communications/referrals`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          fromHandle: referralFrom,
          toHandle: referralTo,
          practiceArea: referralPracticeArea,
          city: referralCity,
          note: referralNote
        })
      });

      if (!response.ok) {
        throw new Error("Create referral failed.");
      }

      const payload = (await response.json()) as ReferralRequest;
      setReferrals((current) => [payload, ...current]);
      setNoticeMessage(`Referral sent from ${payload.fromName} to ${payload.toName}.`);
    } catch {
      setErrorMessage("Referral creation failed.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleRespondReferral(referralId: string, status: "accepted" | "declined") {
    setSubmitting(true);
    setErrorMessage("");

    try {
      const response = await fetch(`${apiBaseUrl}/api/communications/referrals/${referralId}/respond`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ status })
      });

      if (!response.ok) {
        throw new Error("Respond referral failed.");
      }

      const payload = (await response.json()) as ReferralRequest;
      setReferrals((current) => current.map((entry) => (entry.id === payload.id ? payload : entry)));
      setNoticeMessage(`Referral ${payload.id} marked ${payload.status}.`);
    } catch {
      setErrorMessage("Referral response failed.");
    } finally {
      setSubmitting(false);
    }
  }

  function syncUpdatedGroup(group: CollaborationGroup) {
    setSelectedGroup(group);
    setGroups((current) => current.map((entry) => (entry.id === group.id ? group : entry)));
  }

  function focusHeading() {
    return focus === "groups"
      ? "Practice groups, discussions, and shared files."
      : "Lawyer-to-lawyer referrals with live status.";
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-ink px-6 py-8 text-sand sm:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="panel p-8">
            <p className="text-sm text-mist/75">Loading collaboration center...</p>
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
            <p className="eyebrow">Phase 4 collaboration</p>
            <h1 className="mt-4 max-w-4xl font-display text-6xl leading-none text-sand sm:text-7xl">
              {focusHeading()}
            </h1>
            <p className="mt-6 max-w-3xl text-lg leading-8 text-mist/80">
              Practice-based collaboration is now part of the local product: group creation, threaded discussion,
              file sharing, and structured referral handoff between lawyers.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/messages" className="button-secondary">
                Open message center
              </Link>
              <Link href="/network" className="button-secondary">
                Back to social feed
              </Link>
            </div>
          </div>

          <aside className="panel p-6">
            <p className="text-xs uppercase tracking-[0.28em] text-bronze">Phase 4 metrics</p>
            <div className="mt-5 grid gap-4 sm:grid-cols-3">
              <article className="metric-card">
                <p className="metric-value">{groups.length}</p>
                <p className="metric-label">Groups</p>
              </article>
              <article className="metric-card">
                <p className="metric-value">{referrals.length}</p>
                <p className="metric-label">Referrals</p>
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

        <section className="mt-10 grid gap-6 lg:grid-cols-[0.42fr_0.58fr]">
          <aside className="space-y-6">
            <section className="panel p-6">
              <p className="text-xs uppercase tracking-[0.28em] text-bronze">Groups</p>
              <div className="mt-5 space-y-3">
                {groups.map((group) => (
                  <button
                    key={group.id}
                    type="button"
                    className={`w-full rounded-[1.5rem] border p-4 text-left transition ${
                      selectedGroupId === group.id
                        ? "border-bronze/50 bg-bronze/10"
                        : "border-white/10 bg-white/5 hover:border-bronze/35"
                    }`}
                    onClick={() => {
                      setSelectedGroupId(group.id);
                      setSelectedGroup(group);
                    }}
                  >
                    <p className="font-display text-3xl text-sand">{group.name}</p>
                    <p className="mt-2 text-xs uppercase tracking-[0.2em] text-bronze">
                      {group.practiceArea} | {group.memberCount} members
                    </p>
                    <p className="mt-3 text-sm leading-7 text-mist/80">{group.description}</p>
                  </button>
                ))}
              </div>
            </section>

            <section className="panel p-6">
              <p className="text-xs uppercase tracking-[0.28em] text-bronze">Live activity</p>
              <div className="mt-5 space-y-3">
                {activity.length === 0 ? (
                  <p className="text-sm text-mist/70">Waiting for collaboration events...</p>
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
          </aside>

          <div className="space-y-6">
            <section className="grid gap-6 xl:grid-cols-2">
              <form className="panel p-6" onSubmit={handleCreateGroup}>
                <p className="text-xs uppercase tracking-[0.28em] text-bronze">Create practice group</p>
                <div className="mt-6 grid gap-4">
                  <label className="field">
                    <span>Group name</span>
                    <input value={groupName} onChange={(event) => setGroupName(event.target.value)} required />
                  </label>
                  <label className="field">
                    <span>Practice area</span>
                    <input value={groupPracticeArea} onChange={(event) => setGroupPracticeArea(event.target.value)} required />
                  </label>
                  <label className="field">
                    <span>Description</span>
                    <textarea rows={4} value={groupDescription} onChange={(event) => setGroupDescription(event.target.value)} required />
                  </label>
                </div>
                <button className="button-primary mt-6" type="submit" disabled={submitting}>
                  {submitting ? "Saving..." : "Create group"}
                </button>
              </form>

              <form className="panel p-6" onSubmit={handleCreateReferral}>
                <p className="text-xs uppercase tracking-[0.28em] text-bronze">Create referral</p>
                <div className="mt-6 grid gap-4">
                  <label className="field">
                    <span>From</span>
                    <select value={referralFrom} onChange={(event) => setReferralFrom(event.target.value)}>
                      {lawyers.map((lawyer) => (
                        <option key={`from-${lawyer.handle}`} value={lawyer.handle}>
                          {lawyer.fullName}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="field">
                    <span>To</span>
                    <select value={referralTo} onChange={(event) => setReferralTo(event.target.value)}>
                      {lawyers.map((lawyer) => (
                        <option key={`to-${lawyer.handle}`} value={lawyer.handle}>
                          {lawyer.fullName}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="field">
                    <span>Practice area</span>
                    <input value={referralPracticeArea} onChange={(event) => setReferralPracticeArea(event.target.value)} required />
                  </label>
                  <label className="field">
                    <span>City</span>
                    <input value={referralCity} onChange={(event) => setReferralCity(event.target.value)} required />
                  </label>
                  <label className="field">
                    <span>Note</span>
                    <textarea rows={4} value={referralNote} onChange={(event) => setReferralNote(event.target.value)} required />
                  </label>
                </div>
                <button className="button-primary mt-6" type="submit" disabled={submitting}>
                  {submitting ? "Sending..." : "Send referral"}
                </button>
              </form>
            </section>

            {selectedGroup ? (
              <section className="panel p-6">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <p className="text-xs uppercase tracking-[0.28em] text-bronze">Selected group</p>
                    <h2 className="mt-3 font-display text-5xl text-sand">{selectedGroup.name}</h2>
                    <p className="mt-3 text-sm leading-7 text-mist/80">{selectedGroup.description}</p>
                  </div>
                  <span className="tag">{selectedGroup.practiceArea}</span>
                </div>

                <div className="mt-6 grid gap-6 xl:grid-cols-[0.58fr_0.42fr]">
                  <div>
                    <p className="text-xs uppercase tracking-[0.24em] text-bronze">Discussion</p>
                    <div className="mt-4 max-h-[20rem] space-y-3 overflow-y-auto pr-1">
                      {selectedGroup.discussions.map((message) => (
                        <article key={message.id} className="rounded-[1.5rem] border border-white/10 bg-white/5 p-4">
                          <p className="text-xs uppercase tracking-[0.18em] text-bronze">
                            {message.authorName} | {message.authorRole}
                          </p>
                          <p className="mt-3 text-sm leading-7 text-sand/90">{message.body}</p>
                        </article>
                      ))}
                    </div>
                    <form className="mt-5" onSubmit={handleSendGroupMessage}>
                      <label className="field">
                        <span>Add discussion note</span>
                        <textarea
                          rows={3}
                          value={groupMessage}
                          onChange={(event) => setGroupMessage(event.target.value)}
                          placeholder="Share a case pattern, ask a procedural question, or offer a working note."
                          required
                        />
                      </label>
                      <button className="button-primary mt-4" type="submit" disabled={submitting}>
                        {submitting ? "Posting..." : "Post discussion"}
                      </button>
                    </form>
                  </div>

                  <div>
                    <p className="text-xs uppercase tracking-[0.24em] text-bronze">Shared files</p>
                    <div className="mt-4 space-y-3">
                      {selectedGroup.sharedFiles.map((file) => (
                        <a
                          key={file.id}
                          href={file.url}
                          target="_blank"
                          rel="noreferrer"
                          className="block rounded-[1.5rem] border border-white/10 bg-white/5 p-4 transition hover:border-bronze/35"
                        >
                          <p className="font-medium text-sand">{file.title}</p>
                          <p className="mt-2 text-xs uppercase tracking-[0.18em] text-bronze">
                            {file.fileKind} | {file.sharedBy}
                          </p>
                        </a>
                      ))}
                    </div>
                    <form className="mt-5" onSubmit={handleShareFile}>
                      <div className="grid gap-4">
                        <label className="field">
                          <span>File title</span>
                          <input value={fileTitle} onChange={(event) => setFileTitle(event.target.value)} required />
                        </label>
                        <label className="field">
                          <span>File URL</span>
                          <input value={fileUrl} onChange={(event) => setFileUrl(event.target.value)} required />
                        </label>
                        <label className="field">
                          <span>File type</span>
                          <select value={fileKind} onChange={(event) => setFileKind(event.target.value as SharedFileKind)}>
                            <option value="pdf">PDF</option>
                            <option value="doc">DOC</option>
                            <option value="image">Image</option>
                            <option value="video">Video</option>
                          </select>
                        </label>
                      </div>
                      <button className="button-primary mt-4" type="submit" disabled={sharing}>
                        {sharing ? "Sharing..." : "Share file"}
                      </button>
                    </form>
                  </div>
                </div>
              </section>
            ) : null}

            <section className="panel p-6">
              <p className="text-xs uppercase tracking-[0.28em] text-bronze">Referral board</p>
              <div className="mt-5 grid gap-4 xl:grid-cols-2">
                {referrals.map((referral) => (
                  <article key={referral.id} className="rounded-[1.5rem] border border-white/10 bg-white/5 p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-medium text-sand">{referral.fromName} to {referral.toName}</p>
                        <p className="mt-2 text-xs uppercase tracking-[0.18em] text-bronze">
                          {referral.practiceArea} | {referral.city}
                        </p>
                      </div>
                      <span className="tag">{referral.status}</span>
                    </div>
                    <p className="mt-3 text-sm leading-7 text-mist/80">{referral.note}</p>
                    {referral.status === "open" ? (
                      <div className="mt-4 flex flex-wrap gap-3">
                        <button
                          type="button"
                          className="button-primary"
                          onClick={() => void handleRespondReferral(referral.id, "accepted")}
                          disabled={submitting}
                        >
                          Accept
                        </button>
                        <button
                          type="button"
                          className="button-secondary"
                          onClick={() => void handleRespondReferral(referral.id, "declined")}
                          disabled={submitting}
                        >
                          Decline
                        </button>
                      </div>
                    ) : null}
                  </article>
                ))}
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
