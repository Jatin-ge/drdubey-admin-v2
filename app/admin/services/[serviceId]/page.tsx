import { db } from "@/lib/db";

import Services from "../page";
const BillboardPage = async ({ params }: { params: { serviceId: string } }) => {
  const service = await db.services.findUnique({
    where: {
      id: params.serviceId,
    },
  });

  if (service === null) {
    return null;
  }

  return (
    <div className="flex-col">
      <div className="flex-1 space-y-4 p-8 pt-6">
        <Services initialData={service} />
      </div>
    </div>
  );
};

export default BillboardPage;
