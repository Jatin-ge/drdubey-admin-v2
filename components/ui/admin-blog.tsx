"use client"
import { YoutubePlayer } from "./video";
import { db } from "@/lib/db";
import { Button } from "./button";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import axios from "axios";
import Image from "next/image";

interface AdminYtProps{
    blogs: any  
}



const Adminblogs = ({blogs}: AdminYtProps) => {
    const router = useRouter();
    const handleDelete = async (id: string) => {
        try{
            await axios.delete(`/api/blogs/${id}`);
            toast.success("Blog deleted successfully");
            router.refresh();
        }
        catch(error){
            console.log(error)
        }
    }

    
    return ( 
<div className="p-8">
      <h1 className="text-4xl font-bold mb-8">Blogs</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
         {/* @ts-ignore */}
        {blogs.map((blog) => (
          <div
            key={blog.id}
            className="bg-white shadow-md rounded-lg overflow-hidden"
          >
            <div className="relative w-full h-48">
              <Image
                src={blog.image1}
                alt={blog.title}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />
            </div>
            <div className="p-6">
              <h2 className="text-2xl font-bold mb-2">{blog.title}</h2>
              <p className="text-gray-600 mb-4">{blog.subtitle1}</p>
              <p className="text-gray-700 mb-6">{blog.content1}</p>
              {blog.slug && <p className="text-gray-500 mb-4">Slug: {blog.slug}</p>}
              {blog.subtitle2 && (
                <p className="text-gray-600 mb-4">{blog.subtitle2}</p>
              )}
              {blog.content2 && (
                <p className="text-gray-700 mb-6">{blog.content2}</p>
              )}
              {blog.image2 && (
                <div className="relative w-full h-48 mb-4">
                  <Image
                    src={blog.image2}
                    alt={blog.title}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  />
                </div>
              )}
              {blog.metaTitle && (
                <p className="text-gray-500 mb-2">Meta Title: {blog.metaTitle}</p>
              )}
              {blog.metaDescription && (
                <p className="text-gray-500 mb-2">
                  Meta Description: {blog.metaDescription}
                </p>
              )}
              {blog.metaKeywords && (
                <p className="text-gray-500 mb-2">
                  Meta Keywords: {blog.metaKeywords}
                </p>
              )}
              <div className="flex justify-end">
                <button
                  className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded mr-2"
                   onClick={() => router.push(`/admin/blogs/${blog.id}`)}
                >
                  Edit
                </button>
                <button
                  className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded"
                  onClick={() => handleDelete(blog.id)}
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
     );
}
 
export default Adminblogs;