import React from "react";
import Calendar from "@/components/Calendar/Calendar";
import { Day } from "@prisma/client";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { db } from "@/lib/db";

interface HomeProps {
  days: any;
  closedDays: { id: string; date: Date }[];
  city: string;
}

export const Booking = async ({ days, closedDays, city }: HomeProps) => {
  const appoinmentCity = await db.cities.findUnique({
    where: {
      name: city,
    },
    include: {
      appointments: true,
    },
  });
  return (
    <div className="">
      <div className="bg-gradient-to-r from-purple-200 via-indigo-300 to-blue-400 font-bold  mx-auto  min-h-screen my-auto rounded-b-2xl md:py-32">
        <div className="container mx-auto p-8 md:flex">
          <div className="md:w-1/2 md:pr-8 my-auto">
            <Image
              width={600}
              height={600}
              src={"/assets/images/img6.png"}
              alt="Book Your Appointment"
              className="max-w-full h-auto"
            />
          </div>
          <div className="md:w-1/2 ">
            <h1 className="text-4xl text-gray-800  font-bold mb-6 text-center">
              Book your Appointment in{" "}
              <span className="font-extrabold uppercase">{city}</span>
            </h1>
            <p className="hidden md:block text-lg md:text-xl md:mb-8 mx-4 md:ml-16">
              Book your appointment with us now and experience our exceptional
              services.
            </p>
            <div className="mx-auto">
              <Calendar
                days={days}
                closedDays={closedDays}
                city={city}
                appointments={appoinmentCity?.appointments}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
