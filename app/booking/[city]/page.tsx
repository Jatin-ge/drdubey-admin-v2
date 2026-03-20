import Calendar from "@/components/Calendar/Calendar";
import { db } from "@/lib/db";
import React from "react";
import { format, formatISO } from "date-fns";
import { Day } from "@prisma/client";
import { currentProfile } from "@/lib/current-profile";
import { currentUser } from "@clerk/nextjs";
import { redirect, useParams } from "next/navigation";
import { InitialProfile } from "@/lib/initial-profile";
import { useRouter } from "next/navigation";
import { Booking } from "@/components/ui/booking";

const AppointmentPage = async ({ params }: { params: { city: string } }) => {
  const profile = await currentProfile();

  console.log("the city is ", params.city);

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
