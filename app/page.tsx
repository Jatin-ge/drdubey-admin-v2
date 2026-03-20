import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

const AdminPage = async () => {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/sign-in");
  redirect("/admin");
};

export default AdminPage;
