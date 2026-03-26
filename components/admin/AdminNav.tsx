"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  BarChart3,
  Users,
  Calendar,
  Bell,
  Ticket,
  Receipt,
  Trophy,
  FileText,
  Layers,
  Image,
  Activity,
  Youtube,
  LogOut,
} from "lucide-react";

const navSections = [
  {
    label: "OVERVIEW",
    items: [
      { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
      { href: "/admin/analytics", label: "Analytics", icon: BarChart3 },
    ],
  },
  {
    label: "PATIENTS",
    items: [
      { href: "/admin/patients", label: "All Patients", icon: Users },
      { href: "/admin/appointment", label: "Appointments", icon: Calendar },
      { href: "/admin/followups", label: "Follow-Ups", icon: Bell },
      { href: "/admin/tokens", label: "OPD Tokens", icon: Ticket },
      { href: "/admin/billing", label: "Billing", icon: Receipt },
    ],
  },
  {
    label: "WEBSITE CONTENT",
    items: [
      { href: "/admin/achievements", label: "Achievements", icon: Trophy },
      { href: "/admin/blogs", label: "Blog Posts", icon: FileText },
      { href: "/admin/services", label: "Services", icon: Layers },
      { href: "/admin/manage_image", label: "Gallery", icon: Image },
      { href: "/admin/events", label: "Events", icon: Activity },
      { href: "/admin/youtube", label: "YouTube", icon: Youtube },
    ],
  },
];

export default function AdminNav() {
  const pathname = usePathname();

  const handleSignOut = () => {
    localStorage.removeItem("isLoggedIn");
    window.location.href = "/sign-in";
  };

  return (
    <aside
      style={{
        width: 240,
        minHeight: "100vh",
        backgroundColor: "#0f172a",
        display: "flex",
        flexDirection: "column",
        position: "sticky",
        top: 0,
        height: "100vh",
        overflowY: "auto",
      }}
    >
      {/* Logo Area */}
      <div
        style={{
          padding: "24px 20px",
          borderBottom: "1px solid rgba(255,255,255,0.08)",
          display: "flex",
          alignItems: "center",
          gap: 12,
        }}
      >
        <div
          style={{
            width: 36,
            height: 36,
            backgroundColor: "#2563eb",
            borderRadius: 8,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#fff",
            fontWeight: 700,
            fontSize: 18,
          }}
        >
          D
        </div>
        <div>
          <div
            style={{
              color: "#fff",
              fontWeight: 600,
              fontSize: 15,
              lineHeight: "20px",
            }}
          >
            Dr. Dubay
          </div>
          <div
            style={{
              color: "#94a3b8",
              fontSize: 12,
              lineHeight: "16px",
            }}
          >
            Admin Panel
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav style={{ flex: 1, padding: "16px 12px" }}>
        {navSections.map((section) => (
          <div key={section.label} style={{ marginBottom: 24 }}>
            <div
              style={{
                color: "#64748b",
                fontSize: 11,
                fontWeight: 600,
                letterSpacing: "0.05em",
                textTransform: "uppercase" as const,
                padding: "0 8px",
                marginBottom: 8,
              }}
            >
              {section.label}
            </div>
            {section.items.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    padding: "8px 12px",
                    borderRadius: 6,
                    fontSize: 14,
                    fontWeight: isActive ? 500 : 400,
                    color: isActive ? "#fff" : "#cbd5e1",
                    backgroundColor: isActive ? "#2563eb" : "transparent",
                    textDecoration: "none",
                    marginBottom: 2,
                    transition: "background-color 0.15s ease",
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive) {
                      (e.currentTarget as HTMLElement).style.backgroundColor =
                        "rgba(255,255,255,0.06)";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) {
                      (e.currentTarget as HTMLElement).style.backgroundColor =
                        "transparent";
                    }
                  }}
                >
                  <Icon size={18} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      {/* Sign Out */}
      <div
        style={{
          padding: "16px 12px",
          borderTop: "1px solid rgba(255,255,255,0.08)",
        }}
      >
        <button
          onClick={handleSignOut}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            padding: "8px 12px",
            borderRadius: 6,
            fontSize: 14,
            color: "#cbd5e1",
            backgroundColor: "transparent",
            border: "none",
            cursor: "pointer",
            width: "100%",
            transition: "background-color 0.15s ease",
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLElement).style.backgroundColor =
              "rgba(255,255,255,0.06)";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLElement).style.backgroundColor =
              "transparent";
          }}
        >
          <LogOut size={18} />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
}
