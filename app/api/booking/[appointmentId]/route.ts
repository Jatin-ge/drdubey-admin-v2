import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function PATCH(
    req: Request,
     { params }: { params: { appointmentId: string } }
)

{  
  try{ 
    const { title, body } = await req.json();


    const discussion  = await db.appointment.update({
        where:{
            id: params.appointmentId
        },
        data:{
            discussionTitle: title,
            discussionDescription: body
        
        }
})
      
      return NextResponse.json(discussion);
  } catch (error) {
    console.log("DISCUSSION_PATCH", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}