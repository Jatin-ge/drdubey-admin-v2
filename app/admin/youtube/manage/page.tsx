import AdminYt from "@/components/ui/admin-yt";
import { db } from "@/lib/db";

const ManageVideo = async() => {

    const youtube = await db.youTube.findMany({
        orderBy:{
            createdAt: "desc"
        }
    })
    return ( <div>
        <h1 className="text-3xl font-bold mb-5 m-10">Manage Videos</h1>
        <AdminYt youtube={youtube} />
    </div> );
}
 
export default ManageVideo;