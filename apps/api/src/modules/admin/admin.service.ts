import { listDiscoveryCities, listProfileSummaries } from "../profiles/profile.service";

type AdminIdentity = {
  email: string;
  displayName: string;
};

const adminRoutes = [
  { label: "Health", path: "/api/health" },
  { label: "Admin overview", path: "/api/admin/overview" },
  { label: "Admin session", path: "/api/auth/admin/session" },
  { label: "Lawyer search", path: "/api/search/lawyers" },
  { label: "Profile detail", path: "/api/profiles/:handle" },
  { label: "Messages dashboard", path: "/api/communications/dashboard" },
  { label: "Workspace dashboard", path: "/api/workspace/dashboard" },
  { label: "AI overview", path: "/api/ai/overview" }
];

export function getAdminOverview(admin: AdminIdentity) {
  const lawyers = listProfileSummaries();
  const cities = listDiscoveryCities();
  const practiceAreas = Array.from(new Set(lawyers.flatMap((lawyer) => lawyer.practiceAreas))).sort();
  const averageRating = lawyers.reduce((total, lawyer) => total + lawyer.averageRating, 0) / Math.max(lawyers.length, 1);
  const averageConsultationFeeInr =
    lawyers.reduce((total, lawyer) => total + lawyer.consultationFeeInr, 0) / Math.max(lawyers.length, 1);

  return {
    generatedAt: new Date().toISOString(),
    admin,
    snapshot: {
      totalLawyers: lawyers.length,
      totalCities: cities.length,
      totalPracticeAreas: practiceAreas.length,
      liveApiRoutes: adminRoutes.length,
      averageRating: Number(averageRating.toFixed(1)),
      averageConsultationFeeInr: Math.round(averageConsultationFeeInr)
    },
    practiceAreas,
    cityCoverage: cities.map((city) => ({
      city,
      lawyers: lawyers.filter((lawyer) => lawyer.city === city).length
    })),
    lawyers: lawyers.map((lawyer) => ({
      handle: lawyer.handle,
      fullName: lawyer.fullName,
      city: lawyer.city,
      practiceAreas: lawyer.practiceAreas,
      averageRating: lawyer.averageRating,
      consultationFeeInr: lawyer.consultationFeeInr,
      responseTimeLabel: lawyer.responseTimeLabel
    })),
    routes: adminRoutes
  };
}
