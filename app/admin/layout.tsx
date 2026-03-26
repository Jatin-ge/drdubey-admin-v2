"use client";

import AdminNav from "@/components/admin/AdminNav";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      <AdminNav />
      <main style={{ flex: 1, backgroundColor: "#f8fafc", overflowY: "auto" }}>
        {children}
      </main>
    </div>
  );
}
