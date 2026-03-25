"use client";

import { useEffect, useState, useCallback } from "react";

interface LeadData {
  id: string;
  name: string;
  phone?: string;
  email?: string;
  surgery?: string;
  cities?: string;
}

interface BillingRecord {
  id: string;
  leadId: string;
  lead: LeadData;
  invoiceNumber: string;
  surgeonFee: number | null;
  hospitalCharges: number | null;
  implantCost: number | null;
  anaesthesiaFee: number | null;
  otherCharges: number | null;
  totalAmount: number;
  amountPaid: number;
  amountDue: number;
  paymentMode: string | null;
  tpaName: string | null;
  tpaClaimNumber: string | null;
  tpaStatus: string | null;
  insuranceAmount: number | null;
  notes: string | null;
  invoiceDate: string;
  createdAt: string;
}

interface LeadSearchResult {
  id: string;
  name: string;
  phone?: string;
  surgery?: string;
  cities?: string;
}

type FilterTab = "all" | "tpa_pending" | "outstanding" | "paid";

interface BillFormData {
  leadId: string;
  surgeonFee: number;
  hospitalCharges: number;
  implantCost: number;
  anaesthesiaFee: number;
  otherCharges: number;
  amountPaid: number;
  paymentMode: string;
  tpaName: string;
  tpaClaimNumber: string;
  tpaStatus: string;
  insuranceAmount: number;
  notes: string;
}

const EMPTY_FORM: BillFormData = {
  leadId: "",
  surgeonFee: 0,
  hospitalCharges: 0,
  implantCost: 0,
  anaesthesiaFee: 0,
  otherCharges: 0,
  amountPaid: 0,
  paymentMode: "CASH",
  tpaName: "",
  tpaClaimNumber: "",
  tpaStatus: "PENDING",
  insuranceAmount: 0,
  notes: "",
};

const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
};

const formatDate = (dateStr: string): string => {
  try {
    return new Date(dateStr).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  } catch {
    return dateStr;
  }
};

const TPA_STATUS_STYLES: Record<string, { bg: string; text: string }> = {
  PENDING: { bg: "#fef3c7", text: "#92400e" },
  APPROVED: { bg: "#dcfce7", text: "#166534" },
  REJECTED: { bg: "#fef2f2", text: "#991b1b" },
  SUBMITTED: { bg: "#dbeafe", text: "#1e40af" },
  PARTIAL: { bg: "#fce7f3", text: "#9d174d" },
};

const getTpaStatusStyle = (status: string | null): { bg: string; text: string } => {
  return TPA_STATUS_STYLES[status?.toUpperCase() || ""] || { bg: "#f3f4f6", text: "#374151" };
};

export default function BillingPage() {
  const [records, setRecords] = useState<BillingRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<FilterTab>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState<BillFormData>(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [patientSearch, setPatientSearch] = useState("");
  const [patientResults, setPatientResults] = useState<LeadSearchResult[]>([]);
  const [searchingPatients, setSearchingPatients] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<LeadSearchResult | null>(null);

  const fetchBilling = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/billing");
      const data = await res.json();
      setRecords(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Failed to fetch billing records:", error);
      setRecords([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBilling();
  }, [fetchBilling]);

  // Patient search with debounce
  useEffect(() => {
    if (patientSearch.length < 2) {
      setPatientResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setSearchingPatients(true);
      try {
        const res = await fetch(`/api/patients?search=${encodeURIComponent(patientSearch)}`);
        const data = await res.json();
        const patients = Array.isArray(data) ? data : data.patients || [];
        setPatientResults(
          patients.slice(0, 10).map((p: any) => ({
            id: p.id,
            name: p.name,
            phone: p.phone,
            surgery: p.surgery,
            cities: p.cities,
          }))
        );
      } catch {
        setPatientResults([]);
      } finally {
        setSearchingPatients(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [patientSearch]);

  const handleSelectPatient = (patient: LeadSearchResult) => {
    setSelectedPatient(patient);
    setFormData((prev) => ({ ...prev, leadId: patient.id }));
    setPatientSearch(patient.name);
    setPatientResults([]);
  };

  const handleSubmitBill = async () => {
    if (!formData.leadId) {
      alert("Please select a patient first.");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/billing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (res.ok) {
        setShowForm(false);
        setFormData(EMPTY_FORM);
        setPatientSearch("");
        setSelectedPatient(null);
        fetchBilling();
      } else {
        const err = await res.json();
        alert("Error creating bill: " + (err.error || "Unknown error"));
      }
    } catch (error) {
      console.error("Error submitting bill:", error);
      alert("Failed to create bill.");
    } finally {
      setSubmitting(false);
    }
  };

  // Filtered and searched records
  const filteredRecords = records.filter((r) => {
    // Tab filter
    if (activeTab === "tpa_pending") {
      if (!r.tpaName || r.tpaStatus?.toUpperCase() !== "PENDING") return false;
    } else if (activeTab === "outstanding") {
      if (r.amountDue <= 0) return false;
    } else if (activeTab === "paid") {
      if (r.amountDue > 0) return false;
    }

    // Search filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = r.lead?.name?.toLowerCase().includes(q);
      const matchInvoice = r.invoiceNumber?.toLowerCase().includes(q);
      if (!matchName && !matchInvoice) return false;
    }

    return true;
  });

  // Summary stats
  const totalBilled = records.reduce((sum, r) => sum + r.totalAmount, 0);
  const totalCollected = records.reduce((sum, r) => sum + r.amountPaid, 0);
  const totalOutstanding = records.reduce((sum, r) => sum + r.amountDue, 0);
  const tpaPendingCount = records.filter(
    (r) => r.tpaName && r.tpaStatus?.toUpperCase() === "PENDING"
  ).length;

  const formTotal =
    (formData.surgeonFee || 0) +
    (formData.hospitalCharges || 0) +
    (formData.implantCost || 0) +
    (formData.anaesthesiaFee || 0) +
    (formData.otherCharges || 0);

  return (
    <div style={{ padding: "24px", fontFamily: "system-ui, -apple-system, sans-serif", maxWidth: 1300, margin: "0 auto" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24, flexWrap: "wrap", gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 700, margin: "0 0 4px 0", color: "#111827" }}>
            Billing Management
          </h1>
          <p style={{ fontSize: 14, color: "#6b7280", margin: 0 }}>
            Manage invoices, payments, and TPA claims
          </p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          style={{
            padding: "10px 24px",
            backgroundColor: showForm ? "#6b7280" : "#2563eb",
            color: "#fff",
            border: "none",
            borderRadius: 8,
            cursor: "pointer",
            fontSize: 14,
            fontWeight: 600,
          }}
        >
          {showForm ? "Cancel" : "+ Add Bill"}
        </button>
      </div>

      {/* Summary Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16, marginBottom: 24 }}>
        <div style={{ backgroundColor: "#eff6ff", border: "1px solid #bfdbfe", borderRadius: 10, padding: "16px 20px" }}>
          <div style={{ fontSize: 12, color: "#6b7280", fontWeight: 500, marginBottom: 4, textTransform: "uppercase", letterSpacing: "0.05em" }}>
            Total Billed
          </div>
          <div style={{ fontSize: 24, fontWeight: 700, color: "#1e40af" }}>
            {formatCurrency(totalBilled)}
          </div>
        </div>
        <div style={{ backgroundColor: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 10, padding: "16px 20px" }}>
          <div style={{ fontSize: 12, color: "#6b7280", fontWeight: 500, marginBottom: 4, textTransform: "uppercase", letterSpacing: "0.05em" }}>
            Total Collected
          </div>
          <div style={{ fontSize: 24, fontWeight: 700, color: "#166534" }}>
            {formatCurrency(totalCollected)}
          </div>
        </div>
        <div style={{ backgroundColor: "#fef2f2", border: "1px solid #fecaca", borderRadius: 10, padding: "16px 20px" }}>
          <div style={{ fontSize: 12, color: "#6b7280", fontWeight: 500, marginBottom: 4, textTransform: "uppercase", letterSpacing: "0.05em" }}>
            Total Outstanding
          </div>
          <div style={{ fontSize: 24, fontWeight: 700, color: "#dc2626" }}>
            {formatCurrency(totalOutstanding)}
          </div>
        </div>
        <div style={{ backgroundColor: "#fef3c7", border: "1px solid #fde68a", borderRadius: 10, padding: "16px 20px" }}>
          <div style={{ fontSize: 12, color: "#6b7280", fontWeight: 500, marginBottom: 4, textTransform: "uppercase", letterSpacing: "0.05em" }}>
            TPA Pending
          </div>
          <div style={{ fontSize: 24, fontWeight: 700, color: "#92400e" }}>
            {tpaPendingCount}
          </div>
        </div>
      </div>

      {/* Add Bill Form */}
      {showForm && (
        <div
          style={{
            backgroundColor: "#fff",
            border: "1px solid #e5e7eb",
            borderRadius: 12,
            padding: 24,
            marginBottom: 24,
            boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
          }}
        >
          <h2 style={{ fontSize: 20, fontWeight: 600, margin: "0 0 20px 0", color: "#111827" }}>
            Create New Bill
          </h2>

          {/* Patient Search */}
          <div style={{ marginBottom: 20, position: "relative" }}>
            <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 6 }}>
              Patient *
            </label>
            <input
              type="text"
              placeholder="Search patient by name..."
              value={patientSearch}
              onChange={(e) => {
                setPatientSearch(e.target.value);
                if (selectedPatient && e.target.value !== selectedPatient.name) {
                  setSelectedPatient(null);
                  setFormData((prev) => ({ ...prev, leadId: "" }));
                }
              }}
              style={{
                width: "100%",
                padding: "10px 14px",
                border: selectedPatient ? "2px solid #16a34a" : "1px solid #d1d5db",
                borderRadius: 8,
                fontSize: 14,
                outline: "none",
                boxSizing: "border-box",
              }}
            />
            {selectedPatient && (
              <div style={{ fontSize: 12, color: "#16a34a", marginTop: 4, fontWeight: 500 }}>
                Selected: {selectedPatient.name}
                {selectedPatient.surgery ? ` | Surgery: ${selectedPatient.surgery}` : ""}
                {selectedPatient.cities ? ` | City: ${selectedPatient.cities}` : ""}
              </div>
            )}
            {searchingPatients && (
              <div style={{ fontSize: 12, color: "#6b7280", marginTop: 4 }}>Searching...</div>
            )}
            {patientResults.length > 0 && !selectedPatient && (
              <div
                style={{
                  position: "absolute",
                  top: "100%",
                  left: 0,
                  right: 0,
                  backgroundColor: "#fff",
                  border: "1px solid #d1d5db",
                  borderRadius: 8,
                  boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                  zIndex: 50,
                  maxHeight: 240,
                  overflowY: "auto",
                }}
              >
                {patientResults.map((p) => (
                  <div
                    key={p.id}
                    onClick={() => handleSelectPatient(p)}
                    style={{
                      padding: "10px 14px",
                      cursor: "pointer",
                      borderBottom: "1px solid #f3f4f6",
                      fontSize: 13,
                      transition: "background-color 0.1s",
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#f9fafb")}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#fff")}
                  >
                    <div style={{ fontWeight: 600, color: "#111827" }}>{p.name}</div>
                    <div style={{ color: "#6b7280", fontSize: 12 }}>
                      {p.phone || "No phone"} {p.surgery ? `| ${p.surgery}` : ""} {p.cities ? `| ${p.cities}` : ""}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Fee Fields */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 16, marginBottom: 20 }}>
            {[
              { key: "surgeonFee", label: "Surgeon Fee" },
              { key: "hospitalCharges", label: "Hospital Charges" },
              { key: "implantCost", label: "Implant Cost" },
              { key: "anaesthesiaFee", label: "Anaesthesia Fee" },
              { key: "otherCharges", label: "Other Charges" },
              { key: "amountPaid", label: "Amount Paid" },
            ].map((field) => (
              <div key={field.key}>
                <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 6 }}>
                  {field.label}
                </label>
                <input
                  type="number"
                  min={0}
                  value={(formData as any)[field.key] || ""}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      [field.key]: parseInt(e.target.value) || 0,
                    }))
                  }
                  style={{
                    width: "100%",
                    padding: "10px 14px",
                    border: "1px solid #d1d5db",
                    borderRadius: 8,
                    fontSize: 14,
                    outline: "none",
                    boxSizing: "border-box",
                  }}
                />
              </div>
            ))}
          </div>

          {/* Calculated Total */}
          <div
            style={{
              backgroundColor: "#f9fafb",
              border: "1px solid #e5e7eb",
              borderRadius: 8,
              padding: "12px 16px",
              marginBottom: 20,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <span style={{ fontSize: 14, fontWeight: 600, color: "#374151" }}>
              Total Amount: {formatCurrency(formTotal)}
            </span>
            <span style={{ fontSize: 14, fontWeight: 600, color: formTotal - (formData.amountPaid || 0) > 0 ? "#dc2626" : "#16a34a" }}>
              Due: {formatCurrency(formTotal - (formData.amountPaid || 0))}
            </span>
          </div>

          {/* Payment Mode & TPA */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 16, marginBottom: 20 }}>
            <div>
              <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 6 }}>
                Payment Mode
              </label>
              <select
                value={formData.paymentMode}
                onChange={(e) => setFormData((prev) => ({ ...prev, paymentMode: e.target.value }))}
                style={{
                  width: "100%",
                  padding: "10px 14px",
                  border: "1px solid #d1d5db",
                  borderRadius: 8,
                  fontSize: 14,
                  outline: "none",
                  boxSizing: "border-box",
                  backgroundColor: "#fff",
                }}
              >
                <option value="CASH">Cash</option>
                <option value="CARD">Card</option>
                <option value="UPI">UPI</option>
                <option value="NETBANKING">Net Banking</option>
              </select>
            </div>
            <div>
              <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 6 }}>
                TPA Name
              </label>
              <input
                type="text"
                placeholder="Insurance/TPA name"
                value={formData.tpaName}
                onChange={(e) => setFormData((prev) => ({ ...prev, tpaName: e.target.value }))}
                style={{
                  width: "100%",
                  padding: "10px 14px",
                  border: "1px solid #d1d5db",
                  borderRadius: 8,
                  fontSize: 14,
                  outline: "none",
                  boxSizing: "border-box",
                }}
              />
            </div>
            <div>
              <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 6 }}>
                TPA Claim Number
              </label>
              <input
                type="text"
                placeholder="Claim number"
                value={formData.tpaClaimNumber}
                onChange={(e) => setFormData((prev) => ({ ...prev, tpaClaimNumber: e.target.value }))}
                style={{
                  width: "100%",
                  padding: "10px 14px",
                  border: "1px solid #d1d5db",
                  borderRadius: 8,
                  fontSize: 14,
                  outline: "none",
                  boxSizing: "border-box",
                }}
              />
            </div>
            <div>
              <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 6 }}>
                TPA Status
              </label>
              <select
                value={formData.tpaStatus}
                onChange={(e) => setFormData((prev) => ({ ...prev, tpaStatus: e.target.value }))}
                style={{
                  width: "100%",
                  padding: "10px 14px",
                  border: "1px solid #d1d5db",
                  borderRadius: 8,
                  fontSize: 14,
                  outline: "none",
                  boxSizing: "border-box",
                  backgroundColor: "#fff",
                }}
              >
                <option value="PENDING">Pending</option>
                <option value="SUBMITTED">Submitted</option>
                <option value="APPROVED">Approved</option>
                <option value="PARTIAL">Partial</option>
                <option value="REJECTED">Rejected</option>
              </select>
            </div>
            <div>
              <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 6 }}>
                Insurance Amount
              </label>
              <input
                type="number"
                min={0}
                value={formData.insuranceAmount || ""}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    insuranceAmount: parseInt(e.target.value) || 0,
                  }))
                }
                style={{
                  width: "100%",
                  padding: "10px 14px",
                  border: "1px solid #d1d5db",
                  borderRadius: 8,
                  fontSize: 14,
                  outline: "none",
                  boxSizing: "border-box",
                }}
              />
            </div>
          </div>

          {/* Notes */}
          <div style={{ marginBottom: 20 }}>
            <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 6 }}>
              Notes
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData((prev) => ({ ...prev, notes: e.target.value }))}
              rows={2}
              placeholder="Any additional notes..."
              style={{
                width: "100%",
                padding: "10px 14px",
                border: "1px solid #d1d5db",
                borderRadius: 8,
                fontSize: 14,
                outline: "none",
                boxSizing: "border-box",
                resize: "vertical",
              }}
            />
          </div>

          {/* Submit */}
          <div style={{ display: "flex", gap: 12, justifyContent: "flex-end" }}>
            <button
              onClick={() => {
                setShowForm(false);
                setFormData(EMPTY_FORM);
                setPatientSearch("");
                setSelectedPatient(null);
              }}
              style={{
                padding: "10px 24px",
                backgroundColor: "#fff",
                color: "#374151",
                border: "1px solid #d1d5db",
                borderRadius: 8,
                cursor: "pointer",
                fontSize: 14,
                fontWeight: 500,
              }}
            >
              Cancel
            </button>
            <button
              onClick={handleSubmitBill}
              disabled={submitting || !formData.leadId}
              style={{
                padding: "10px 24px",
                backgroundColor: submitting || !formData.leadId ? "#9ca3af" : "#2563eb",
                color: "#fff",
                border: "none",
                borderRadius: 8,
                cursor: submitting || !formData.leadId ? "not-allowed" : "pointer",
                fontSize: 14,
                fontWeight: 600,
              }}
            >
              {submitting ? "Creating..." : "Create Bill"}
            </button>
          </div>
        </div>
      )}

      {/* Filter Tabs */}
      <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap" }}>
        {(
          [
            { key: "all", label: "All" },
            { key: "tpa_pending", label: "TPA Pending" },
            { key: "outstanding", label: "Outstanding" },
            { key: "paid", label: "Paid" },
          ] as { key: FilterTab; label: string }[]
        ).map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            style={{
              padding: "8px 20px",
              backgroundColor: activeTab === tab.key ? "#1f2937" : "#fff",
              color: activeTab === tab.key ? "#fff" : "#374151",
              border: "1px solid #d1d5db",
              borderRadius: 6,
              cursor: "pointer",
              fontSize: 13,
              fontWeight: 600,
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Search */}
      <div style={{ marginBottom: 20 }}>
        <input
          type="text"
          placeholder="Search by patient name or invoice number..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{
            width: "100%",
            maxWidth: 400,
            padding: "10px 14px",
            border: "1px solid #d1d5db",
            borderRadius: 8,
            fontSize: 14,
            outline: "none",
            boxSizing: "border-box",
          }}
        />
      </div>

      {/* Table */}
      {loading ? (
        <div style={{ textAlign: "center", padding: 60, color: "#6b7280", fontSize: 16 }}>
          Loading billing records...
        </div>
      ) : filteredRecords.length === 0 ? (
        <div
          style={{
            textAlign: "center",
            padding: "60px 20px",
            backgroundColor: "#f9fafb",
            border: "1px solid #e5e7eb",
            borderRadius: 12,
          }}
        >
          <h3 style={{ fontSize: 18, fontWeight: 600, color: "#374151", margin: "0 0 8px 0" }}>
            No billing records found
          </h3>
          <p style={{ fontSize: 14, color: "#6b7280", margin: 0 }}>
            {searchQuery
              ? "Try adjusting your search query."
              : "Click 'Add Bill' to create your first billing record."}
          </p>
        </div>
      ) : (
        <div style={{ overflowX: "auto", borderRadius: 10, border: "1px solid #e5e7eb" }}>
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              fontSize: 13,
              backgroundColor: "#fff",
            }}
          >
            <thead>
              <tr style={{ backgroundColor: "#f9fafb" }}>
                {["Invoice No", "Patient Name", "Surgery", "Total", "Paid", "Due", "TPA Status", "Date", "Actions"].map(
                  (header) => (
                    <th
                      key={header}
                      style={{
                        padding: "12px 14px",
                        textAlign: "left",
                        fontWeight: 600,
                        color: "#374151",
                        borderBottom: "2px solid #e5e7eb",
                        whiteSpace: "nowrap",
                        fontSize: 12,
                        textTransform: "uppercase",
                        letterSpacing: "0.05em",
                      }}
                    >
                      {header}
                    </th>
                  )
                )}
              </tr>
            </thead>
            <tbody>
              {filteredRecords.map((record) => {
                const tpaStyle = getTpaStatusStyle(record.tpaStatus);
                return (
                  <tr
                    key={record.id}
                    style={{
                      borderBottom: "1px solid #f3f4f6",
                      transition: "background-color 0.1s",
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#f9fafb")}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#fff")}
                  >
                    <td style={{ padding: "12px 14px", fontWeight: 600, color: "#2563eb" }}>
                      {record.invoiceNumber}
                    </td>
                    <td style={{ padding: "12px 14px", color: "#111827", fontWeight: 500 }}>
                      {record.lead?.name || "Unknown"}
                    </td>
                    <td style={{ padding: "12px 14px", color: "#6b7280" }}>
                      {record.lead?.surgery || "-"}
                    </td>
                    <td style={{ padding: "12px 14px", fontWeight: 600, color: "#111827" }}>
                      {formatCurrency(record.totalAmount)}
                    </td>
                    <td style={{ padding: "12px 14px", color: "#16a34a", fontWeight: 600 }}>
                      {formatCurrency(record.amountPaid)}
                    </td>
                    <td
                      style={{
                        padding: "12px 14px",
                        color: record.amountDue > 0 ? "#dc2626" : "#16a34a",
                        fontWeight: 600,
                      }}
                    >
                      {formatCurrency(record.amountDue)}
                    </td>
                    <td style={{ padding: "12px 14px" }}>
                      {record.tpaName ? (
                        <span
                          style={{
                            fontSize: 11,
                            padding: "3px 10px",
                            borderRadius: 10,
                            backgroundColor: tpaStyle.bg,
                            color: tpaStyle.text,
                            fontWeight: 600,
                          }}
                        >
                          {record.tpaStatus || "N/A"}
                        </span>
                      ) : (
                        <span style={{ color: "#d1d5db", fontSize: 12 }}>No TPA</span>
                      )}
                    </td>
                    <td style={{ padding: "12px 14px", color: "#6b7280", whiteSpace: "nowrap" }}>
                      {formatDate(record.invoiceDate)}
                    </td>
                    <td style={{ padding: "12px 14px" }}>
                      <a
                        href={`/admin/billing/${record.id}/invoice`}
                        style={{
                          fontSize: 12,
                          color: "#2563eb",
                          textDecoration: "none",
                          fontWeight: 600,
                          padding: "4px 10px",
                          border: "1px solid #bfdbfe",
                          borderRadius: 4,
                          display: "inline-block",
                        }}
                      >
                        Print Invoice
                      </a>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
