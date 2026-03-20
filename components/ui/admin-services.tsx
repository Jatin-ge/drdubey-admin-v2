"use client"
import { YoutubePlayer } from "./video";
import { db } from "@/lib/db";
import { Button } from "./button";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import axios from "axios";
import { Services } from "@prisma/client";
import Image from "next/image";

interface AdminYtProps{
    services: any  
}



const AdminServices = ({services}: AdminYtProps) => {
    const router = useRouter();
    const handleDelete = async (id: string) => {
        try{
            await axios.delete(`/api/services/${id}`);
            toast.success("Services deleted successfully");
            router.refresh();
        }
        catch(error){
            console.log(error)
        }
    }

    
    return ( 
      <div className="p-8">
      <h1 className="text-4xl font-bold mb-8">Services</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {/* @ts-ignore */}
        {services.map((service) => (
          <div
            key={service.id}
            className="bg-white shadow-md rounded-lg overflow-hidden"
          >
            <Image
              width={500} 
              height={500}
              src={service.image}
              alt={service.title}
              className="w-full h-48 object-cover"
            />
            <div className="p-6">
              <h2 className="text-2xl font-bold mb-2">Title: {service.title}</h2>
            <p className="text-gray-700 mb-6">Subtitle: {service.subtitle}</p>
              <p className="text-gray-500 mb-4">Slug: {service.slug}</p>
              {service.metaTitle && (
                <p className="text-gray-500 mb-2">
                  Meta Title: {service.metaTitle}
                </p>
              )}
              {service.metaDescription && (
                <p className="text-gray-500 mb-2">
                  Meta Description: {service.metaDescription}
                </p>
              )}
              {service.metaKeywords && (
                <p className="text-gray-500 mb-2">
                  Meta Keywords: {service.metaKeywords}
                </p>
              )}
              <div className="flex justify-end">
                <button
                  className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded mr-2"
                  onClick={() => router.push(`/admin/services/${service.id}`)}
                >
                  Edit
                </button>
                <button
                  className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded"
                  onClick={() => handleDelete(service.id)}
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
 
export default AdminServices;