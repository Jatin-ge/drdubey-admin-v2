import { DashboardPage } from "@/components/admin/dashboard/dashboard";
import DashboardToggle from "@/components/admin/dashboard/DashboardToggle";

export const dynamic = "force-dynamic";

const AdminPage = async () => {
  return (
    <DashboardToggle>
      <DashboardPage />
    </DashboardToggle>
  );
};

export default AdminPage;
