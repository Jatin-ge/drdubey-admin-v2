import { currentProfile } from "@/lib/current-profile";
import { db } from "@/lib/db";
import { InitialProfile } from "@/lib/initial-profile";
import { redirect } from "next/navigation";
import { NextResponse } from "next/server";

export async function POST(
    req: Request,
    { params }: { params: { patientId: string } }
)

{  
  try{ 

    const { name, bill, mode  } = await req.json();
    const {patientId} = params;

    const payemnt  = await db.payments.create({
      data:{
        name, 
        userPaymentId: patientId,
        amount: bill,
        mode,
      }
})
      
      return NextResponse.json(payemnt);
  } catch (error) {
    console.log("[PAYMENT_CREATE]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
