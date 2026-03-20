import { db } from "@/lib/db";
import { v4 as uuidv4 } from 'uuid';
import { NextResponse } from "next/server";
import {differenceInYears} from "date-fns"

export async function POST(
    req: Request,
){
    try{

        const data = await req.json();;    
        
        console.log("DATA", data);

        const Lead = await db.lead.createMany({
            data
        })

        return NextResponse.json(Lead); 

    
    }
    catch(err){
        console.log("PATIENT_CREATE", err)
        return new NextResponse("Internal server error" , {status: 500})
    }
}

