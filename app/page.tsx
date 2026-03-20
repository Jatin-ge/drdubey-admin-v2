import LoginForm from "@/components/LoginForm";
import { DashboardPage } from "@/components/admin/dashboard/dashboard";
import Navbar from "@/components/admin/dashboard/navabar";
import { db } from "@/lib/db";
const AdminPage = async () => {
  const adminData = await db.adminProfile.findMany();

  console.log("the admin data is ", adminData);

  const name = adminData[0].userName;
  const pass = adminData[0].password;

  return (
    <>
      <LoginForm Name={name} Pass={pass} />
      {/* <Navbar />
      <DashboardPage /> */}
    </>
  );
};

export default AdminPage;
