import type { LawyerProfile, LawyerProfileSummary } from "@lexevo/contracts";

export const featuredLawyers: LawyerProfileSummary[] = [
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
    leadOffer: "Free introductory lead window active for new high-response profile.",
    responseTimeLabel: "~15 min"
  },
  {
    handle: "arjun-mehta-counsel",
    fullName: "Arjun Mehta",
    headline: "Corporate, startup, and cross-border advisory counsel",
    city: "Bengaluru",
    experienceYears: 14,
    practiceAreas: ["Corporate Advisory", "Tax Law", "Arbitration"],
    languages: ["English", "Hindi"],
    courtsHandled: ["NCLT Bengaluru", "Karnataka High Court", "Private arbitration panels"],
    consultationFeeInr: 4000,
    averageRating: 4.8,
    featuredReview: "Moves fast without losing legal depth.",
    leadOffer: "Founder advisory lead boost active for fast qualification.",
    responseTimeLabel: "~30 min"
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
    leadOffer: "Priority intake queue active for sensitive family matters.",
    responseTimeLabel: "~20 min"
  }
];

export const profileByHandle: Record<string, LawyerProfile> = {
  "adv-isha-reddy": {
    ...featuredLawyers[0],
    bio: "I help founders, families, and public-facing professionals navigate criminal complaints, anticipatory bail, and constitutional remedies with disciplined case strategy and strong communication.",
    officeAddress: "Banjara Hills, Hyderabad",
    courtsHandled: ["High Court of Telangana", "Nampally Criminal Courts"],
    skills: ["Bail strategy", "Cross-examination", "Writ drafting", "Client crisis response"],
    contactChannels: ["chat", "call", "video"],
    achievements: [
      "Handled 180+ urgent criminal matters",
      "Guest speaker on due-process awareness",
      "Published on anticipatory bail jurisprudence"
    ],
    portfolio: [
      {
        title: "Land dispute turned criminal complaint",
        type: "case",
        summary: "Coordinated civil and criminal defense strategy to stabilize the dispute before trial escalation."
      },
      {
        title: "Citizen rights after arrest",
        type: "article",
        summary: "Plain-language explainer designed for first-time legal consumers."
      },
      {
        title: "Litigation readiness checklist",
        type: "achievement",
        summary: "Internal workflow now reused by a network of junior associates."
      }
    ],
    reviews: [
      {
        reviewer: "Rohan S.",
        role: "Founder",
        quote: "She gave immediate structure to a chaotic situation and stayed available when the matter was time sensitive.",
        rating: 5
      },
      {
        reviewer: "Priyanka V.",
        role: "Private client",
        quote: "Clear, composed, and practical at every stage.",
        rating: 5
      }
    ],
    availability: [
      { day: "Mon", slots: ["10:00", "14:00", "18:30"] },
      { day: "Wed", slots: ["11:30", "16:00"] },
      { day: "Sat", slots: ["09:30", "12:30"] }
    ],
    visibility: {
      showPhone: false,
      showEmail: true,
      showOfficeAddress: true,
      showLiveLocation: false,
      showPortfolio: true
    }
  },
  "arjun-mehta-counsel": {
    ...featuredLawyers[1],
    bio: "I structure growth-stage deals, founder documentation, tax-sensitive commercial contracts, and arbitration playbooks for companies operating across India and the Gulf.",
    officeAddress: "Indiranagar, Bengaluru",
    courtsHandled: ["NCLT Bengaluru", "Karnataka High Court", "Private arbitration panels"],
    skills: ["Term sheets", "Commercial contracts", "Founder governance", "Risk mapping"],
    contactChannels: ["chat", "video"],
    achievements: [
      "Supported 65+ venture and strategic transactions",
      "Fractional legal counsel to growth-stage startups",
      "Built contract playbooks for SaaS exports"
    ],
    portfolio: [
      {
        title: "Cross-border SaaS compliance framework",
        type: "case",
        summary: "Aligned customer contracts, DP clauses, and tax posture for an outbound SaaS company."
      },
      {
        title: "Founder control rights in early financing",
        type: "article",
        summary: "Explains practical tradeoffs rather than generic legal theory."
      }
    ],
    reviews: [
      {
        reviewer: "Aakriti J.",
        role: "Startup COO",
        quote: "Fast turnaround, high commercial awareness, and no vague advice.",
        rating: 5
      }
    ],
    availability: [
      { day: "Tue", slots: ["09:00", "13:00", "17:00"] },
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
  "naina-kapoor-familylaw": {
    ...featuredLawyers[2],
    bio: "I represent clients in family, maintenance, custody, and property-linked disputes with a negotiation-first lens and strong documentation discipline.",
    officeAddress: "South Extension, Delhi",
    courtsHandled: ["Family Court Saket", "Delhi High Court"],
    skills: ["Mediation", "Settlement structuring", "Custody planning", "Property documentation"],
    contactChannels: ["chat", "call", "video"],
    achievements: [
      "Led 120+ negotiated family settlements",
      "Runs legal literacy sessions for women founders",
      "Known for sensitive-client intake workflows"
    ],
    portfolio: [
      {
        title: "Custody and relocation negotiation",
        type: "case",
        summary: "Designed a phased parenting and relocation structure that avoided prolonged contested litigation."
      },
      {
        title: "What to prepare before filing for divorce",
        type: "video",
        summary: "A short educational explainer for first-time clients."
      }
    ],
    reviews: [
      {
        reviewer: "Anonymous",
        role: "Private client",
        quote: "She combined empathy with meticulous preparation, which mattered enormously.",
        rating: 5
      }
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
};
