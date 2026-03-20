"use client"
import { YoutubePlayer } from "./video";
import { db } from "@/lib/db";
import { Button } from "./button";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import axios from "axios";
import Image from "next/image";

interface AdminImageProps{
    image: any  
}



const AdminImage = ({image}: AdminImageProps) => {
    const router = useRouter();
    console.log("images", image)
    const handleDelete = async (id: string) => {
        try{
            await axios.delete(`/api/uploadimage/${id}/delete`);
            toast.success("Image deleted successfully");
            router.refresh();
        }
        catch(error){
            console.log(error)
        }
    }
    
    return ( 
        <div className="p-4 min-h-screen">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {
           image.length === 0 ? <div className="text-center">No Images available</div> : image.map((item: any) => {
          return <div key={item.id}>
              <Image src={item.imageUrl} height={100} width={300} alt={item.title}/>
              <div className="flex flex-col space-x-3">
                  <span className="font-semibold px-3 my-2 text-zinc-500">{item.title}</span>
                  <span>{item.description}</span>
              </div>
            <Button onClick={() => handleDelete(item.id)} className="w-full mt-2" variant="destructive">
                Delete
            </Button>
          </div>;
        })}

        
      </div>
      
    </div>
     );
}
 
export default AdminImage;