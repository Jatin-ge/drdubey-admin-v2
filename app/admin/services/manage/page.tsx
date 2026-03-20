import AdminServices from "@/components/ui/admin-services";
import { db } from "@/lib/db";

const ManageVideo = async() => {

    const services = await db.services.findMany({
    })
    return ( <div>
        <h1 className="text-3xl font-bold mb-5 m-10">Manage Services</h1>
        <AdminServices services= {services}/>
    </div> );
}
 
export default ManageVideo;