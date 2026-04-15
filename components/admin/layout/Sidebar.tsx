"use client";
import { useState, useEffect } from "react";
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
  UserCheck,
  Trophy,
  FileText,
  Layers,
  Image,
  Youtube,
  Activity,
  Mail,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Kanban,
  Send,
  MessageCircle,
  Clock,
} from "lucide-react";

const NAV_GROUPS = [
  {
    id: "overview",
    label: "Overview",
    items: [
      { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
      { label: "Analytics", href: "/admin/analytics", icon: BarChart3 },
    ],
  },
  {
    id: "patients",
    label: "Patients",
    items: [
      { label: "All Patients", href: "/admin/patients", icon: Users },
      { label: "Calendar", href: "/admin/calendar", icon: Calendar },
      {
        label: "Follow-Ups",
        href: "/admin/followups",
        icon: Bell,
        badge: true,
      },
      { label: "OPD Tokens", href: "/admin/tokens", icon: Ticket },
      { label: "Billing", href: "/admin/billing", icon: Receipt },
      { label: "Referrals", href: "/admin/referrals", icon: UserCheck },
      { label: "Pipeline", href: "/admin/pipeline", icon: Kanban },
    ],
  },
  {
    id: "content",
    label: "Content",
    items: [
      { label: "Achievements", href: "/admin/achievements", icon: Trophy },
      { label: "Blog Posts", href: "/admin/blogs", icon: FileText },
      { label: "Services", href: "/admin/services", icon: Layers },
      { label: "Gallery", href: "/admin/manage_image", icon: Image },
      { label: "Events", href: "/admin/events", icon: Activity },
      { label: "YouTube", href: "/admin/youtube", icon: Youtube },
    ],
  },
  {
    id: "comms",
    label: "Communication",
    items: [
      { label: "WhatsApp", href: "/admin/whatsapp", icon: MessageCircle },
      { label: "Message History", href: "/admin/whatsapp/history", icon: Clock },
      { label: "Templates", href: "/admin/wa-templates", icon: FileText },
      { label: "Campaigns", href: "/admin/campaigns", icon: Send },
      { label: "Contact Forms", href: "/admin/contact", icon: Mail },
    ],
  },
];

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

export default function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const pathname = usePathname();
  const [followUpCount, setFollowUpCount] = useState(0);
  const [dbStatus, setDbStatus] = useState<
    "online" | "checking" | "offline"
  >("checking");

  useEffect(() => {
    fetch("/api/followups?status=overdue")
      .then((r) => r.json())
      .then((data) => {
        setFollowUpCount(Array.isArray(data) ? data.length : 0);
        setDbStatus("online");
      })
      .catch(() => setDbStatus("offline"));
  }, []);

  const isActive = (href: string) => {
    if (href === "/admin") return pathname === "/admin";
    return pathname.startsWith(href);
  };

  const statusColor = {
    online: "#22c55e",
    checking: "#f59e0b",
    offline: "#ef4444",
  }[dbStatus];

  return (
    <aside
      style={{
        width: collapsed ? "60px" : "220px",
        minHeight: "100vh",
        backgroundColor: "#0f172a",
        display: "flex",
        flexDirection: "column",
        flexShrink: 0,
        transition: "width 0.2s ease",
        position: "relative",
        zIndex: 10,
      }}
    >
      {/* Logo */}
      <div
        style={{
          padding: collapsed ? "14px 0" : "14px 12px",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
          display: "flex",
          alignItems: "center",
          justifyContent: collapsed ? "center" : "flex-start",
          minHeight: "56px",
          gap: "10px",
        }}
      >
        <div
          style={{
            width: "30px",
            height: "30px",
            backgroundColor: "#2563eb",
            borderRadius: "7px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "13px",
            fontWeight: "700",
            color: "white",
            flexShrink: 0,
            position: "relative",
          }}
        >
          D
          <div
            style={{
              position: "absolute",
              bottom: "-2px",
              right: "-2px",
              width: "8px",
              height: "8px",
              borderRadius: "50%",
              backgroundColor: statusColor,
              border: "1.5px solid #0f172a",
              transition: "background-color 0.3s",
            }}
          />
        </div>
        {!collapsed && (
          <div style={{ overflow: "hidden" }}>
            <p
              style={{
                fontSize: "13px",
                fontWeight: "600",
                color: "white",
                lineHeight: 1.3,
                whiteSpace: "nowrap",
              }}
            >
              Dr. Dubay
            </p>
            <p
              style={{
                fontSize: "10px",
                color: "rgba(255,255,255,0.35)",
                whiteSpace: "nowrap",
              }}
            >
              Admin Panel
            </p>
          </div>
        )}
      </div>

      {/* Nav */}
      <nav
        style={{
          flex: 1,
          overflowY: "auto",
          overflowX: "hidden",
          padding: "8px 6px",
        }}
      >
        {NAV_GROUPS.map((group, gi) => (
          <div key={group.id}>
            {gi > 0 && (
              <div
                style={{
                  height: "1px",
                  backgroundColor: "rgba(255,255,255,0.05)",
                  margin: "6px 4px",
                }}
              />
            )}
            {!collapsed && (
              <p
                style={{
                  fontSize: "9.5px",
                  fontWeight: "600",
                  color: "rgba(255,255,255,0.28)",
                  letterSpacing: "0.8px",
                  textTransform: "uppercase",
                  padding: "8px 6px 3px",
                  whiteSpace: "nowrap",
                }}
              >
                {group.label}
              </p>
            )}
            {group.items.map((item) => {
              const active = isActive(item.href);
              const Icon = item.icon;
              const showBadge =
                "badge" in item && item.badge && followUpCount > 0;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  title={collapsed ? item.label : undefined}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    padding: collapsed ? "9px 0" : "7px 8px",
                    justifyContent: collapsed ? "center" : "flex-start",
                    borderRadius: "6px",
                    marginBottom: "1px",
                    textDecoration: "none",
                    backgroundColor: active ? "#2563eb" : "transparent",
                    transition: "background-color 0.1s",
                    position: "relative",
                  }}
                  onMouseEnter={(e) => {
                    if (!active) {
                      (
                        e.currentTarget as HTMLElement
                      ).style.backgroundColor = "rgba(255,255,255,0.06)";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!active) {
                      (
                        e.currentTarget as HTMLElement
                      ).style.backgroundColor = "transparent";
                    }
                  }}
                >
                  <Icon
                    size={15}
                    color={active ? "white" : "rgba(255,255,255,0.45)"}
                    strokeWidth={active ? 2 : 1.5}
                    style={{ flexShrink: 0 }}
                  />
                  {!collapsed && (
                    <>
                      <span
                        style={{
                          fontSize: "12.5px",
                          fontWeight: active ? "500" : "400",
                          color: active
                            ? "white"
                            : "rgba(255,255,255,0.55)",
                          whiteSpace: "nowrap",
                          flex: 1,
                        }}
                      >
                        {item.label}
                      </span>
                      {showBadge && (
                        <span
                          style={{
                            backgroundColor: "#dc2626",
                            color: "white",
                            fontSize: "9px",
                            fontWeight: "700",
                            padding: "1px 5px",
                            borderRadius: "99px",
                            minWidth: "16px",
                            textAlign: "center",
                          }}
                        >
                          {followUpCount}
                        </span>
                      )}
                    </>
                  )}
                  {collapsed && showBadge && (
                    <div
                      style={{
                        position: "absolute",
                        top: "4px",
                        right: "8px",
                        width: "6px",
                        height: "6px",
                        backgroundColor: "#dc2626",
                        borderRadius: "50%",
                        border: "1px solid #0f172a",
                      }}
                    />
                  )}
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      {/* Collapse toggle */}
      <button
        onClick={onToggle}
        style={{
          position: "absolute",
          top: "50%",
          right: "-10px",
          transform: "translateY(-50%)",
          width: "20px",
          height: "20px",
          backgroundColor: "#1e293b",
          border: "1px solid rgba(255,255,255,0.1)",
          borderRadius: "50%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
          zIndex: 20,
          color: "rgba(255,255,255,0.4)",
          transition: "all 0.15s",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = "#2563eb";
          e.currentTarget.style.color = "white";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = "#1e293b";
          e.currentTarget.style.color = "rgba(255,255,255,0.4)";
        }}
      >
        {collapsed ? (
          <ChevronRight size={11} strokeWidth={2.5} />
        ) : (
          <ChevronLeft size={11} strokeWidth={2.5} />
        )}
      </button>

      {/* Footer */}
      <div
        style={{
          padding: "10px 6px",
          borderTop: "1px solid rgba(255,255,255,0.06)",
        }}
      >
        <button
          onClick={() => {
            localStorage.removeItem("isLoggedIn");
            window.location.href = "/sign-in";
          }}
          title={collapsed ? "Sign out" : undefined}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: collapsed ? "center" : "flex-start",
            gap: "8px",
            padding: collapsed ? "9px 0" : "7px 8px",
            borderRadius: "6px",
            width: "100%",
            border: "none",
            backgroundColor: "transparent",
            cursor: "pointer",
            color: "rgba(255,255,255,0.35)",
            fontSize: "12.5px",
            transition: "all 0.1s",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor =
              "rgba(255,255,255,0.06)";
            e.currentTarget.style.color = "rgba(255,255,255,0.7)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = "transparent";
            e.currentTarget.style.color = "rgba(255,255,255,0.35)";
          }}
        >
          <LogOut size={14} strokeWidth={1.5} />
          {!collapsed && <span>Sign out</span>}
        </button>
      </div>
    </aside>
  );
}
