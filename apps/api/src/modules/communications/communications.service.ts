import type {
  CallRoom,
  CallRoomCreateRequest,
  CollaborationGroup,
  CommunicationEvent,
  CommunicationsDashboardResponse,
  ConversationDetail,
  ConversationMessage,
  ConversationMessageCreateRequest,
  ConversationSummary,
  GroupCreateRequest,
  GroupFileShareRequest,
  GroupMessageCreateRequest,
  ReferralCreateRequest,
  ReferralRequest,
  ReferralRespondRequest,
  SharedFile
} from "@lexevo/contracts";

import { findProfileByHandle } from "../profiles/profile.service";

const eventListeners = new Set<(event: CommunicationEvent) => void>();

const conversations: ConversationDetail[] = [
  {
    id: "conv_viewer_isha",
    kind: "client-lawyer",
    counterpartHandle: "adv-isha-reddy",
    counterpartName: "Adv. Isha Reddy",
    counterpartHeadline: "High-stakes criminal defense and constitutional strategy",
    city: "Hyderabad",
    unreadCount: 1,
    lastMessagePreview: "Send the complaint copy and the chronology before the call.",
    updatedAt: hoursAgo(1.2),
    callReady: true,
    messages: [
      createConversationMessage(
        "msg_isha_1",
        "Adv. Isha Reddy",
        "Lawyer",
        "Share the chronology, the complaint copy if available, and the exact timing of the last police communication.",
        4.8
      ),
      createConversationMessage(
        "msg_isha_2",
        "Lexevo Viewer",
        "Client",
        "Uploading the documents now. I also want to understand whether an urgent consultation tonight is possible.",
        2.5
      ),
      createConversationMessage(
        "msg_isha_3",
        "Adv. Isha Reddy",
        "Lawyer",
        "Send the complaint copy and the chronology before the call.",
        1.2
      )
    ]
  },
  {
    id: "conv_viewer_arjun",
    kind: "client-lawyer",
    counterpartHandle: "arjun-mehta-counsel",
    counterpartName: "Arjun Mehta",
    counterpartHeadline: "Corporate, startup, and cross-border advisory counsel",
    city: "Bengaluru",
    unreadCount: 0,
    lastMessagePreview: "A founder memo plus board summary would be the right start.",
    updatedAt: hoursAgo(6.4),
    callReady: true,
    messages: [
      createConversationMessage(
        "msg_arjun_1",
        "Lexevo Viewer",
        "Founder",
        "Can we review a cross-border SaaS contract structure this week?",
        9.1
      ),
      createConversationMessage(
        "msg_arjun_2",
        "Arjun Mehta",
        "Lawyer",
        "A founder memo plus board summary would be the right start.",
        6.4
      )
    ]
  },
  {
    id: "conv_referral_isha_naina",
    kind: "lawyer-lawyer",
    counterpartHandle: "naina-kapoor-familylaw",
    counterpartName: "Naina Kapoor",
    counterpartHeadline: "Discreet family law representation with negotiation focus",
    city: "Delhi",
    unreadCount: 2,
    lastMessagePreview: "I can take the custody matter if the client wants Delhi counsel.",
    updatedAt: hoursAgo(0.8),
    callReady: true,
    messages: [
      createConversationMessage(
        "msg_referral_1",
        "Adv. Isha Reddy",
        "Lawyer",
        "I have a Hyderabad client with a Delhi custody issue. Are you open to a structured referral?",
        3.2
      ),
      createConversationMessage(
        "msg_referral_2",
        "Naina Kapoor",
        "Lawyer",
        "Yes. Send the case posture, current interim arrangement, and whether there is parallel property exposure.",
        0.8
      )
    ]
  }
];

const groups: CollaborationGroup[] = [
  {
    id: "group_criminal_circle",
    name: "Criminal Strategy Circle",
    practiceArea: "Criminal Law",
    description: "Rapid discussion room for bail strategy, complaint response, and urgent criminal procedure issues.",
    memberCount: 42,
    members: ["Adv. Isha Reddy", "Neha Pillai", "Karan Malhotra", "Lexevo Viewer"],
    discussions: [
      createConversationMessage(
        "group_msg_1",
        "Adv. Isha Reddy",
        "Lawyer",
        "For urgent bail consults, I now start with a strict chronology request before any legal opinion.",
        5.1
      ),
      createConversationMessage(
        "group_msg_2",
        "Karan Malhotra",
        "Lawyer",
        "Same. It cuts down confusion and prevents contradictory oral instructions from the client.",
        2.9
      )
    ],
    sharedFiles: [
      createSharedFile(
        "group_file_1",
        "Urgent bail intake checklist",
        "https://example.com/urgent-bail-checklist.pdf",
        "pdf",
        "Adv. Isha Reddy",
        6.2
      )
    ]
  },
  {
    id: "group_founder_forum",
    name: "Founder Counsel Forum",
    practiceArea: "Corporate Advisory",
    description: "Commercial, venture, and startup counsel discussion space with file sharing for reusable playbooks.",
    memberCount: 31,
    members: ["Arjun Mehta", "Aakriti Jain", "Lexevo Viewer"],
    discussions: [
      createConversationMessage(
        "group_msg_3",
        "Arjun Mehta",
        "Lawyer",
        "Sharing a light-weight founder memo structure that makes first financing reviews much faster.",
        8.4
      )
    ],
    sharedFiles: [
      createSharedFile(
        "group_file_2",
        "Founder memo starter",
        "https://example.com/founder-memo.doc",
        "doc",
        "Arjun Mehta",
        8.1
      )
    ]
  }
];

const callRooms: CallRoom[] = [
  {
    id: "call_room_1",
    title: "Urgent matter intake with Adv. Isha Reddy",
    mode: "video",
    status: "live",
    hostName: "Adv. Isha Reddy",
    participants: ["Adv. Isha Reddy", "Lexevo Viewer"],
    agenda: "Review chronology, complaint posture, and immediate next steps.",
    joinCode: "LEX-ISHA-401",
    scheduledFor: hoursAgo(0.1)
  },
  {
    id: "call_room_2",
    title: "Founder contract structuring review",
    mode: "audio",
    status: "scheduled",
    hostName: "Arjun Mehta",
    participants: ["Arjun Mehta", "Lexevo Viewer"],
    agenda: "Walk through board memo, founder obligations, and customer fallback clauses.",
    joinCode: "LEX-ARJUN-224",
    scheduledFor: hoursFromNow(6)
  }
];

const referrals: ReferralRequest[] = [
  {
    id: "ref_1",
    fromHandle: "adv-isha-reddy",
    fromName: "Adv. Isha Reddy",
    toHandle: "naina-kapoor-familylaw",
    toName: "Naina Kapoor",
    practiceArea: "Family Law",
    city: "Delhi",
    note: "Client is Hyderabad-based but the custody litigation and interim relief strategy need Delhi counsel.",
    status: "open",
    createdAt: hoursAgo(2.1)
  },
  {
    id: "ref_2",
    fromHandle: "arjun-mehta-counsel",
    fromName: "Arjun Mehta",
    toHandle: "adv-isha-reddy",
    toName: "Adv. Isha Reddy",
    practiceArea: "Criminal Law",
    city: "Hyderabad",
    note: "Founder dispute has escalated into complaint exposure. Client needs immediate criminal strategy support.",
    status: "accepted",
    createdAt: hoursAgo(10.4)
  }
];

export function listCommunicationsDashboard(): CommunicationsDashboardResponse {
  return {
    conversations: listConversationSummaries(),
    groups: groups.map(cloneGroup),
    calls: callRooms.map(cloneCallRoom).sort(
      (left, right) => Date.parse(left.scheduledFor) - Date.parse(right.scheduledFor)
    ),
    referrals: referrals
      .map((referral) => ({ ...referral }))
      .sort((left, right) => Date.parse(right.createdAt) - Date.parse(left.createdAt))
  };
}

export function getConversationDetail(conversationId: string) {
  const conversation = conversations.find((entry) => entry.id === conversationId);

  return conversation ? cloneConversation(conversation) : undefined;
}

export function sendConversationMessage(
  conversationId: string,
  payload: ConversationMessageCreateRequest
): ConversationDetail | undefined {
  const conversation = conversations.find((entry) => entry.id === conversationId);

  if (!conversation) {
    return undefined;
  }

  const message = createNewMessage(payload);
  conversation.messages = [...conversation.messages, message];
  conversation.updatedAt = message.createdAt;
  conversation.lastMessagePreview = message.body;
  conversation.unreadCount = payload.authorRole.toLowerCase().includes("lawyer") ? conversation.unreadCount + 1 : 0;

  broadcastEvent(
    "conversation_message",
    `${message.authorName} sent a new message in ${conversation.counterpartName}.`
  );

  return cloneConversation(conversation);
}

export function listGroups() {
  return groups.map(cloneGroup);
}

export function createGroup(payload: GroupCreateRequest): CollaborationGroup {
  const group: CollaborationGroup = {
    id: `group_${Date.now()}`,
    name: payload.name.trim(),
    practiceArea: payload.practiceArea.trim(),
    description: payload.description.trim(),
    memberCount: 1,
    members: ["Lexevo Viewer"],
    discussions: [
      {
        id: `group_msg_${Date.now()}`,
        authorName: "Lexevo Viewer",
        authorRole: "Group host",
        body: "Group created. Start the first discussion thread or share a working file.",
        createdAt: new Date().toISOString()
      }
    ],
    sharedFiles: []
  };

  groups.unshift(group);
  broadcastEvent("group_created", `New practice group created: ${group.name}.`);

  return cloneGroup(group);
}

export function sendGroupMessage(
  groupId: string,
  payload: GroupMessageCreateRequest
): CollaborationGroup | undefined {
  const group = groups.find((entry) => entry.id === groupId);

  if (!group) {
    return undefined;
  }

  const message: ConversationMessage = {
    id: `group_msg_${Date.now()}`,
    authorName: payload.authorName.trim(),
    authorRole: payload.authorRole.trim(),
    body: payload.body.trim(),
    createdAt: new Date().toISOString()
  };

  group.discussions = [...group.discussions, message];
  broadcastEvent("group_message", `${message.authorName} posted in ${group.name}.`);

  return cloneGroup(group);
}

export function shareGroupFile(
  groupId: string,
  payload: GroupFileShareRequest
): CollaborationGroup | undefined {
  const group = groups.find((entry) => entry.id === groupId);

  if (!group) {
    return undefined;
  }

  const file: SharedFile = {
    id: `shared_file_${Date.now()}`,
    title: payload.title.trim(),
    url: payload.url.trim(),
    fileKind: payload.fileKind,
    sharedBy: payload.authorName.trim(),
    createdAt: new Date().toISOString()
  };

  group.sharedFiles = [file, ...group.sharedFiles];
  broadcastEvent("file_shared", `${file.sharedBy} shared ${file.title} in ${group.name}.`);

  return cloneGroup(group);
}

export function listCallRooms() {
  return callRooms.map(cloneCallRoom).sort(
    (left, right) => Date.parse(left.scheduledFor) - Date.parse(right.scheduledFor)
  );
}

export function createCallRoom(payload: CallRoomCreateRequest): CallRoom {
  const room: CallRoom = {
    id: `call_${Date.now()}`,
    title: payload.title.trim(),
    mode: payload.mode,
    status: Date.parse(payload.scheduledFor) <= Date.now() ? "live" : "scheduled",
    hostName: payload.hostName.trim(),
    participants: payload.participants,
    agenda: payload.agenda.trim(),
    joinCode: `LEX-${Math.random().toString(36).slice(2, 6).toUpperCase()}`,
    scheduledFor: payload.scheduledFor
  };

  callRooms.unshift(room);
  broadcastEvent("call_created", `${room.mode === "video" ? "Video" : "Audio"} room created: ${room.title}.`);

  return cloneCallRoom(room);
}

export function listReferrals() {
  return referrals.map((referral) => ({ ...referral })).sort(
    (left, right) => Date.parse(right.createdAt) - Date.parse(left.createdAt)
  );
}

export function createReferral(payload: ReferralCreateRequest): ReferralRequest | undefined {
  const from = findProfileByHandle(payload.fromHandle);
  const to = findProfileByHandle(payload.toHandle);

  if (!from || !to) {
    return undefined;
  }

  const referral: ReferralRequest = {
    id: `ref_${Date.now()}`,
    fromHandle: from.handle,
    fromName: from.fullName,
    toHandle: to.handle,
    toName: to.fullName,
    practiceArea: payload.practiceArea.trim(),
    city: payload.city.trim(),
    note: payload.note.trim(),
    status: "open",
    createdAt: new Date().toISOString()
  };

  referrals.unshift(referral);
  broadcastEvent("referral_created", `${from.fullName} sent a referral to ${to.fullName}.`);

  return { ...referral };
}

export function respondToReferral(
  referralId: string,
  payload: ReferralRespondRequest
): ReferralRequest | undefined {
  const referral = referrals.find((entry) => entry.id === referralId);

  if (!referral) {
    return undefined;
  }

  referral.status = payload.status;
  broadcastEvent("referral_updated", `${referral.toName} ${payload.status} referral ${referral.id}.`);

  return { ...referral };
}

export function subscribeToCommunicationEvents(listener: (event: CommunicationEvent) => void) {
  eventListeners.add(listener);

  return () => {
    eventListeners.delete(listener);
  };
}

function listConversationSummaries(): ConversationSummary[] {
  return conversations
    .map((conversation) => ({
      id: conversation.id,
      kind: conversation.kind,
      counterpartHandle: conversation.counterpartHandle,
      counterpartName: conversation.counterpartName,
      counterpartHeadline: conversation.counterpartHeadline,
      city: conversation.city,
      unreadCount: conversation.unreadCount,
      lastMessagePreview: conversation.lastMessagePreview,
      updatedAt: conversation.updatedAt,
      callReady: conversation.callReady
    }))
    .sort((left, right) => Date.parse(right.updatedAt) - Date.parse(left.updatedAt));
}

function createNewMessage(payload: ConversationMessageCreateRequest): ConversationMessage {
  const attachment = payload.attachment
    ? {
        id: `attachment_${Date.now()}`,
        title: payload.attachment.title.trim(),
        url: payload.attachment.url.trim(),
        fileKind: payload.attachment.fileKind,
        sharedBy: payload.authorName.trim(),
        createdAt: new Date().toISOString()
      }
    : undefined;

  return {
    id: `msg_${Date.now()}`,
    authorName: payload.authorName.trim(),
    authorRole: payload.authorRole.trim(),
    body: payload.body.trim(),
    createdAt: new Date().toISOString(),
    attachment
  };
}

function broadcastEvent(type: CommunicationEvent["type"], message: string) {
  const event: CommunicationEvent = {
    id: `event_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    type,
    message,
    createdAt: new Date().toISOString()
  };

  for (const listener of eventListeners) {
    listener(event);
  }
}

function createConversationMessage(
  id: string,
  authorName: string,
  authorRole: string,
  body: string,
  hours: number
): ConversationMessage {
  return {
    id,
    authorName,
    authorRole,
    body,
    createdAt: hoursAgo(hours)
  };
}

function createSharedFile(
  id: string,
  title: string,
  url: string,
  fileKind: SharedFile["fileKind"],
  sharedBy: string,
  hours: number
): SharedFile {
  return {
    id,
    title,
    url,
    fileKind,
    sharedBy,
    createdAt: hoursAgo(hours)
  };
}

function cloneConversation(conversation: ConversationDetail): ConversationDetail {
  return {
    ...conversation,
    messages: conversation.messages.map((message) => ({
      ...message,
      attachment: message.attachment ? { ...message.attachment } : undefined
    }))
  };
}

function cloneGroup(group: CollaborationGroup): CollaborationGroup {
  return {
    ...group,
    members: [...group.members],
    discussions: group.discussions.map((message) => ({
      ...message,
      attachment: message.attachment ? { ...message.attachment } : undefined
    })),
    sharedFiles: group.sharedFiles.map((file) => ({ ...file }))
  };
}

function cloneCallRoom(room: CallRoom): CallRoom {
  return {
    ...room,
    participants: [...room.participants]
  };
}

function hoursAgo(hours: number) {
  return new Date(Date.now() - hours * 60 * 60 * 1000).toISOString();
}

function hoursFromNow(hours: number) {
  return new Date(Date.now() + hours * 60 * 60 * 1000).toISOString();
}
