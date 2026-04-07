import type { ContactChannel, PracticeArea } from "@lexevo/contracts";

export type PublicSectionId =
  | "practiceAreas"
  | "skills"
  | "experience"
  | "office"
  | "contact"
  | "portfolio"
  | "reviews";

export interface DraftVisibility {
  showPhone: boolean;
  showEmail: boolean;
  showOfficeAddress: boolean;
  showLiveLocation: boolean;
  showPortfolio: boolean;
  showCases: boolean;
  showReviews: boolean;
}

export interface DraftReviewEntry {
  reviewer: string;
  role: string;
  quote: string;
  rating: number;
}

export interface OnboardingDraft {
  phoneOrEmail: string;
  otpVerified: boolean;
  fullName: string;
  headline: string;
  city: string;
  primaryLanguage: string;
  experienceYears: number;
  practiceAreas: PracticeArea[];
  officeAddress: string;
  about: string;
  profileHandle: string;
  customDomain: string;
  profileImageDataUrl: string;
  profileImageName: string;
  contactChannels: ContactChannel[];
  contactEmail: string;
  contactPhone: string;
  liveLocationUrl: string;
  languagesText: string;
  skillsText: string;
  courtsHandledText: string;
  firmHistoryText: string;
  caseHighlightsText: string;
  achievementsText: string;
  articlesText: string;
  videosText: string;
  reviewsText: string;
  averageRating: number;
  visibility: DraftVisibility;
  sectionOrder: PublicSectionId[];
  sectionVisibility: Record<PublicSectionId, boolean>;
  publishedAt?: string;
}

export const practiceAreaOptions: PracticeArea[] = [
  "Criminal Law",
  "Civil Litigation",
  "Corporate Advisory",
  "Family Law",
  "Property Law",
  "Tax Law",
  "Arbitration"
];

export const languageOptions = ["English", "Telugu", "Hindi"];

export const contactChannelOptions: ContactChannel[] = ["chat", "call", "video"];

export const defaultSectionOrder: PublicSectionId[] = [
  "practiceAreas",
  "skills",
  "experience",
  "office",
  "contact",
  "portfolio",
  "reviews"
];

export const sectionLabels: Record<PublicSectionId, string> = {
  practiceAreas: "Practice areas",
  skills: "Skills",
  experience: "Experience",
  office: "Office and location",
  contact: "Contact options",
  portfolio: "Portfolio",
  reviews: "Ratings and reviews"
};

export const onboardingStorageKey = "lexevo-onboarding-draft";

export const defaultDraft: OnboardingDraft = {
  phoneOrEmail: "",
  otpVerified: false,
  fullName: "",
  headline: "",
  city: "",
  primaryLanguage: "English",
  experienceYears: 0,
  practiceAreas: [],
  officeAddress: "",
  about: "",
  profileHandle: "",
  customDomain: "",
  profileImageDataUrl: "",
  profileImageName: "",
  contactChannels: ["chat", "call"],
  contactEmail: "",
  contactPhone: "",
  liveLocationUrl: "",
  languagesText: "English",
  skillsText: "",
  courtsHandledText: "",
  firmHistoryText: "",
  caseHighlightsText: "",
  achievementsText: "",
  articlesText: "",
  videosText: "",
  reviewsText: "",
  averageRating: 4.8,
  visibility: {
    showPhone: false,
    showEmail: true,
    showOfficeAddress: true,
    showLiveLocation: false,
    showPortfolio: true,
    showCases: true,
    showReviews: true
  },
  sectionOrder: defaultSectionOrder,
  sectionVisibility: {
    practiceAreas: true,
    skills: true,
    experience: true,
    office: true,
    contact: true,
    portfolio: true,
    reviews: true
  }
};

export function slugifyHandle(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 32);
}

function normalizeSectionOrder(sectionOrder?: PublicSectionId[]) {
  const safeOrder = Array.isArray(sectionOrder)
    ? sectionOrder.filter((section): section is PublicSectionId => defaultSectionOrder.includes(section))
    : [];

  const missingSections = defaultSectionOrder.filter((section) => !safeOrder.includes(section));

  return [...safeOrder, ...missingSections];
}

function normalizeDraft(value: unknown): OnboardingDraft | null {
  if (!value || typeof value !== "object") {
    return null;
  }

  const partial = value as Partial<OnboardingDraft>;

  return {
    ...defaultDraft,
    ...partial,
    experienceYears:
      typeof partial.experienceYears === "number" && Number.isFinite(partial.experienceYears)
        ? partial.experienceYears
        : defaultDraft.experienceYears,
    averageRating:
      typeof partial.averageRating === "number" && Number.isFinite(partial.averageRating)
        ? partial.averageRating
        : defaultDraft.averageRating,
    practiceAreas: Array.isArray(partial.practiceAreas)
      ? partial.practiceAreas.filter((area): area is PracticeArea => practiceAreaOptions.includes(area as PracticeArea))
      : defaultDraft.practiceAreas,
    contactChannels: Array.isArray(partial.contactChannels)
      ? partial.contactChannels.filter(
          (channel): channel is ContactChannel => contactChannelOptions.includes(channel as ContactChannel)
        )
      : defaultDraft.contactChannels,
    visibility: {
      ...defaultDraft.visibility,
      ...partial.visibility
    },
    sectionOrder: normalizeSectionOrder(partial.sectionOrder),
    sectionVisibility: {
      ...defaultDraft.sectionVisibility,
      ...partial.sectionVisibility
    }
  };
}

export function parseList(value: string, separators: RegExp = /\r?\n/) {
  return value
    .split(separators)
    .map((entry) => entry.trim())
    .filter(Boolean);
}

export function parseCommaOrLineList(value: string) {
  return value
    .split(/[\r\n,]+/)
    .map((entry) => entry.trim())
    .filter(Boolean);
}

export function parseReviewEntries(value: string): DraftReviewEntry[] {
  return value
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [reviewer = "Client", role = "Client", quote = line, ratingText = "5"] = line.split("|").map((part) => part.trim());
      const numericRating = Number(ratingText);

      return {
        reviewer,
        role,
        quote,
        rating: Number.isFinite(numericRating) ? Math.max(1, Math.min(5, numericRating)) : 5
      };
    });
}

export function moveSection(sectionOrder: PublicSectionId[], section: PublicSectionId, direction: "up" | "down") {
  const index = sectionOrder.indexOf(section);

  if (index === -1) {
    return sectionOrder;
  }

  const targetIndex = direction === "up" ? index - 1 : index + 1;

  if (targetIndex < 0 || targetIndex >= sectionOrder.length) {
    return sectionOrder;
  }

  const nextOrder = [...sectionOrder];
  const [currentSection] = nextOrder.splice(index, 1);
  nextOrder.splice(targetIndex, 0, currentSection);
  return nextOrder;
}

export function readDraft() {
  if (typeof window === "undefined") {
    return null;
  }

  const rawValue = window.localStorage.getItem(onboardingStorageKey);

  if (!rawValue) {
    return null;
  }

  try {
    return normalizeDraft(JSON.parse(rawValue));
  } catch {
    return null;
  }
}

export function writeDraft(draft: OnboardingDraft) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(onboardingStorageKey, JSON.stringify(draft));
}

export function clearDraft() {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.removeItem(onboardingStorageKey);
}

export function withDerivedHandle(draft: OnboardingDraft) {
  const profileHandle = draft.profileHandle || slugifyHandle(draft.fullName);

  return {
    ...draft,
    profileHandle
  };
}
