"use client";
import { useEffect } from "react";
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
  X,
  LogOut,
  Kanban,
  Send,
  MessageCircle,
  Clock,
} from "lucide-react";

const NAV_GROUPS = [
  {
    label: "Overview",
    items: [
      { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
      { label: "Analytics", href: "/admin/analytics", icon: BarChart3 },
    ],
  },
  {
    label: "Patients",
    items: [
      { label: "All Patients", href: "/admin/patients", icon: Users },
      { label: "Calendar", href: "/admin/calendar", icon: Calendar },
      { label: "Follow-Ups", href: "/admin/followups", icon: Bell },
      { label: "OPD Tokens", href: "/admin/tokens", icon: Ticket },
      { label: "Billing", href: "/admin/billing", icon: Receipt },
      { label: "Referrals", href: "/admin/referrals", icon: UserCheck },
      { label: "Pipeline", href: "/admin/pipeline", icon: Kanban },
    ],
  },
  {
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

interface MobileDrawerProps {
  open: boolean;
  onClose: () => void;
}

export default function MobileDrawer({ open, onClose }: MobileDrawerProps) {
  const pathname = usePathname();

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const isActive = (href: string) => {
    if (href === "/admin") return pathname === "/admin";
    return pathname.startsWith(href);
  };

  if (!open) return null;

  return (
    <>
      <div
        onClick={onClose}
        style={{
          position: "fixed",
          inset: 0,
          backgroundColor: "rgba(0,0,0,0.5)",
          zIndex: 40,
        }}
      />
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          bottom: 0,
          width: "260px",
          backgroundColor: "#0f172a",
          zIndex: 50,
          display: "flex",
          flexDirection: "column",
          overflowY: "auto",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "14px 12px",
            borderBottom: "1px solid rgba(255,255,255,0.06)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
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
              }}
            >
              D
            </div>
            <div>
              <p
                style={{
                  fontSize: "13px",
                  fontWeight: "600",
                  color: "white",
                  lineHeight: 1.2,
                }}
              >
                Dr. Dubay
              </p>
              <p style={{ fontSize: "10px", color: "rgba(255,255,255,0.35)" }}>
                Admin Panel
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              border: "none",
              background: "none",
              color: "rgba(255,255,255,0.4)",
              cursor: "pointer",
              padding: "4px",
            }}
          >
            <X size={18} />
          </button>
        </div>

        <nav style={{ flex: 1, padding: "8px 6px" }}>
          {NAV_GROUPS.map((group, gi) => (
            <div key={group.label}>
              {gi > 0 && (
                <div
                  style={{
                    height: "1px",
                    backgroundColor: "rgba(255,255,255,0.05)",
                    margin: "6px 4px",
                  }}
                />
              )}
              <p
                style={{
                  fontSize: "9.5px",
                  fontWeight: "600",
                  color: "rgba(255,255,255,0.28)",
                  letterSpacing: "0.8px",
                  textTransform: "uppercase",
                  padding: "8px 6px 3px",
                }}
              >
                {group.label}
              </p>
              {group.items.map((item) => {
                const active = isActive(item.href);
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={onClose}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "10px",
                      padding: "9px 10px",
                      borderRadius: "6px",
                      marginBottom: "1px",
                      textDecoration: "none",
                      backgroundColor: active ? "#2563eb" : "transparent",
                    }}
                  >
                    <Icon
                      size={15}
                      color={active ? "white" : "rgba(255,255,255,0.45)"}
                      strokeWidth={active ? 2 : 1.5}
                    />
                    <span
                      style={{
                        fontSize: "13px",
                        fontWeight: active ? "500" : "400",
                        color: active ? "white" : "rgba(255,255,255,0.55)",
                      }}
                    >
                      {item.label}
                    </span>
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>

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
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              padding: "9px 10px",
              borderRadius: "6px",
              width: "100%",
              border: "none",
              backgroundColor: "transparent",
              cursor: "pointer",
              color: "rgba(255,255,255,0.4)",
              fontSize: "13px",
            }}
          >
            <LogOut size={14} strokeWidth={1.5} />
            Sign out
          </button>
        </div>
      </div>
    </>
  );
}
