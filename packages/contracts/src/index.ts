export type ContactChannel = "chat" | "call" | "video";

export type PracticeArea =
  | "Criminal Law"
  | "Civil Litigation"
  | "Corporate Advisory"
  | "Family Law"
  | "Property Law"
  | "Tax Law"
  | "Arbitration";

export interface ReviewSnippet {
  reviewer: string;
  role: string;
  quote: string;
  rating: number;
}

export interface PortfolioItem {
  title: string;
  type: "case" | "article" | "video" | "achievement";
  summary: string;
  link?: string;
}

export interface AvailabilityWindow {
  day: string;
  slots: string[];
}

export interface ProfileVisibility {
  showPhone: boolean;
  showEmail: boolean;
  showOfficeAddress: boolean;
  showLiveLocation: boolean;
  showPortfolio: boolean;
}

export interface LawyerProfileSummary {
  handle: string;
  fullName: string;
  headline: string;
  city: string;
  experienceYears: number;
  practiceAreas: PracticeArea[];
  languages: string[];
  courtsHandled: string[];
  consultationFeeInr: number;
  averageRating: number;
  featuredReview: string;
  leadOffer: string;
  responseTimeLabel: string;
}

export interface LawyerProfile extends LawyerProfileSummary {
  bio: string;
  officeAddress: string;
  courtsHandled: string[];
  skills: string[];
  contactChannels: ContactChannel[];
  portfolio: PortfolioItem[];
  reviews: ReviewSnippet[];
  achievements: string[];
  availability: AvailabilityWindow[];
  consultationFeeInr: number;
  visibility: ProfileVisibility;
}

export interface OnboardingPayload {
  phoneOrEmail: string;
  fullName: string;
  city: string;
  practiceAreas: PracticeArea[];
  primaryLanguage: string;
  experienceYears: number;
  officeAddress?: string;
  about?: string;
}

export interface DirectorySearchFilters {
  query?: string;
  city?: string;
  practiceArea?: PracticeArea;
  court?: string;
  language?: string;
  maxConsultationFeeInr?: number;
}

export type PaymentProvider = "razorpay" | "stripe";

export interface ConsultationBookingRequest {
  lawyerHandle: string;
  clientName: string;
  clientPhone: string;
  clientEmail?: string;
  city: string;
  practiceArea?: PracticeArea;
  court?: string;
  preferredDay: string;
  preferredSlot: string;
  budgetInr?: number;
  summary: string;
  paymentProvider: PaymentProvider;
  notifyOnWhatsApp: boolean;
}

export interface ConsultationBookingResponse {
  leadId: string;
  status: "captured";
  lawyerHandle: string;
  checkoutProvider: PaymentProvider;
  checkoutReference: string;
  freeLeadApplied: boolean;
  whatsAppPreview: string;
  scheduledLabel: string;
}

export type SocialPostType = "text" | "image" | "video";

export type SocialComposerFormat = "post" | "thread" | "video-script";

export interface SocialComment {
  id: string;
  authorName: string;
  authorRole: string;
  body: string;
  createdAt: string;
}

export interface SocialPost {
  id: string;
  authorHandle: string;
  authorName: string;
  authorHeadline: string;
  authorCity: string;
  authorResponseTimeLabel: string;
  contentType: SocialPostType;
  caption: string;
  hashtags: string[];
  mediaUrl?: string;
  mediaPosterUrl?: string;
  publishedAt: string;
  likeCount: number;
  shareCount: number;
  viewCount: number;
  comments: SocialComment[];
  likedByViewer: boolean;
  isFollowingAuthor: boolean;
}

export interface TrendTopic {
  hashtag: string;
  postCount: number;
  momentumLabel: string;
  sampleAngle: string;
}

export interface SocialFeedResponse {
  posts: SocialPost[];
  trends: TrendTopic[];
  suggestions: LawyerProfileSummary[];
}

export interface SocialEngagementRequest {
  action: "like" | "share";
}

export interface SocialEngagementResponse {
  postId: string;
  action: "like" | "share";
  likeCount: number;
  shareCount: number;
  likedByViewer: boolean;
}

export interface SocialCommentRequest {
  authorName: string;
  authorRole: string;
  body: string;
}

export interface SocialCommentResponse {
  postId: string;
  comment: SocialComment;
  commentCount: number;
}

export interface SocialFollowRequest {
  handle: string;
  mode: "follow" | "connect";
}

export interface SocialFollowResponse {
  handle: string;
  mode: "follow" | "connect";
  state: "following" | "connected";
  followerCount: number;
}

export interface AiPostGenerationRequest {
  authorHandle: string;
  topic: string;
  audience: string;
  tone: "authoritative" | "approachable" | "urgent" | "educational";
  format: SocialComposerFormat;
  includeHashtags: boolean;
}

export interface AiPostGenerationResponse {
  authorHandle: string;
  headline: string;
  draftBody: string;
  hashtags: string[];
  suggestedContentType: SocialPostType;
}

export interface SocialPostCreateRequest {
  authorHandle: string;
  contentType: SocialPostType;
  caption: string;
  hashtags: string[];
  mediaUrl?: string;
  mediaPosterUrl?: string;
}

export type ConversationKind = "client-lawyer" | "lawyer-lawyer";

export type SharedFileKind = "pdf" | "doc" | "image" | "video";

export type CallMode = "audio" | "video";

export type CallRoomStatus = "scheduled" | "live" | "ended";

export type ReferralStatus = "open" | "accepted" | "declined";

export interface SharedFile {
  id: string;
  title: string;
  url: string;
  fileKind: SharedFileKind;
  sharedBy: string;
  createdAt: string;
}

export interface ConversationMessage {
  id: string;
  authorName: string;
  authorRole: string;
  body: string;
  createdAt: string;
  attachment?: SharedFile;
}

export interface ConversationSummary {
  id: string;
  kind: ConversationKind;
  counterpartHandle?: string;
  counterpartName: string;
  counterpartHeadline: string;
  city: string;
  unreadCount: number;
  lastMessagePreview: string;
  updatedAt: string;
  callReady: boolean;
}

export interface ConversationDetail extends ConversationSummary {
  messages: ConversationMessage[];
}

export interface CallRoom {
  id: string;
  title: string;
  mode: CallMode;
  status: CallRoomStatus;
  hostName: string;
  participants: string[];
  agenda: string;
  joinCode: string;
  scheduledFor: string;
}

export interface CollaborationGroup {
  id: string;
  name: string;
  practiceArea: string;
  description: string;
  memberCount: number;
  members: string[];
  discussions: ConversationMessage[];
  sharedFiles: SharedFile[];
}

export interface ReferralRequest {
  id: string;
  fromHandle: string;
  fromName: string;
  toHandle: string;
  toName: string;
  practiceArea: string;
  city: string;
  note: string;
  status: ReferralStatus;
  createdAt: string;
}

export interface CommunicationsDashboardResponse {
  conversations: ConversationSummary[];
  groups: CollaborationGroup[];
  calls: CallRoom[];
  referrals: ReferralRequest[];
}

export interface ConversationMessageCreateRequest {
  authorName: string;
  authorRole: string;
  body: string;
  attachment?: Omit<SharedFile, "id" | "createdAt" | "sharedBy">;
}

export interface GroupCreateRequest {
  name: string;
  practiceArea: string;
  description: string;
}

export interface GroupMessageCreateRequest {
  authorName: string;
  authorRole: string;
  body: string;
}

export interface GroupFileShareRequest {
  authorName: string;
  title: string;
  url: string;
  fileKind: SharedFileKind;
}

export interface CallRoomCreateRequest {
  title: string;
  mode: CallMode;
  hostName: string;
  participants: string[];
  agenda: string;
  scheduledFor: string;
}

export interface ReferralCreateRequest {
  fromHandle: string;
  toHandle: string;
  practiceArea: string;
  city: string;
  note: string;
}

export interface ReferralRespondRequest {
  status: Exclude<ReferralStatus, "open">;
}

export interface CommunicationEvent {
  id: string;
  type:
    | "conversation_message"
    | "group_message"
    | "group_created"
    | "file_shared"
    | "call_created"
    | "referral_created"
    | "referral_updated";
  message: string;
  createdAt: string;
}

export type AiProvider = "ollama-local" | "open-source-stack";

export interface AiModelInfo {
  provider: AiProvider;
  modelLabel: string;
  deployment: "prototype-local" | "self-host-ready";
  status: "configured" | "demo";
  note: string;
}

export interface AiOverviewResponse {
  model: AiModelInfo;
  capabilities: string[];
  recommendedWorkflows: string[];
}

export type AiPersona = "client-advocate" | "litigation-strategist" | "business-counsel";

export interface AiChatMessage {
  role: "user" | "assistant";
  content: string;
}

export interface AiChatRequest {
  persona: AiPersona;
  messages: AiChatMessage[];
}

export interface AiChatResponse {
  reply: string;
  followUpSuggestion?: string;
}

export type AiSummaryLength = "short" | "medium" | "detailed";

export interface AiSummaryRequest {
  text: string;
  length: AiSummaryLength;
  context?: string;
}

export interface AiSummaryResponse {
  summary: string;
  keyPoints: string[];
  tone?: string;
}

export interface MatterResearchRequest {
  query: string;
  practiceArea?: PracticeArea;
  court?: string;
  goals?: string;
}

export interface CaseLawSuggestion {
  id: string;
  title: string;
  court: string;
  year: number;
  practiceArea: PracticeArea;
  keyHolding: string;
  relevanceReason: string;
  tags: string[];
}

export interface CaseLawSuggestionResponse {
  query: string;
  suggestions: CaseLawSuggestion[];
  caution: string;
}

export interface LegalSectionSuggestion {
  statute: string;
  section: string;
  title: string;
  whyRelevant: string;
  caution: string;
}

export interface LegalSectionSuggestionResponse {
  query: string;
  suggestions: LegalSectionSuggestion[];
  caution: string;
}

export interface JudgmentSummaryRequest {
  title: string;
  text: string;
}

export interface JudgmentSummaryResponse {
  title: string;
  summary: string;
  issues: string[];
  practicalTakeaways: string[];
  riskNotes: string[];
}

export interface LegalTermExplanationRequest {
  term: string;
  context?: string;
}

export interface LegalTermExplanationResponse {
  term: string;
  simpleExplanation: string;
  whenItMatters: string;
  plainLanguageExample: string;
  caution: string;
}

export interface AiLawyerMatchRequest {
  caseSummary: string;
  practiceArea?: PracticeArea;
  city?: string;
  urgency?: string;
  goals?: string;
}

export interface AiLawyerMatchResponse {
  narrative: string;
  lawyers: Array<{
    profile: LawyerProfileSummary;
    reason: string;
  }>;
}

export interface DiscussionInsight {
  id: string;
  title: string;
  insight: string;
  source: string;
  confidenceLabel: string;
  recommendedAction: string;
}

export interface DiscussionInsightResponse {
  generatedAt: string;
  insights: DiscussionInsight[];
}

export interface LegalNoticeDraftRequest {
  authorHandle: string;
  recipientName: string;
  noticeType: string;
  matterSummary: string;
  demands: string[];
  tone: "firm" | "measured" | "urgent";
  deadlineDays?: number;
}

export interface LegalNoticeDraftResponse {
  subject: string;
  draftBody: string;
  checklist: string[];
  recommendedAttachments: string[];
  caution: string;
}

export type WorkspaceCaseStatus =
  | "intake"
  | "documents-pending"
  | "strategy"
  | "filing"
  | "hearing"
  | "closed";

export type WorkspaceCasePriority = "low" | "medium" | "high" | "urgent";

export type WorkspaceInvoiceStatus = "draft" | "issued" | "paid";

export interface WorkspaceClient {
  id: string;
  name: string;
  company?: string;
  city: string;
  contactPhone: string;
  practiceArea: PracticeArea;
  activeCaseCount: number;
  lastUpdated: string;
}

export interface WorkspaceDocument {
  id: string;
  caseId: string;
  clientId: string;
  title: string;
  category: "evidence" | "agreement" | "court-filing" | "note" | "invoice";
  url: string;
  uploadedAt: string;
  uploadedBy: string;
}

export interface WorkspaceCaseNote {
  id: string;
  authorName: string;
  body: string;
  createdAt: string;
}

export interface WorkspaceCase {
  id: string;
  clientId: string;
  lawyerHandle: string;
  title: string;
  practiceArea: PracticeArea;
  status: WorkspaceCaseStatus;
  priority: WorkspaceCasePriority;
  court: string;
  nextAction: string;
  nextHearingAt?: string;
  notes: WorkspaceCaseNote[];
  documents: WorkspaceDocument[];
}

export interface WorkspaceInvoiceLineItem {
  description: string;
  quantity: number;
  rateInr: number;
  amountInr: number;
}

export interface WorkspaceInvoice {
  id: string;
  clientId: string;
  clientName: string;
  lawyerHandle: string;
  title: string;
  status: WorkspaceInvoiceStatus;
  issuedAt: string;
  dueAt: string;
  subtotalInr: number;
  taxInr: number;
  totalInr: number;
  lineItems: WorkspaceInvoiceLineItem[];
  paymentInstructions: string;
}

export interface WorkspaceAnalytics {
  profileViews: number;
  leadsReceived: number;
  conversionRate: number;
  engagementRate: number;
  activeMessages: number;
  monthlyRevenueInr: number;
}

export interface WorkspaceDashboardResponse {
  clients: WorkspaceClient[];
  cases: WorkspaceCase[];
  documents: WorkspaceDocument[];
  invoices: WorkspaceInvoice[];
  analytics: WorkspaceAnalytics;
}

export interface WorkspaceCaseCreateRequest {
  clientId: string;
  lawyerHandle: string;
  title: string;
  practiceArea: PracticeArea;
  court: string;
  priority: WorkspaceCasePriority;
  nextAction: string;
  nextHearingAt?: string;
}

export interface WorkspaceCaseStatusUpdateRequest {
  status: WorkspaceCaseStatus;
}

export interface WorkspaceCaseNoteCreateRequest {
  authorName: string;
  body: string;
}

export interface WorkspaceDocumentCreateRequest {
  clientId: string;
  title: string;
  category: WorkspaceDocument["category"];
  url: string;
  uploadedBy: string;
}

export interface WorkspaceInvoiceCreateRequest {
  clientId: string;
  lawyerHandle: string;
  title: string;
  dueAt: string;
  lineItems: Array<{
    description: string;
    quantity: number;
    rateInr: number;
  }>;
}
