import { db } from "@/lib/db";

import Addpatient from "../../addpatient/page";
import WhatsAppButton from "@/components/admin/patients/WhatsAppButton";

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
        {lead.phone && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '12px 16px',
            backgroundColor: 'white',
            borderRadius: '10px',
            border: '1px solid #e2e8f0',
            marginBottom: '4px',
          }}>
            <span style={{ fontSize: '14px', color: '#64748b' }}>
              📞 {lead.phone}
            </span>
            <WhatsAppButton
              phone={lead.phone}
              patientName={lead.name}
            />
            <a
              href={`tel:${lead.phone}`}
              style={{
                padding: '7px 14px',
                borderRadius: '7px',
                border: '1px solid #e2e8f0',
                backgroundColor: 'white',
                fontSize: '13px',
                color: '#374151',
                textDecoration: 'none',
                fontWeight: '500',
              }}
            >
              📞 Call
            </a>
          </div>
        )}
        <Addpatient initialData={lead} type="lead" />
      </div>
    </div>
  );
};

export default BillboardPage;
