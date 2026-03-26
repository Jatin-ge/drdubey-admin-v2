"use client";

import AdminLayout from "@/components/admin/layout/AdminLayout";
import PageTransition from "@/components/admin/layout/PageTransition";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AdminLayout>
      <PageTransition>{children}</PageTransition>
    </AdminLayout>
  );
}
