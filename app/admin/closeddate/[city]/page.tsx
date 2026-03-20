import { db } from "@/lib/db";
import { Day } from "@prisma/client";
import ClosingDate from "@/components/ClosingDate/ClosingDate";
import EditableTable from "@/components/EditableTable/EditableTable";

interface HomeProps {
  days: Day[];
  closedDays: { id: string; date: Date }[];
}

const page = async ({ params }: { params: { city: string } }) => {
  const days = await db.day.findMany({
    where: {
      cityname: params.city,
    },
  });

  const closedDay = await db.closedDay.findMany({
    where: {
      cityname: params.city,
    },
  });

  const city = params.city;
  return (
    <div>
      <div className="font-bold text-4xl md:text-6xl text-center text-gray-600 my-8  uppercase">
        {city}
      </div>
      <div className="lg:flex  ">
        <EditableTable days={days} />
        <ClosingDate closedDays={closedDay} city={city} />
      </div>
    </div>
  );
};

export default page;
