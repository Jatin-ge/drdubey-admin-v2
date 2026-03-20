import { db } from "@/lib/db";
import { currentProfile } from "@/lib/current-profile";
import { redirect } from "next/navigation";
import { Booking } from "@/components/ui/booking";

const AppointmentPage = async ({ params }: { params: { city: string } }) => {
  const profile = await currentProfile();

  if (!profile) {
    return redirect("/sign-in");
  }
  const city = await db.cities.findUnique({
    where: {
      name: params.city,
    },
    include: {
      closeddays: true,
      days: true,
    },
  });

  if (!city) {
    return <div>City not Availiable we will be coming soon to ur city</div>;
  }

  return (
    <Booking closedDays={city.closeddays} days={city.days} city={params.city} />
  );
};

export default AppointmentPage;
