import { PublishedDraftProfile } from "../../../components/published-draft-profile";

export default function DraftPreviewPage({
  params
}: {
  params: { handle: string };
}) {
  return <PublishedDraftProfile handle={params.handle} />;
}

