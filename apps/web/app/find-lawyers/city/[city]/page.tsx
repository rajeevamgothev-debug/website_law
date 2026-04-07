import { DiscoveryExplorer } from "../../../../components/discovery-explorer";

export default function CityLawyerPage({
  params
}: {
  params: { city: string };
}) {
  const city = decodeURIComponent(params.city);

  return (
    <DiscoveryExplorer
      title={`Find lawyers in ${city}.`}
      description={`SEO-style city landing page for ${city} with direct consultation conversion paths, budget filtering, and court/language matching.`}
      initialCity={city}
      highlightLabel="City discovery page"
    />
  );
}
