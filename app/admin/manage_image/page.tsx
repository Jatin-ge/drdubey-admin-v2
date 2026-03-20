import AdminImage from "@/components/ui/admin-image";
import { db } from "@/lib/db";

const ManageImages = async() => {
    const images = await db.image.findMany({})
    return ( <div className="ml-4 ">
            <h1 className="text-3xl font-bold mb-5 m-10">Manage Images</h1>
            <AdminImage image={images}/>
    </div> );
}
 
export default ManageImages;