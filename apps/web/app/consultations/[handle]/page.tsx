import { ConsultationBookingForm } from "../../../components/consultation-booking-form";

export default function ConsultationPage({
  params
}: {
  params: { handle: string };
}) {
  return <ConsultationBookingForm handle={params.handle} />;
}
