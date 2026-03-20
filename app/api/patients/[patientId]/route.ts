import { db } from "@/lib/db";
import { v4 as uuidv4 } from 'uuid';
import { NextResponse } from "next/server";


export async function PATCH  (
    req:Request,
    {params}: {params: {patientId: string}}
) {
    try{

        const { name, email, phone, gender, address , remark, age, doad, dood, dx, surgery, side, ipdReg, bill, implant, patientStatus, tpa, cities, hospital } = await req.json();

        // Validate and normalize phone to exactly 10 digits
        const digitsOnly = (String(phone || '').match(/\d/g) || []).join('');
        if (digitsOnly.length !== 10) {
            return new NextResponse("Invalid phone number. Must be 10 digits.", { status: 400 });
        }

        

        const lead = await db.lead.update({
            where: {
                id: params.patientId,
            },
            data:{
                name,
                email, 
                phone: digitsOnly, 
                gender, 
                address, 
                remark ,  
                age,
                doad,
                dood, 
                dx, 
                surgery,
                side,
                ipdReg,
                bill,
                implant, 
                patientStatus,
                tpa,
                cities,
                hospital
                
            }
    })

    return NextResponse.json(lead);

    }
    catch(err){
      
        return new NextResponse("Internal error", {status: 500})
    }

}