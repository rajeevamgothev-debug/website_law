import type { DirectorySearchFilters, LawyerProfile, LawyerProfileSummary } from "@lexevo/contracts";

const profiles: LawyerProfile[] = [
  {
    handle: "adv-isha-reddy",
    fullName: "Adv. Isha Reddy",
    headline: "High-stakes criminal defense and constitutional strategy",
    city: "Hyderabad",
    experienceYears: 11,
    practiceAreas: ["Criminal Law", "Civil Litigation"],
    languages: ["English", "Telugu", "Hindi"],
    courtsHandled: ["High Court of Telangana", "Nampally Criminal Courts"],
    consultationFeeInr: 2500,
    averageRating: 4.9,
    featuredReview: "Calm under pressure and precise in urgent matters.",
    leadOffer: "New profile boost: first 3 incoming leads prioritized for reply within 15 minutes.",
    responseTimeLabel: "~15 min",
    bio: "I help clients respond to urgent criminal exposure, complaint escalation, and due-process violations with disciplined litigation strategy.",
    officeAddress: "Banjara Hills, Hyderabad",
    skills: ["Bail strategy", "Writ drafting", "Cross-examination"],
    contactChannels: ["chat", "call", "video"],
    portfolio: [
      {
        title: "Urgent bail strategy for business founder",
        type: "case",
        summary: "Stabilized a multi-forum dispute before arrest escalation."
      }
    ],
    reviews: [
      {
        reviewer: "Rohan S.",
        role: "Founder",
        quote: "Calm, responsive, and exact under time pressure.",
        rating: 5
      }
    ],
    achievements: [
      "Handled 180+ urgent criminal matters",
      "Published rights-awareness explainers"
    ],
    availability: [
      { day: "Mon", slots: ["10:00", "14:00"] },
      { day: "Wed", slots: ["11:30", "16:00"] }
    ],
    visibility: {
      showPhone: false,
      showEmail: true,
      showOfficeAddress: true,
      showLiveLocation: false,
      showPortfolio: true
    }
  },
  {
    handle: "arjun-mehta-counsel",
    fullName: "Arjun Mehta",
    headline: "Corporate, startup, and cross-border advisory counsel",
    city: "Bengaluru",
    experienceYears: 14,
    practiceAreas: ["Corporate Advisory", "Tax Law", "Arbitration"],
    languages: ["English", "Hindi"],
    courtsHandled: ["NCLT Bengaluru", "Karnataka High Court"],
    consultationFeeInr: 4000,
    averageRating: 4.8,
    featuredReview: "Moves fast without losing legal depth.",
    leadOffer: "Founder-focused discovery push: consultation request includes pre-structured briefing intake.",
    responseTimeLabel: "~30 min",
    bio: "I support growth-stage companies with financing documents, commercial contracting, and arbitration-first risk strategy.",
    officeAddress: "Indiranagar, Bengaluru",
    skills: ["Commercial contracts", "Founder governance", "Risk mapping"],
    contactChannels: ["chat", "video"],
    portfolio: [
      {
        title: "SaaS export contract framework",
        type: "case",
        summary: "Aligned cross-border contracting, compliance, and tax posture."
      }
    ],
    reviews: [
      {
        reviewer: "Aakriti J.",
        role: "Startup COO",
        quote: "Commercially sharp and consistently fast.",
        rating: 5
      }
    ],
    achievements: [
      "Supported 65+ venture and strategic transactions"
    ],
    availability: [
      { day: "Tue", slots: ["09:00", "13:00"] },
      { day: "Thu", slots: ["10:00", "15:00"] }
    ],
    visibility: {
      showPhone: false,
      showEmail: true,
      showOfficeAddress: true,
      showLiveLocation: false,
      showPortfolio: true
    }
  },
  {
    handle: "naina-kapoor-familylaw",
    fullName: "Naina Kapoor",
    headline: "Discreet family law representation with negotiation focus",
    city: "Delhi",
    experienceYears: 9,
    practiceAreas: ["Family Law", "Property Law"],
    languages: ["English", "Hindi", "Punjabi"],
    courtsHandled: ["Family Court Saket", "Delhi High Court"],
    consultationFeeInr: 2200,
    averageRating: 4.9,
    featuredReview: "Balanced empathy with very sharp courtroom prep.",
    leadOffer: "Client-intake fast lane: new family law inquiries routed with WhatsApp acknowledgment copy.",
    responseTimeLabel: "~20 min",
    bio: "I represent clients in family, custody, maintenance, and property-linked disputes with negotiation discipline and careful documentation.",
    officeAddress: "South Extension, Delhi",
    skills: ["Mediation", "Settlement structuring", "Custody planning"],
    contactChannels: ["chat", "call", "video"],
    portfolio: [
      {
        title: "Custody and relocation settlement design",
        type: "case",
        summary: "Structured a phased parenting and relocation framework that avoided prolonged litigation."
      }
    ],
    reviews: [
      {
        reviewer: "Anonymous",
        role: "Private client",
        quote: "Sensitive, prepared, and unambiguous in strategy.",
        rating: 5
      }
    ],
    achievements: [
      "Led 120+ negotiated family settlements"
    ],
    availability: [
      { day: "Mon", slots: ["12:00", "17:00"] },
      { day: "Fri", slots: ["10:30", "16:30"] }
    ],
    visibility: {
      showPhone: false,
      showEmail: true,
      showOfficeAddress: true,
      showLiveLocation: false,
      showPortfolio: true
    }
  }
];

export function listProfileSummaries(filters: DirectorySearchFilters = {}): LawyerProfileSummary[] {
  const courtFilter = filters.court?.toLowerCase();

  return profiles
    .filter((profile) => {
      if (filters.query) {
        const haystack = [
          profile.fullName,
          profile.headline,
          profile.city,
          ...profile.practiceAreas,
          ...profile.languages,
          ...profile.courtsHandled
        ]
          .join(" ")
          .toLowerCase();

        if (!haystack.includes(filters.query.toLowerCase())) {
          return false;
        }
      }

      if (filters.city && profile.city.toLowerCase() !== filters.city.toLowerCase()) {
        return false;
      }

      if (filters.practiceArea && !profile.practiceAreas.includes(filters.practiceArea)) {
        return false;
      }

      if (courtFilter && !profile.courtsHandled.some((court) => court.toLowerCase().includes(courtFilter))) {
        return false;
      }

      if (
        filters.language &&
        !profile.languages.some((language) => language.toLowerCase() === filters.language?.toLowerCase())
      ) {
        return false;
      }

      if (
        typeof filters.maxConsultationFeeInr === "number" &&
        profile.consultationFeeInr > filters.maxConsultationFeeInr
      ) {
        return false;
      }

      return true;
    })
    .map(({ bio, officeAddress, skills, contactChannels, portfolio, reviews, achievements, availability, visibility, ...summary }) => summary);
}

export function findProfileByHandle(handle: string): LawyerProfile | undefined {
  return profiles.find((profile) => profile.handle === handle);
}

export function listDiscoveryCities() {
  return Array.from(new Set(profiles.map((profile) => profile.city))).sort();
}
