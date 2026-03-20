import { db } from "@/lib/db";
import { NextResponse } from "next/server";


export async function DELETE(
    req: Request,
    {params}: {params: {youtubeID: string}}
){
    console.log("params", params)
    try{
        console.log("params", params.youtubeID)
        if(!params.youtubeID){
            return new NextResponse("Video Id missing", {status: 400})
        }

        const deletedVideo = await db.youTube.delete({
            where:{
                id: params.youtubeID,
            },
        })

        return NextResponse.json(deletedVideo);
    }
    catch(err){
        console.log("DELTE_YT", err);
        return new NextResponse("Internal lead error", {status: 500})
    }
}
// http://localhost:3000/api/youtube/65871438bfe51098bf20418b/delete