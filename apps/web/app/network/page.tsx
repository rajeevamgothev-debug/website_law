import { SocialHub } from "../../components/social-hub";

function readString(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] ?? "" : value ?? "";
}

function readContentType(value: string | string[] | undefined) {
  const candidate = readString(value);

  if (candidate === "text" || candidate === "image" || candidate === "video") {
    return candidate;
  }

  return "";
}

export default function NetworkPage({
  searchParams
}: {
  searchParams?: Record<string, string | string[] | undefined>;
}) {
  return (
    <SocialHub
      title="Legal social feed built for authority, not noise."
      description="Phase 3 adds audience-building to Lexevo: lawyers can publish posts, short legal tip videos, follow each other, and convert public expertise into profile traffic and consultation intent."
      highlightLabel="Phase 3 social layer"
      initialAuthorHandle={readString(searchParams?.author)}
      initialContentType={readContentType(searchParams?.contentType)}
      initialHashtag={readString(searchParams?.hashtag)}
    />
  );
}
