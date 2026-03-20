
import { DashboardPage } from "@/components/admin/dashboard/dashboard";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

const AdminPage = async() => {
  return ( 
    <>
      <DashboardPage/>
    </>
   );
}
 
export default AdminPage;