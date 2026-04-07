import { DiscoveryExplorer } from "../../../components/discovery-explorer";

export default function FindLawyersNearMePage() {
  return (
    <DiscoveryExplorer
      title="Lawyer near me."
      description="This local prototype defaults to Hyderabad as the near-me city, then lets the client switch cities and filters instantly."
      initialCity="Hyderabad"
      highlightLabel="Near-me landing page"
    />
  );
}

