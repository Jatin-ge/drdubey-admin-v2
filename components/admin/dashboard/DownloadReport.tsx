// DownloadReport.tsx
"use client";

import { useState } from "react";
import { 
  DownloadCloud,
  FileSpreadsheet,
  FileText
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

// Type for the graph revenue data
interface GraphData {
  name: string;
  total: number;
}

// Type for our dashboard data
interface DashboardData {
  totalRevenue: number;
  totalAppointments: number;
  newLeads: number;
  totalPatients: number;
  revenueByMonth: GraphData[];  // Updated to match the actual data structure
  
}

const generateCSV = (data: DashboardData): string => {
  const headers = [
    "Metric,Value",
    `Total Revenue,₹${data.totalRevenue}`,
    `Total Appointments,${data.totalAppointments}`,
    `New Leads,${data.newLeads}`,
    `Total Patients,${data.totalPatients}`,
    "\nMonthly Revenue",
    "Month,Revenue",
    ...data.revenueByMonth.map(item => `${item.name},₹${item.total}`),
    "\nToday's Appointments",
    "Patient Name,Time,Service",
    
  ].join("\n");
  
  return headers;
};

const generateExcel = async (data: DashboardData): Promise<Uint8Array> => {
  // Using xlsx library to create Excel file
  const XLSX = await import('xlsx');
  
  const workbook = XLSX.utils.book_new();
  
  // Overview sheet
  const overviewData = [
    ["Metric", "Value"],
    ["Total Revenue", `₹${data.totalRevenue}`],
    ["Total Appointments", data.totalAppointments],
    ["New Leads", data.newLeads],
    ["Total Patients", data.totalPatients]
  ];
  const overviewSheet = XLSX.utils.aoa_to_sheet(overviewData);
  XLSX.utils.book_append_sheet(workbook, overviewSheet, "Overview");

  // Monthly Revenue sheet
  const revenueData = [
    ["Month", "Revenue"],
    ...data.revenueByMonth.map(item => [item.name, `₹${item.total}`])
  ];
  const revenueSheet = XLSX.utils.aoa_to_sheet(revenueData);
  XLSX.utils.book_append_sheet(workbook, revenueSheet, "Monthly Revenue");

  // Appointments sheet
  const appointmentsData = [
    ["Patient Name", "Time", "Service"],
    
  ];
  const appointmentsSheet = XLSX.utils.aoa_to_sheet(appointmentsData);
  XLSX.utils.book_append_sheet(workbook, appointmentsSheet, "Today's Appointments");

  return XLSX.write(workbook, { type: "array", bookType: "xlsx" });
};

const downloadFile = (data: string | Uint8Array, fileName: string) => {
  const blob = new Blob([data], { 
    type: fileName.endsWith('.csv') 
      ? 'text/csv;charset=utf-8;' 
      : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', fileName);
  document.body.appendChild(link);
  link.click();
  link.parentNode?.removeChild(link);
};

export const DownloadReport = ({ 
  totalRevenue,
  totalAppointments,
  newLeads,
  totalPatients,
  revenueByMonth,

}: DashboardData) => {
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownload = async (format: 'csv' | 'excel') => {
    setIsDownloading(true);
    try {
      const dashboardData = {
        totalRevenue,
        totalAppointments,
        newLeads,
        totalPatients,
        revenueByMonth,
        
      };

      const date = new Date().toISOString().split('T')[0];
      const fileName = `dashboard-report-${date}.${format === 'csv' ? 'csv' : 'xlsx'}`;

      if (format === 'csv') {
        const csvContent = generateCSV(dashboardData);
        downloadFile(csvContent, fileName);
      } else {
        const excelContent = await generateExcel(dashboardData);
        downloadFile(excelContent, fileName);
      }
    } catch (error) {
      console.error('Error generating report:', error);
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button disabled={isDownloading}>
          <DownloadCloud className="mr-2 h-4 w-4" />
          {isDownloading ? 'Downloading...' : 'Download Report'}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem onClick={() => handleDownload('excel')}>
          <FileSpreadsheet className="mr-2 h-4 w-4" />
          Excel (.xlsx)
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleDownload('csv')}>
          <FileText className="mr-2 h-4 w-4" />
          CSV
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};