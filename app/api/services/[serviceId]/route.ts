import { db } from "@/lib/db";
import { NextResponse } from "next/server";


export async function DELETE(
    req: Request,
    {params}: {params: {serviceId: string}}
){
    try{
        console.log("params", params.serviceId)
        if(!params.serviceId){
            return new NextResponse("service Id missing", {status: 400})
        }

        const deletedService = await db.services.delete({
            where:{
                id: params.serviceId,
            },
        })

        return NextResponse.json(deletedService);
    }
    catch(err){
        console.log("DELTE_SERVICE", err);
        return new NextResponse("Internal lead error", {status: 500})
    }
}
export async function PUT(
    req: Request,
    {params}: {params: {serviceId: string}}
){
    const values =  await req.json();
    
    try{
        console.log("params", values)
        if(!params.serviceId){
            return new NextResponse("Service Id missing", {status: 400})
        }

        const updateService = await db.services.update({
            where:{
                id: params.serviceId,
            },
            data: values
        })

        return NextResponse.json(updateService);
    }
    catch(err){
        console.log("Update_SERVICE", err);
        return new NextResponse("Internal lead error", {status: 500})
    }
}
// http://localhost:3000/api/youtube/65871438bfe51098bf20418b/delete