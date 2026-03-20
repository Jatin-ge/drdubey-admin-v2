"use client";

import React from 'react';
import { Plus, FileDown } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import * as XLSX from 'xlsx';
import axios from "axios";

import { Button } from "@/components/ui/button";
import { Heading } from "@/components/ui/heading";
import { Separator } from "@/components/ui/separator";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuPortal,
} from "@/components/ui/dropdown-menu";

import { columns, AppointMentCloumn } from "./column";
import { DataTable, DataTableRef } from "@/components/ui/data-table-appointment";

interface BillboardClientProps {
  data: AppointMentCloumn[];
}

export const BillboardClient: React.FC<BillboardClientProps> = ({ data }) => {
  const params = useParams();
  const router = useRouter();
  const tableRef = React.useRef<DataTableRef>(null);
  const [cities, setCities] = React.useState<string[]>([]);

  React.useEffect(() => {
    const fetchCities = async () => {
      try {
        const response = await axios.get('/api/cities');
        setCities(response.data);
      } catch (error) {
        console.error('Failed to fetch cities:', error);
      }
    };

    fetchCities();
  }, []);

  const prepareExportData = (exportType: 'all' | 'current' | 'selected') => {
    let exportData: AppointMentCloumn[] = [];
    
    switch (exportType) {
      case 'all':
        exportData = data;
        break;
      case 'current':
        exportData = tableRef.current?.getCurrentPageData() || [];
        break;
      case 'selected':
        exportData = tableRef.current?.getSelectedData() || [];
        break;
    }

    // Remove sensitive data before export
    return exportData.map(item => {
      const { userId, ...rest } = item;
      return rest;
    });
  };

  const handleExport = (format: 'csv' | 'xlsx', exportType: 'all' | 'current' | 'selected') => {
    const exportData = prepareExportData(exportType);
    
    if (exportData.length === 0) {
      alert('No data to export!');
      return;
    }

    const fileName = `appointments-${exportType}-data.${format}`;

    if (format === 'csv') {
      const ws = XLSX.utils.json_to_sheet(exportData);
      const csv = XLSX.utils.sheet_to_csv(ws);
      downloadFile(csv, fileName, 'text/csv');
    } else {
      const ws = XLSX.utils.json_to_sheet(exportData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Appointments');
      XLSX.writeFile(wb, fileName);
    }
  };

  const downloadFile = (content: string, fileName: string, contentType: string) => {
    const blob = new Blob([content], { type: contentType });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    link.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <>
      <div className="flex items-center justify-between">
        <Heading
          title={`Appointments (${data.length})`}
          description="Manage your Appointments"
        />
        <div className="flex gap-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">
                <FileDown className="mr-2 h-4 w-4" />
                Export Data
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuSub>
                <DropdownMenuSubTrigger>Export All Records</DropdownMenuSubTrigger>
                <DropdownMenuPortal>
                  <DropdownMenuSubContent>
                    <DropdownMenuItem onClick={() => handleExport('csv', 'all')}>
                      as CSV
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleExport('xlsx', 'all')}>
                      as Excel
                    </DropdownMenuItem>
                  </DropdownMenuSubContent>
                </DropdownMenuPortal>
              </DropdownMenuSub>

              <DropdownMenuSub>
                <DropdownMenuSubTrigger>Export Current Page</DropdownMenuSubTrigger>
                <DropdownMenuPortal>
                  <DropdownMenuSubContent>
                    <DropdownMenuItem onClick={() => handleExport('csv', 'current')}>
                      as CSV
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleExport('xlsx', 'current')}>
                      as Excel
                    </DropdownMenuItem>
                  </DropdownMenuSubContent>
                </DropdownMenuPortal>
              </DropdownMenuSub>

              <DropdownMenuSub>
                <DropdownMenuSubTrigger>Export Selected</DropdownMenuSubTrigger>
                <DropdownMenuPortal>
                  <DropdownMenuSubContent>
                    <DropdownMenuItem onClick={() => handleExport('csv', 'selected')}>
                      as CSV
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleExport('xlsx', 'selected')}>
                      as Excel
                    </DropdownMenuItem>
                  </DropdownMenuSubContent>
                </DropdownMenuPortal>
              </DropdownMenuSub>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      <Separator />
      <DataTable 
        ref={tableRef}
        columns={columns} 
        data={data}
        filterableColumns={[
          {
            id: 'city',
            title: 'City'
          }
        ]}
      />
    </>
  );
};
