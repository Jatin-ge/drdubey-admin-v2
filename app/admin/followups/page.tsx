"use client";

import { useEffect, useState, useCallback } from "react";

interface LeadData {
  id: string;
  name: string;
  phone?: string;
  email?: string;
  surgery?: string;
  cities?: string;
  address?: string;
}

interface FollowUpData {
  id: string;
  leadId: string;
  lead: LeadData;
  dueDate: string;
  type: string;
  status: string;
  notes?: string;
  completedAt?: string;
  createdAt: string;
}

type FilterTab = "overdue" | "today" | "upcoming";

const TAB_CONFIG: { key: FilterTab; label: string; color: string; bgColor: string; borderColor: string }[] = [
  { key: "overdue", label: "Overdue", color: "#dc2626", bgColor: "#fef2f2", borderColor: "#fecaca" },
  { key: "today", label: "Due Today", color: "#2563eb", bgColor: "#eff6ff", borderColor: "#bfdbfe" },
  { key: "upcoming", label: "Upcoming", color: "#16a34a", bgColor: "#f0fdf4", borderColor: "#bbf7d0" },
];

const TYPE_BADGE_COLORS: Record<string, { bg: string; text: string }> = {
  CALL: { bg: "#dbeafe", text: "#1e40af" },
  VISIT: { bg: "#dcfce7", text: "#166534" },
  WHATSAPP: { bg: "#d1fae5", text: "#065f46" },
  EMAIL: { bg: "#fef3c7", text: "#92400e" },
  SURGERY: { bg: "#fce7f3", text: "#9d174d" },
  FOLLOWUP: { bg: "#e0e7ff", text: "#3730a3" },
};

const getTypeBadgeStyle = (type: string): { bg: string; text: string } => {
  return TYPE_BADGE_COLORS[type?.toUpperCase()] || { bg: "#f3f4f6", text: "#374151" };
};

const formatDate = (dateStr: string): string => {
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  } catch {
    return dateStr;
  }
};

const formatRelativeDate = (dateStr: string): string => {
  try {
    const d = new Date(dateStr);
    const now = new Date();
    const diffMs = d.getTime() - now.getTime();
    const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Tomorrow";
    if (diffDays === -1) return "Yesterday";
    if (diffDays < -1) return `${Math.abs(diffDays)} days ago`;
    return `In ${diffDays} days`;
  } catch {
    return "";
  }
};

export default function FollowUpsPage() {
  const [followups, setFollowups] = useState<FollowUpData[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<FilterTab>("overdue");
  const [completingId, setCompletingId] = useState<string | null>(null);

  const fetchFollowups = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/followups?status=${activeTab}`);
      const data = await res.json();
      setFollowups(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Failed to fetch follow-ups:", error);
      setFollowups([]);
    } finally {
      setLoading(false);
    }
  }, [activeTab]);

  useEffect(() => {
    fetchFollowups();
  }, [fetchFollowups]);

  const handleMarkDone = async (id: string) => {
    setCompletingId(id);
    try {
      const res = await fetch(`/api/followups/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "COMPLETED" }),
      });
      if (res.ok) {
        setFollowups((prev) => prev.filter((f) => f.id !== id));
      } else {
        console.error("Failed to mark follow-up as done");
      }
    } catch (error) {
      console.error("Error completing follow-up:", error);
    } finally {
      setCompletingId(null);
    }
  };

  const activeTabConfig = TAB_CONFIG.find((t) => t.key === activeTab)!;

  return (
    <div style={{ padding: "24px", fontFamily: "system-ui, -apple-system, sans-serif", maxWidth: 1100, margin: "0 auto" }}>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 28, fontWeight: 700, margin: "0 0 4px 0", color: "#111827" }}>
          Follow-Up Management
        </h1>
        <p style={{ fontSize: 14, color: "#6b7280", margin: 0 }}>
          Track and manage patient follow-ups
        </p>
      </div>

      {/* Filter Tabs */}
      <div style={{ display: "flex", gap: 8, marginBottom: 24, flexWrap: "wrap" }}>
        {TAB_CONFIG.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            style={{
              padding: "10px 24px",
              backgroundColor: activeTab === tab.key ? tab.color : "#fff",
              color: activeTab === tab.key ? "#fff" : tab.color,
              border: `2px solid ${tab.color}`,
              borderRadius: 8,
              cursor: "pointer",
              fontSize: 14,
              fontWeight: 600,
              transition: "all 0.15s",
            }}
          >
            {tab.label}
            {!loading && activeTab === tab.key && (
              <span
                style={{
                  marginLeft: 8,
                  backgroundColor: activeTab === tab.key ? "rgba(255,255,255,0.3)" : tab.bgColor,
                  padding: "2px 8px",
                  borderRadius: 10,
                  fontSize: 12,
                }}
              >
                {followups.length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Content */}
      {loading ? (
        <div style={{ textAlign: "center", padding: 60, color: "#6b7280", fontSize: 16 }}>
          Loading follow-ups...
        </div>
      ) : followups.length === 0 ? (
        /* Empty State */
        <div
          style={{
            textAlign: "center",
            padding: "60px 20px",
            backgroundColor: activeTabConfig.bgColor,
            border: `1px solid ${activeTabConfig.borderColor}`,
            borderRadius: 12,
          }}
        >
          <div style={{ fontSize: 48, marginBottom: 12 }}>
            {activeTab === "overdue" ? "\u23F0" : activeTab === "today" ? "\u2705" : "\u{1F4C5}"}
          </div>
          <h3 style={{ fontSize: 18, fontWeight: 600, color: "#374151", margin: "0 0 8px 0" }}>
            {activeTab === "overdue"
              ? "No Overdue Follow-Ups"
              : activeTab === "today"
              ? "No Follow-Ups Due Today"
              : "No Upcoming Follow-Ups"}
          </h3>
          <p style={{ fontSize: 14, color: "#6b7280", margin: 0 }}>
            {activeTab === "overdue"
              ? "Great job! All follow-ups are on track."
              : activeTab === "today"
              ? "You are all caught up for today."
              : "No follow-ups scheduled for upcoming days."}
          </p>
        </div>
      ) : (
        /* Follow-Up Cards */
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {followups.map((followup) => {
            const typeBadge = getTypeBadgeStyle(followup.type);
            return (
              <div
                key={followup.id}
                style={{
                  backgroundColor: "#fff",
                  border: "1px solid #e5e7eb",
                  borderRadius: 10,
                  padding: 20,
                  borderLeft: `4px solid ${activeTabConfig.color}`,
                  boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
                  transition: "box-shadow 0.15s",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 12 }}>
                  {/* Left: Patient Info */}
                  <div style={{ flex: 1, minWidth: 240 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                      <h3 style={{ fontSize: 17, fontWeight: 600, margin: 0, color: "#111827" }}>
                        {followup.lead?.name || "Unknown Patient"}
                      </h3>
                      <span
                        style={{
                          fontSize: 11,
                          padding: "2px 10px",
                          borderRadius: 10,
                          backgroundColor: typeBadge.bg,
                          color: typeBadge.text,
                          fontWeight: 600,
                          textTransform: "uppercase",
                          letterSpacing: "0.03em",
                        }}
                      >
                        {followup.type}
                      </span>
                    </div>

                    <div style={{ fontSize: 13, color: "#6b7280", lineHeight: "22px" }}>
                      {followup.lead?.phone && (
                        <div>
                          <strong>Phone:</strong> {followup.lead.phone}
                        </div>
                      )}
                      {followup.lead?.surgery && (
                        <div>
                          <strong>Surgery:</strong> {followup.lead.surgery}
                        </div>
                      )}
                      {followup.lead?.cities && (
                        <div>
                          <strong>City:</strong> {followup.lead.cities}
                        </div>
                      )}
                      <div>
                        <strong>Due:</strong> {formatDate(followup.dueDate)}{" "}
                        <span style={{ color: activeTabConfig.color, fontWeight: 600 }}>
                          ({formatRelativeDate(followup.dueDate)})
                        </span>
                      </div>
                      {followup.notes && (
                        <div style={{ marginTop: 6, fontStyle: "italic", color: "#9ca3af", fontSize: 12 }}>
                          Notes: {followup.notes}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Right: Actions */}
                  <div style={{ display: "flex", gap: 8, alignItems: "center", flexShrink: 0 }}>
                    {/* WhatsApp Button */}
                    {followup.lead?.phone && (
                      <a
                        href={`https://wa.me/91${followup.lead.phone.replace(/\D/g, "").replace(/^91/, "")}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 6,
                          padding: "8px 16px",
                          backgroundColor: "#25D366",
                          color: "#fff",
                          border: "none",
                          borderRadius: 6,
                          fontSize: 13,
                          fontWeight: 600,
                          textDecoration: "none",
                          cursor: "pointer",
                        }}
                      >
                        WhatsApp
                      </a>
                    )}

                    {/* Done Button */}
                    <button
                      onClick={() => handleMarkDone(followup.id)}
                      disabled={completingId === followup.id}
                      style={{
                        padding: "8px 16px",
                        backgroundColor: completingId === followup.id ? "#9ca3af" : "#16a34a",
                        color: "#fff",
                        border: "none",
                        borderRadius: 6,
                        cursor: completingId === followup.id ? "not-allowed" : "pointer",
                        fontSize: 13,
                        fontWeight: 600,
                      }}
                    >
                      {completingId === followup.id ? "Saving..." : "Done"}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
