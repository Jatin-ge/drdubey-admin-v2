import AdminYt from "@/components/ui/admin-yt";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

const ManageVideo = async() => {
    let youtube: any[] = [];
    try {
        youtube = await db.youTube.findMany({
            orderBy:{ createdAt: "desc" }
        });
    } catch {
        youtube = [];
    }
    return ( <div>
        <h1 className="text-3xl font-bold mb-5 m-10">Manage Videos</h1>
        <AdminYt youtube={youtube} />
    </div> );
}
 
export default ManageVideo;