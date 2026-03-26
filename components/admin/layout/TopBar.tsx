"use client";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { Search, Bell, X } from "lucide-react";

const ROUTE_LABELS: Record<string, string[]> = {
  "/admin": ["Dashboard"],
  "/admin/analytics": ["Analytics"],
  "/admin/patients": ["Patients", "All Patients"],
  "/admin/calendar": ["Patients", "Calendar"],
  "/admin/followups": ["Patients", "Follow-Ups"],
  "/admin/tokens": ["Patients", "OPD Tokens"],
  "/admin/billing": ["Patients", "Billing"],
  "/admin/referrals": ["Patients", "Referrals"],
  "/admin/achievements": ["Content", "Achievements"],
  "/admin/blogs": ["Content", "Blog Posts"],
  "/admin/services": ["Content", "Services"],
  "/admin/manage_image": ["Content", "Gallery"],
  "/admin/events": ["Content", "Events"],
  "/admin/youtube": ["Content", "YouTube"],
  "/admin/contact": ["Communication", "Contact Forms"],
  "/admin/addpatient": ["Patients", "Add Patient"],
  "/admin/appointment": ["Patients", "Appointments"],
};

interface TopBarProps {
  followUpCount: number;
}

export default function TopBar({ followUpCount }: TopBarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const breadcrumbs = ROUTE_LABELS[pathname] || ["Admin"];

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(
        `/admin/patients?search=${encodeURIComponent(searchQuery.trim())}`
      );
      setSearchOpen(false);
      setSearchQuery("");
    }
  };

  return (
    <div
      style={{
        height: "48px",
        backgroundColor: "white",
        borderBottom: "1px solid #e2e8f0",
        display: "flex",
        alignItems: "center",
        paddingLeft: "20px",
        paddingRight: "16px",
        gap: "12px",
        flexShrink: 0,
      }}
    >
      {/* Breadcrumbs */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "6px",
          flex: 1,
          overflow: "hidden",
        }}
      >
        {breadcrumbs.map((crumb, i) => (
          <div
            key={i}
            style={{ display: "flex", alignItems: "center", gap: "6px" }}
          >
            {i > 0 && (
              <span style={{ color: "#cbd5e1", fontSize: "13px" }}>/</span>
            )}
            <span
              style={{
                fontSize: "13px",
                color:
                  i === breadcrumbs.length - 1 ? "#1e293b" : "#94a3b8",
                fontWeight:
                  i === breadcrumbs.length - 1 ? "500" : "400",
                whiteSpace: "nowrap",
              }}
            >
              {crumb}
            </span>
          </div>
        ))}
      </div>

      {/* Search */}
      {searchOpen ? (
        <form
          onSubmit={handleSearch}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            flex: 1,
            maxWidth: "320px",
          }}
        >
          <input
            autoFocus
            type="text"
            placeholder="Search patients by name or phone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              flex: 1,
              height: "32px",
              padding: "0 10px",
              border: "1px solid #2563eb",
              borderRadius: "6px",
              fontSize: "13px",
              outline: "none",
              color: "#1e293b",
            }}
          />
          <button
            type="button"
            onClick={() => {
              setSearchOpen(false);
              setSearchQuery("");
            }}
            style={{
              border: "none",
              background: "none",
              cursor: "pointer",
              color: "#94a3b8",
              display: "flex",
              padding: "4px",
            }}
          >
            <X size={14} />
          </button>
        </form>
      ) : (
        <button
          onClick={() => setSearchOpen(true)}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "6px",
            padding: "5px 10px",
            border: "1px solid #e2e8f0",
            borderRadius: "6px",
            backgroundColor: "#f8fafc",
            cursor: "pointer",
            color: "#94a3b8",
            fontSize: "12px",
          }}
        >
          <Search size={13} />
          <span>Search patients...</span>
        </button>
      )}

      {/* Follow-up bell */}
      <div style={{ position: "relative" }}>
        <button
          onClick={() => router.push("/admin/followups")}
          style={{
            width: "32px",
            height: "32px",
            border: "1px solid #e2e8f0",
            borderRadius: "6px",
            backgroundColor: followUpCount > 0 ? "#fef2f2" : "#f8fafc",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            color: followUpCount > 0 ? "#dc2626" : "#94a3b8",
          }}
        >
          <Bell size={14} strokeWidth={1.8} />
        </button>
        {followUpCount > 0 && (
          <div
            style={{
              position: "absolute",
              top: "-4px",
              right: "-4px",
              backgroundColor: "#dc2626",
              color: "white",
              fontSize: "9px",
              fontWeight: "700",
              padding: "1px 4px",
              borderRadius: "99px",
              minWidth: "14px",
              textAlign: "center",
              border: "1.5px solid white",
            }}
          >
            {followUpCount}
          </div>
        )}
      </div>
    </div>
  );
}
