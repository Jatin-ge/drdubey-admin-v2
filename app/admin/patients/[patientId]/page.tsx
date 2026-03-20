import { db } from "@/lib/db";

import Addpatient from "../../addpatient/page";

const BillboardPage = async ({ params }: { params: { patientId: string } }) => {
  const lead = await db.lead.findUnique({
    where: {
      id: params.patientId,
    },
  });

  if (lead === null) {
    return null;
  }

  return (
    <div className="flex-col">
      <div className="flex-1 space-y-4 p-8 pt-6">
        <Addpatient initialData={lead} type="lead" />
      </div>
    </div>
  );
};

export default BillboardPage;
