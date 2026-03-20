
import React from 'react';

import { db } from '@/lib/db';
import Receipt from '@/components/ui/receipt';

const PaymentReceipt = async({ params }: { params: { patientId: string } }) => {

        const payment = await db.lead.findUnique({
          where: {
            id: params.patientId,
          },
        });




  

  if (!payment) {
    return (
      <div>
        <h1>Payment not found</h1>
      </div>
    );
  }

  return (
    <Receipt payment={payment}/>
  );
};

export default PaymentReceipt;
