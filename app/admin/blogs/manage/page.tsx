import Adminblogs from "@/components/ui/admin-blog";
import { db } from "@/lib/db";

const ManageVideo = async() => {

    const blogs = await db.blogs.findMany({
    })
    return ( <div>
        <h1 className="text-3xl font-bold mb-5 m-10">Manage Services</h1>
        <Adminblogs blogs={blogs}/>
    </div> );
}
 
export default ManageVideo;