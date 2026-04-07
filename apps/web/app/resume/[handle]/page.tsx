import { ResumeView } from "../../../components/resume-view";

export default function ResumePage({
  params
}: {
  params: { handle: string };
}) {
  return <ResumeView handle={params.handle} />;
}
