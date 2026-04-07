import type {
  WorkspaceAnalytics,
  WorkspaceCase,
  WorkspaceCaseCreateRequest,
  WorkspaceCaseNote,
  WorkspaceCaseNoteCreateRequest,
  WorkspaceCaseStatusUpdateRequest,
  WorkspaceClient,
  WorkspaceDashboardResponse,
  WorkspaceDocument,
  WorkspaceDocumentCreateRequest,
  WorkspaceInvoice,
  WorkspaceInvoiceCreateRequest
} from "@lexevo/contracts";

import { listCommunicationsDashboard } from "../communications/communications.service";
import { listSocialFeed } from "../social/social.service";

const clients: WorkspaceClient[] = [
  {
    id: "client_rohan",
    name: "Rohan Sharma",
    city: "Hyderabad",
    contactPhone: "+91 98765 43210",
    practiceArea: "Criminal Law",
    activeCaseCount: 1,
    lastUpdated: hoursAgo(2)
  },
  {
    id: "client_acme",
    name: "Aakriti Jain",
    company: "Acme Ventures",
    city: "Bengaluru",
    contactPhone: "+91 98123 45678",
    practiceArea: "Corporate Advisory",
    activeCaseCount: 1,
    lastUpdated: hoursAgo(5)
  },
  {
    id: "client_ananya",
    name: "Ananya Kapoor",
    city: "Delhi",
    contactPhone: "+91 98234 56789",
    practiceArea: "Family Law",
    activeCaseCount: 1,
    lastUpdated: hoursAgo(8)
  }
];

const cases: WorkspaceCase[] = [
  {
    id: "case_isha_bail",
    clientId: "client_rohan",
    lawyerHandle: "adv-isha-reddy",
    title: "Complaint escalation and anticipatory bail strategy",
    practiceArea: "Criminal Law",
    status: "strategy",
    priority: "urgent",
    court: "High Court of Telangana",
    nextAction: "Finalize chronology, bail grounds, and filing-ready annexures.",
    nextHearingAt: hoursFromNow(30),
    notes: [
      createCaseNote("note_1", "Adv. Isha Reddy", "Client chronology is mostly ready. Need cleaner call-log reconstruction.", 7),
      createCaseNote("note_2", "Case Manager", "Collect complaint copy and prior email trail before final filing review.", 3)
    ],
    documents: [
      createDocument(
        "doc_1",
        "case_isha_bail",
        "client_rohan",
        "Complaint copy",
        "evidence",
        "https://example.com/complaint-copy.pdf",
        "Rohan Sharma",
        6
      ),
      createDocument(
        "doc_2",
        "case_isha_bail",
        "client_rohan",
        "Chronology draft",
        "note",
        "https://example.com/chronology-draft.doc",
        "Adv. Isha Reddy",
        2
      )
    ]
  },
  {
    id: "case_arjun_contracts",
    clientId: "client_acme",
    lawyerHandle: "arjun-mehta-counsel",
    title: "Cross-border founder contract review",
    practiceArea: "Corporate Advisory",
    status: "filing",
    priority: "high",
    court: "Pre-litigation / contract desk",
    nextAction: "Issue formal payment and compliance notice after final founder memo review.",
    notes: [
      createCaseNote("note_3", "Arjun Mehta", "Need to align payment default position with service schedule and IP clause.", 9)
    ],
    documents: [
      createDocument(
        "doc_3",
        "case_arjun_contracts",
        "client_acme",
        "Master services agreement",
        "agreement",
        "https://example.com/msa.pdf",
        "Aakriti Jain",
        10
      )
    ]
  },
  {
    id: "case_naina_custody",
    clientId: "client_ananya",
    lawyerHandle: "naina-kapoor-familylaw",
    title: "Custody and interim arrangement planning",
    practiceArea: "Family Law",
    status: "hearing",
    priority: "high",
    court: "Family Court Saket",
    nextAction: "Prepare parenting schedule note and hearing brief.",
    nextHearingAt: hoursFromNow(72),
    notes: [
      createCaseNote("note_4", "Naina Kapoor", "Interim arrangement points are strong if school records are organized.", 11)
    ],
    documents: [
      createDocument(
        "doc_4",
        "case_naina_custody",
        "client_ananya",
        "School calendar bundle",
        "evidence",
        "https://example.com/school-calendar.pdf",
        "Ananya Kapoor",
        12
      )
    ]
  }
];

const invoices: WorkspaceInvoice[] = [
  createInvoiceRecord({
    id: "invoice_1",
    clientId: "client_acme",
    clientName: "Acme Ventures",
    lawyerHandle: "arjun-mehta-counsel",
    title: "Founder contract review and notice prep",
    issuedAt: hoursAgo(24),
    dueAt: hoursFromNow(120),
    lineItems: [
      {
        description: "Contract review and escalation memo",
        quantity: 1,
        rateInr: 18000
      }
    ]
  }),
  createInvoiceRecord({
    id: "invoice_2",
    clientId: "client_rohan",
    clientName: "Rohan Sharma",
    lawyerHandle: "adv-isha-reddy",
    title: "Urgent bail strategy consultation",
    issuedAt: hoursAgo(48),
    dueAt: hoursFromNow(48),
    lineItems: [
      {
        description: "Urgent consultation and chronology review",
        quantity: 1,
        rateInr: 7500
      }
    ]
  })
];

export function getWorkspaceDashboard(): WorkspaceDashboardResponse {
  return {
    clients: clients.map((client) => ({ ...client })),
    cases: cases.map(cloneCase),
    documents: listAllDocuments(),
    invoices: invoices.map(cloneInvoice),
    analytics: getWorkspaceAnalytics()
  };
}

export function createWorkspaceCase(payload: WorkspaceCaseCreateRequest) {
  const client = clients.find((entry) => entry.id === payload.clientId);

  if (!client) {
    return undefined;
  }

  const nextCase: WorkspaceCase = {
    id: `case_${Date.now()}`,
    clientId: payload.clientId,
    lawyerHandle: payload.lawyerHandle,
    title: payload.title.trim(),
    practiceArea: payload.practiceArea,
    status: "intake",
    priority: payload.priority,
    court: payload.court.trim(),
    nextAction: payload.nextAction.trim(),
    nextHearingAt: payload.nextHearingAt,
    notes: [
      {
        id: `note_${Date.now()}`,
        authorName: "Lexevo Workspace",
        body: "Case created. Add documents, notes, and move the matter through status checkpoints.",
        createdAt: new Date().toISOString()
      }
    ],
    documents: []
  };

  cases.unshift(nextCase);
  client.activeCaseCount += 1;
  client.lastUpdated = new Date().toISOString();

  return cloneCase(nextCase);
}

export function addCaseNote(caseId: string, payload: WorkspaceCaseNoteCreateRequest) {
  const matchedCase = cases.find((entry) => entry.id === caseId);

  if (!matchedCase) {
    return undefined;
  }

  const nextNote: WorkspaceCaseNote = {
    id: `note_${Date.now()}`,
    authorName: payload.authorName.trim(),
    body: payload.body.trim(),
    createdAt: new Date().toISOString()
  };

  matchedCase.notes = [nextNote, ...matchedCase.notes];
  syncClientActivity(matchedCase.clientId);

  return cloneCase(matchedCase);
}

export function addCaseDocument(caseId: string, payload: WorkspaceDocumentCreateRequest) {
  const matchedCase = cases.find((entry) => entry.id === caseId);

  if (!matchedCase) {
    return undefined;
  }

  const nextDocument: WorkspaceDocument = {
    id: `document_${Date.now()}`,
    caseId,
    clientId: payload.clientId,
    title: payload.title.trim(),
    category: payload.category,
    url: payload.url.trim(),
    uploadedAt: new Date().toISOString(),
    uploadedBy: payload.uploadedBy.trim()
  };

  matchedCase.documents = [nextDocument, ...matchedCase.documents];
  syncClientActivity(matchedCase.clientId);

  return cloneCase(matchedCase);
}

export function updateCaseStatus(caseId: string, payload: WorkspaceCaseStatusUpdateRequest) {
  const matchedCase = cases.find((entry) => entry.id === caseId);

  if (!matchedCase) {
    return undefined;
  }

  matchedCase.status = payload.status;
  syncClientActivity(matchedCase.clientId);

  return cloneCase(matchedCase);
}

export function createWorkspaceInvoice(payload: WorkspaceInvoiceCreateRequest) {
  const client = clients.find((entry) => entry.id === payload.clientId);

  if (!client) {
    return undefined;
  }

  const invoice = createInvoiceRecord({
    id: `invoice_${Date.now()}`,
    clientId: payload.clientId,
    clientName: client.company ?? client.name,
    lawyerHandle: payload.lawyerHandle,
    title: payload.title.trim(),
    issuedAt: new Date().toISOString(),
    dueAt: payload.dueAt,
    lineItems: payload.lineItems
  });

  invoices.unshift(invoice);
  syncClientActivity(payload.clientId);

  return cloneInvoice(invoice);
}

export function listWorkspaceDocuments() {
  return listAllDocuments();
}

export function listWorkspaceInvoices() {
  return invoices.map(cloneInvoice);
}

export function getWorkspaceAnalytics(): WorkspaceAnalytics {
  const feed = listSocialFeed();
  const communications = listCommunicationsDashboard();
  const totalViews = feed.posts.reduce((sum, post) => sum + post.viewCount, 0);
  const totalEngagements = feed.posts.reduce(
    (sum, post) => sum + post.likeCount + post.shareCount + post.comments.length,
    0
  );

  return {
    profileViews: 6840,
    leadsReceived: 27,
    conversionRate: 18.5,
    engagementRate: totalViews > 0 ? Number(((totalEngagements / totalViews) * 100).toFixed(1)) : 0,
    activeMessages: communications.conversations.length,
    monthlyRevenueInr: invoices.reduce((sum, invoice) => sum + invoice.totalInr, 0)
  };
}

function listAllDocuments() {
  return cases.flatMap((entry) => entry.documents.map((document) => ({ ...document })));
}

function syncClientActivity(clientId: string) {
  const client = clients.find((entry) => entry.id === clientId);

  if (!client) {
    return;
  }

  client.activeCaseCount = cases.filter((entry) => entry.clientId === clientId && entry.status !== "closed").length;
  client.lastUpdated = new Date().toISOString();
}

function createCaseNote(
  id: string,
  authorName: string,
  body: string,
  hours: number
): WorkspaceCaseNote {
  return {
    id,
    authorName,
    body,
    createdAt: hoursAgo(hours)
  };
}

function createDocument(
  id: string,
  caseId: string,
  clientId: string,
  title: string,
  category: WorkspaceDocument["category"],
  url: string,
  uploadedBy: string,
  hours: number
): WorkspaceDocument {
  return {
    id,
    caseId,
    clientId,
    title,
    category,
    url,
    uploadedAt: hoursAgo(hours),
    uploadedBy
  };
}

function createInvoiceRecord({
  id,
  clientId,
  clientName,
  lawyerHandle,
  title,
  issuedAt,
  dueAt,
  lineItems
}: {
  id: string;
  clientId: string;
  clientName: string;
  lawyerHandle: string;
  title: string;
  issuedAt: string;
  dueAt: string;
  lineItems: Array<{
    description: string;
    quantity: number;
    rateInr: number;
  }>;
}): WorkspaceInvoice {
  const normalizedItems = lineItems.map((item) => ({
    description: item.description.trim(),
    quantity: item.quantity,
    rateInr: item.rateInr,
    amountInr: item.quantity * item.rateInr
  }));
  const subtotal = normalizedItems.reduce((sum, item) => sum + item.amountInr, 0);
  const tax = Math.round(subtotal * 0.18);

  return {
    id,
    clientId,
    clientName,
    lawyerHandle,
    title,
    status: "issued",
    issuedAt,
    dueAt,
    subtotalInr: subtotal,
    taxInr: tax,
    totalInr: subtotal + tax,
    lineItems: normalizedItems,
    paymentInstructions: "Pay via bank transfer or approved gateway and share proof of payment with the matter reference."
  };
}

function cloneCase(caseRecord: WorkspaceCase): WorkspaceCase {
  return {
    ...caseRecord,
    notes: caseRecord.notes.map((note) => ({ ...note })),
    documents: caseRecord.documents.map((document) => ({ ...document }))
  };
}

function cloneInvoice(invoice: WorkspaceInvoice): WorkspaceInvoice {
  return {
    ...invoice,
    lineItems: invoice.lineItems.map((lineItem) => ({ ...lineItem }))
  };
}

function hoursAgo(hours: number) {
  return new Date(Date.now() - hours * 60 * 60 * 1000).toISOString();
}

function hoursFromNow(hours: number) {
  return new Date(Date.now() + hours * 60 * 60 * 1000).toISOString();
}
