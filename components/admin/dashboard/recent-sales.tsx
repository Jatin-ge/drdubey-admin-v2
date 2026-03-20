import { UserAvatar } from "@/components/ui/user-avatar";
import { db } from "@/lib/db";
import { User } from "@clerk/nextjs/server";
import { format } from "date-fns";
import Link from "next/link";

export const RecentSales = async () => {
  const appointments = await db.appointment.findMany({
    include: {
      user: {
        select: {
          email: true,
          imageUrl: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  const today = new Date();

  const todayFormatted = format(today, "dd-MM-yyyy");
  const todayAppointments = appointments.filter(
    (appointment) => appointment.date === todayFormatted
  );

  return (
    <div className="space-y-8">
      <div className="flex items-center font-bold text-xl">
        <div className="ml-4 space-y-1">
          <p className=" font-medium leading-none">Patient Name</p>
        </div>
        <div className="ml-auto font-medium">Date</div>
        <div className="ml-auto font-medium">Time</div>
      </div>
      <hr />
      {todayAppointments.map((appointment) => (
        <Link
          href={`/admin/appointment/${appointment.userId}`}
          className="flex items-center"
          key={appointment.id}
        >
          <UserAvatar
            src={appointment.user.imageUrl}
            className="flex-shrink-0 h-10 w-10 rounded-full"
          />
          <div className="ml-4 space-y-1">
            <p className="text-sm font-medium leading-none">
              {appointment.name}
            </p>
          </div>
          <div className="ml-auto font-medium">{appointment.date}</div>
          <div className="ml-auto font-medium">{appointment.time}</div>
        </Link>
      ))}
    </div>
  );
};
