"use client"
import { YoutubePlayer } from "./video";
import { db } from "@/lib/db";
import { Button } from "./button";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import axios from "axios";

interface AdminYtProps{
    youtube: any  
}



const AdminYt = ({youtube}: AdminYtProps) => {
    const router = useRouter();
    const handleDelete = async (id: string) => {
        try{
            await axios.delete(`/api/youtube/${id}/delete`);
            toast.success("Video deleted successfully");
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
           youtube.length === 0 ? <div className="text-center">No videos available</div> : youtube.map((item: any) => {
          return <div key={item.id}>
              <YoutubePlayer url={item.link} />
            <Button onClick={() => handleDelete(item.id)} className="w-full mt-2" variant="destructive">
                Delete
              </Button>
          </div>;
        })}

        
      </div>
      
    </div>
     );
}
 
export default AdminYt;