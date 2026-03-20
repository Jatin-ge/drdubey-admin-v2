import { format } from "date-fns";

import { db } from "@/lib/db";

import { AppointMentCloumn } from "./components/column";
import { BillboardClient } from "./components/client";

const BillboardsPage = async ({ params }: { params: { storeId: string } }) => {
  const appointments = await db.appointment.findMany({
    include: {
      user: true,
    },

    orderBy: {
      createdAt: "desc",
    },
  });

  const formattedAppointmentCloumn: AppointMentCloumn[] = appointments.map(
    (item) => ({
      id: item.id,
      name: item.name,
      gender: item.gender,
      phone: item.phone,
      address: item.address,
      age: item.age,
      date: item.date,
      time: item.time,
      email: item.user.email || null,
      userId: item.userId,
      city: item.cityname,
    })
  );

  return (
    <div className="flex-col">
      <div className="flex-1 space-y-4 p-8 pt-6">
        <BillboardClient data={formattedAppointmentCloumn} />
      </div>
    </div>
  );
};

export default BillboardsPage;
