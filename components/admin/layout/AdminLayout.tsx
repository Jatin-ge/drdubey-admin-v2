"use client";
import { useState, useEffect } from "react";
import { Menu } from "lucide-react";
import Sidebar from "./Sidebar";
import TopBar from "./TopBar";
import MobileDrawer from "./MobileDrawer";

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [followUpCount, setFollowUpCount] = useState(0);

  useEffect(() => {
    const stored = localStorage.getItem("sidebar-collapsed");
    if (stored === "true") setCollapsed(true);
  }, []);

  useEffect(() => {
    fetch("/api/followups?status=overdue")
      .then((r) => r.json())
      .then((data) => {
        setFollowUpCount(Array.isArray(data) ? data.length : 0);
      })
      .catch(() => {});
  }, []);

  const handleToggle = () => {
    const next = !collapsed;
    setCollapsed(next);
    localStorage.setItem("sidebar-collapsed", String(next));
  };

  return (
    <div
      style={{
        display: "flex",
        minHeight: "100vh",
        backgroundColor: "#f8fafc",
      }}
    >
      {/* Desktop sidebar */}
      <div className="hidden md:block">
        <Sidebar collapsed={collapsed} onToggle={handleToggle} />
      </div>

      {/* Mobile drawer */}
      <MobileDrawer
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
      />

      {/* Main content */}
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          minWidth: 0,
          overflow: "hidden",
        }}
      >
        {/* Mobile header */}
        <div
          className="md:hidden"
          style={{
            height: "48px",
            backgroundColor: "#0f172a",
            display: "flex",
            alignItems: "center",
            padding: "0 16px",
            gap: "12px",
            flexShrink: 0,
          }}
        >
          <button
            onClick={() => setMobileOpen(true)}
            style={{
              border: "none",
              background: "none",
              color: "white",
              cursor: "pointer",
              display: "flex",
              padding: "4px",
            }}
          >
            <Menu size={20} />
          </button>
          <span
            style={{ fontSize: "14px", fontWeight: "600", color: "white" }}
          >
            Dr. Dubay Admin
          </span>
        </div>

        {/* Desktop top bar */}
        <div className="hidden md:block">
          <TopBar followUpCount={followUpCount} />
        </div>

        {/* Page content */}
        <main style={{ flex: 1, overflowY: "auto", padding: "24px" }}>
          {children}
        </main>
      </div>
    </div>
  );
}
