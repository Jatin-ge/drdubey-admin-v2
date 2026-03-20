import { db } from "@/lib/db";
import { NextResponse } from "next/server";


export async function DELETE(
    req: Request,
    {params}: {params: {blogId: string}}
){
    try{
        console.log("params", params.blogId)
        if(!params.blogId){
            return new NextResponse("blog Id missing", {status: 400})
        }

        const deletedblog = await db.blogs.delete({
            where:{
                id: params.blogId,
            },
        })

        return NextResponse.json(deletedblog);
    }
    catch(err){
        console.log("DELTE_blog", err);
        return new NextResponse("Internal lead error", {status: 500})
    }
}
export async function PUT(
    req: Request,
    {params}: {params: {blogId: string}}
){
    const values =  await req.json();
    
    try{
        console.log("params", values)
        if(!params.blogId){
            return new NextResponse("blog Id missing", {status: 400})
        }

        const updateblog = await db.blogs.update({
            where:{
                id: params.blogId,
            },
            data: values
        })

        return NextResponse.json(updateblog);
    }
    catch(err){
        console.log("Update_blog", err);
        return new NextResponse("Internal lead error", {status: 500})
    }
}
// http://localhost:3000/api/youtube/65871438bfe51098bf20418b/delete