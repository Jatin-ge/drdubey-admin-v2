import { currentProfile } from "@/lib/current-profile";
import { db } from "@/lib/db";
import { InitialProfile } from "@/lib/initial-profile";
import { redirect } from "next/navigation";
import { NextResponse } from "next/server";

export async function POST(
    req: Request,
)

{  
  try{ 

    const {fullNameInput, emailInput, messageInput} = await req.json();

    const contact  = await db.contactUs.create({
      data:{
        name: fullNameInput,
        email: emailInput,
        message: messageInput,
      }
})
      
      return NextResponse.json(contact);
  } catch (error) {
    console.log("[CHANNEL_ID_DELETE]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
