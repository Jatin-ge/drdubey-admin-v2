'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';

interface BillingRecord {
  id: string;
  invoiceNumber: string;
  date: string;
  patientName: string;
  age: number | string;
  gender: string;
  phone: string;
  address: string;
  admissionDate: string;
  dischargeDate: string;
  surgeonFee: number;
  hospitalCharges: number;
  implantCost: number;
  anaesthesiaFee: number;
  otherCharges: number;
  totalAmount: number;
  amountPaid: number;
  amountDue: number;
  paymentMode: string;
  tpaName: string;
  tpaId: string;
}

export default function InvoicePage() {
  const params = useParams();
  const id = params.id as string;

  const [billing, setBilling] = useState<BillingRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchBilling = async () => {
      try {
        const res = await fetch(`/api/billing/${id}`);
        if (res.ok) {
          const data = await res.json();
          setBilling(data.billing || data);
        } else {
          setError('Failed to load billing record');
        }
      } catch (err) {
        console.error('Error fetching billing:', err);
        setError('Failed to load billing record');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchBilling();
    }
  }, [id]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount || 0);
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '--';
    return new Date(dateStr).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh', fontSize: '18px', color: '#666' }}>
        Loading invoice...
      </div>
    );
  }

  if (error || !billing) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh', fontSize: '18px', color: '#dc3545' }}>
        {error || 'Billing record not found'}
      </div>
    );
  }

  const total = billing.totalAmount ?? (
    (billing.surgeonFee || 0) +
    (billing.hospitalCharges || 0) +
    (billing.implantCost || 0) +
    (billing.anaesthesiaFee || 0) +
    (billing.otherCharges || 0)
  );

  const lineItems = [
    { label: 'Surgeon Fee', amount: billing.surgeonFee },
    { label: 'Hospital Charges', amount: billing.hospitalCharges },
    { label: 'Implant Cost', amount: billing.implantCost },
    { label: 'Anaesthesia Fee', amount: billing.anaesthesiaFee },
    { label: 'Other Charges', amount: billing.otherCharges },
  ];

  return (
    <>
      <style>{`
        @media print {
          .no-print {
            display: none !important;
          }
          body {
            margin: 0;
            padding: 0;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          .invoice-container {
            box-shadow: none !important;
            margin: 0 !important;
            border: none !important;
          }
        }
      `}</style>

      {/* Print Button */}
      <div
        className="no-print"
        style={{
          display: 'flex',
          justifyContent: 'center',
          padding: '20px',
          background: '#f8f9fa',
        }}
      >
        <button
          onClick={handlePrint}
          style={{
            padding: '12px 32px',
            background: '#007bff',
            color: '#fff',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '16px',
            fontWeight: '600',
          }}
        >
          Print Invoice
        </button>
      </div>

      {/* Invoice */}
      <div
        className="invoice-container"
        style={{
          maxWidth: '800px',
          margin: '0 auto 40px auto',
          background: '#ffffff',
          border: '1px solid #dee2e6',
          borderRadius: '4px',
          padding: '48px',
          fontFamily: 'Georgia, "Times New Roman", serif',
          color: '#212529',
          boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
        }}
      >
        {/* Header */}
        <div
          style={{
            textAlign: 'center',
            borderBottom: '3px double #1a1a2e',
            paddingBottom: '24px',
            marginBottom: '24px',
          }}
        >
          <h1 style={{ fontSize: '28px', fontWeight: '700', margin: '0 0 4px 0', color: '#1a1a2e' }}>
            Dr. Dheeraj Dubay
          </h1>
          <p style={{ fontSize: '14px', color: '#495057', margin: '0 0 2px 0' }}>
            MS (Ortho), MCh, Fellowship in Joint Replacement
          </p>
          <p style={{ fontSize: '13px', color: '#6c757d', margin: '0 0 16px 0' }}>
            Hip &amp; Knee Replacement Surgeon
          </p>
          <h2
            style={{
              fontSize: '22px',
              fontWeight: '700',
              margin: '0',
              letterSpacing: '6px',
              textTransform: 'uppercase',
              color: '#1a1a2e',
            }}
          >
            Tax Invoice
          </h2>
        </div>

        {/* Invoice Details Row */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            marginBottom: '24px',
            fontSize: '14px',
          }}
        >
          <div>
            <p style={{ margin: '0 0 4px 0' }}>
              <strong>Invoice No:</strong> {billing.invoiceNumber || `INV-${billing.id}`}
            </p>
            <p style={{ margin: 0 }}>
              <strong>Date:</strong> {formatDate(billing.date)}
            </p>
          </div>
        </div>

        {/* Patient Details */}
        <div
          style={{
            background: '#f8f9fa',
            border: '1px solid #e9ecef',
            borderRadius: '4px',
            padding: '16px 20px',
            marginBottom: '24px',
            fontSize: '14px',
          }}
        >
          <h3 style={{ fontSize: '14px', fontWeight: '700', margin: '0 0 12px 0', textTransform: 'uppercase', letterSpacing: '1px', color: '#495057' }}>
            Patient Details
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px 24px' }}>
            <p style={{ margin: 0 }}>
              <strong>Name:</strong> {billing.patientName}
            </p>
            <p style={{ margin: 0 }}>
              <strong>Phone:</strong> {billing.phone || '--'}
            </p>
            <p style={{ margin: 0 }}>
              <strong>Age:</strong> {billing.age || '--'}
            </p>
            <p style={{ margin: 0 }}>
              <strong>Gender:</strong> {billing.gender || '--'}
            </p>
            <p style={{ margin: 0, gridColumn: '1 / -1' }}>
              <strong>Address:</strong> {billing.address || '--'}
            </p>
            <p style={{ margin: 0 }}>
              <strong>Admission Date:</strong> {formatDate(billing.admissionDate)}
            </p>
            <p style={{ margin: 0 }}>
              <strong>Discharge Date:</strong> {formatDate(billing.dischargeDate)}
            </p>
          </div>
        </div>

        {/* Bill Breakdown Table */}
        <table
          style={{
            width: '100%',
            borderCollapse: 'collapse',
            marginBottom: '24px',
            fontSize: '14px',
          }}
        >
          <thead>
            <tr>
              <th
                style={{
                  textAlign: 'left',
                  padding: '12px 16px',
                  borderBottom: '2px solid #1a1a2e',
                  fontWeight: '700',
                  fontSize: '13px',
                  textTransform: 'uppercase',
                  letterSpacing: '1px',
                  color: '#495057',
                }}
              >
                Description
              </th>
              <th
                style={{
                  textAlign: 'right',
                  padding: '12px 16px',
                  borderBottom: '2px solid #1a1a2e',
                  fontWeight: '700',
                  fontSize: '13px',
                  textTransform: 'uppercase',
                  letterSpacing: '1px',
                  color: '#495057',
                }}
              >
                Amount
              </th>
            </tr>
          </thead>
          <tbody>
            {lineItems.map((item, index) => (
              <tr key={index}>
                <td
                  style={{
                    padding: '10px 16px',
                    borderBottom: '1px solid #e9ecef',
                    color: '#212529',
                  }}
                >
                  {item.label}
                </td>
                <td
                  style={{
                    padding: '10px 16px',
                    borderBottom: '1px solid #e9ecef',
                    textAlign: 'right',
                    fontFamily: 'system-ui, -apple-system, sans-serif',
                    color: '#212529',
                  }}
                >
                  {formatCurrency(item.amount)}
                </td>
              </tr>
            ))}
            {/* Total Row */}
            <tr>
              <td
                style={{
                  padding: '14px 16px',
                  borderTop: '2px solid #1a1a2e',
                  fontWeight: '700',
                  fontSize: '16px',
                  color: '#1a1a2e',
                }}
              >
                TOTAL
              </td>
              <td
                style={{
                  padding: '14px 16px',
                  borderTop: '2px solid #1a1a2e',
                  textAlign: 'right',
                  fontWeight: '700',
                  fontSize: '16px',
                  fontFamily: 'system-ui, -apple-system, sans-serif',
                  color: '#1a1a2e',
                }}
              >
                {formatCurrency(total)}
              </td>
            </tr>
          </tbody>
        </table>

        {/* Payment Section */}
        <div
          style={{
            background: '#f8f9fa',
            border: '1px solid #e9ecef',
            borderRadius: '4px',
            padding: '16px 20px',
            marginBottom: '32px',
            fontSize: '14px',
          }}
        >
          <h3 style={{ fontSize: '14px', fontWeight: '700', margin: '0 0 12px 0', textTransform: 'uppercase', letterSpacing: '1px', color: '#495057' }}>
            Payment Details
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px 24px' }}>
            <p style={{ margin: 0 }}>
              <strong>Amount Paid:</strong>{' '}
              <span style={{ color: '#28a745', fontWeight: '600', fontFamily: 'system-ui, sans-serif' }}>
                {formatCurrency(billing.amountPaid)}
              </span>
            </p>
            <p style={{ margin: 0 }}>
              <strong>Amount Due:</strong>{' '}
              <span
                style={{
                  color: (billing.amountDue || 0) > 0 ? '#dc3545' : '#28a745',
                  fontWeight: '600',
                  fontFamily: 'system-ui, sans-serif',
                }}
              >
                {formatCurrency(billing.amountDue)}
              </span>
            </p>
            <p style={{ margin: 0 }}>
              <strong>Payment Mode:</strong> {billing.paymentMode || '--'}
            </p>
            {(billing.tpaName || billing.tpaId) && (
              <p style={{ margin: 0 }}>
                <strong>TPA:</strong> {billing.tpaName || '--'}{billing.tpaId ? ` (ID: ${billing.tpaId})` : ''}
              </p>
            )}
          </div>
        </div>

        {/* Footer */}
        <div
          style={{
            borderTop: '1px solid #dee2e6',
            paddingTop: '24px',
            textAlign: 'center',
          }}
        >
          <p style={{ fontSize: '15px', fontStyle: 'italic', color: '#495057', margin: '0 0 8px 0' }}>
            Thank you for choosing Dr. Dubay Clinic
          </p>
          <p style={{ fontSize: '12px', color: '#6c757d', margin: '0 0 4px 0' }}>
            For queries, please contact us at the clinic reception
          </p>
          <p style={{ fontSize: '12px', color: '#6c757d', margin: 0 }}>
            This is a computer-generated invoice.
          </p>
        </div>
      </div>
    </>
  );
}
