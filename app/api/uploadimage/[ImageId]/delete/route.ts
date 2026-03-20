import { db } from "@/lib/db";
import { NextResponse } from "next/server";


export async function DELETE(
    req: Request,
    {params}: {params: {ImageId: string}}
){
    console.log("params", params)
    try{
        if(!params.ImageId){
            return new NextResponse("Image Id missing", {status: 400})
        }

        const deletedImage = await db.image.delete({
            where:{
                id: params.ImageId,
            },
        })

        return NextResponse.json(deletedImage);
    }
    catch(err){
        console.log("DELTE_IMAGE", err);
        return new NextResponse("Internal lead error", {status: 500})
    }
}
// http://localhost:3000/api/youtube/65871438bfe51098bf20418b/delete