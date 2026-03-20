"use client";
import { Plus, FileDown, Eye } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import * as XLSX from 'xlsx';
import dynamic from 'next/dynamic';
import AddIcon from '@mui/icons-material/Add';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import TemplateIcon from '@mui/icons-material/Description';
import { Button as MuiButton } from '@mui/material';
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

import { columns, LeadCloumn } from "./column";
import { DataTable, DataTableRef } from "@/components/ui/data-table";
import { useModal } from "@/hooks/use-modal-store";
import { cn } from "@/lib/utils";
import { useEffect, useRef, useState } from "react";

interface BillboardClientProps {
  data: LeadCloumn[];
}

export const BillboardClient: React.FC<BillboardClientProps> = ({
  data
}) => {
  const params = useParams();
  const router = useRouter();
  const tableRef = useRef<DataTableRef<LeadCloumn>>(null);
  const { onOpen } = useModal();
  const [isLoading, setIsLoading] = useState(false);
  const [selectedCount, setSelectedCount] =useState(0);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    const count = tableRef.current?.getSelectedData()?.length || 0;
    setSelectedCount(count);
  }, [tableRef.current?.getSelectedData()]);

 

  const prepareExportData = (exportType: 'all' | 'current' | 'selected' | 'filtered') => {
    let exportData: LeadCloumn[] = [];
    
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
      case 'filtered':
        exportData = tableRef.current?.getFilteredData() || [];
        break;
    }

    // Remove the actions column and id from the export data
    return exportData.map(item => {
      const { id, ...rest } = item;
      return rest;
    });
  };

  const handleExport = (format: 'csv' | 'xlsx', exportType: 'all' | 'current' | 'selected' | 'filtered') => {
    const exportData = prepareExportData(exportType);
    
    if (exportData.length === 0) {
      alert('No data to export!');
      return;
    }

    const fileName = `patients-${exportType}-data.${format}`;

    if (format === 'csv') {
      const ws = XLSX.utils.json_to_sheet(exportData);
      const csv = XLSX.utils.sheet_to_csv(ws);
      downloadFile(csv, fileName, 'text/csv');
    } else {
      const ws = XLSX.utils.json_to_sheet(exportData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Patients');
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

  // Don't render anything until mounted
  if (!isMounted) {
    return null;
  }

  return (
    <>
      <div className="flex items-center justify-between">
        <Heading title={`Leads (${data.length})`} description="Manage patients for your hospital" />
        <div className="flex items-center gap-4">
          <MuiButton
            variant="contained"
            color="secondary"
            startIcon={<WhatsAppIcon />}
            onClick={() => onOpen("sendBulkMessage", {
              selectedLeads: tableRef.current?.getSelectedData()
            })}
            disabled={selectedCount === 0}
          >
            Send WhatsApp ({selectedCount})
          </MuiButton>

          <div className="flex items-center gap-2 border-l border-r px-4">
            <MuiButton
              variant="contained"
              color="info"
              startIcon={<TemplateIcon />}
              onClick={() => onOpen("viewTemplates")}
              className="whitespace-nowrap"
            >
              View Templates
            </MuiButton>

            <MuiButton
              variant="contained"
              color="primary"
              startIcon={<AddIcon />}
              onClick={() => onOpen("createTemplate")}
              className="whitespace-nowrap"
            >
              Create Template
            </MuiButton>

            <MuiButton
              variant="contained"
              color="success"
              startIcon={<TemplateIcon />}
              onClick={() => onOpen("viewMetaTemplates")}
              className="whitespace-nowrap"
            >
              Meta Templates
            </MuiButton>

            <MuiButton
              variant="outlined"
              color="secondary"
              startIcon={<AddIcon />}
              onClick={() => onOpen("addMetaTemplate")}
              className="whitespace-nowrap"
            >
              Add Meta Template
            </MuiButton>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                disabled={selectedCount === 0}
                variant="outline"
                size="sm"
                className="ml-auto"
              >
                <FileDown className="h-4 w-4 mr-2" />
                Export
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
                <DropdownMenuSubTrigger>Export Filtered Records</DropdownMenuSubTrigger>
                <DropdownMenuPortal>
                  <DropdownMenuSubContent>
                    <DropdownMenuItem onClick={() => handleExport('csv', 'filtered')}>
                      as CSV
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleExport('xlsx', 'filtered')}>
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
          
          <MuiButton
            variant="contained"
            color="success"
            startIcon={<AddIcon />}
            onClick={() => router.push(`/admin/addpatient`)}
          >
            Add New
          </MuiButton>
        </div>
      </div>
      <Separator />
      <DataTable 
        ref={tableRef}
        columns={columns} 
        data={data}
        onSelectionChange={(count: number) => setSelectedCount(count)}
        enableFiltering={true}
        searchableColumns={[
          'name',
          'phone',
          'city',
          'surgery',
          'implant',
          'patientStatus',
          'hospital'
        ]}
        filterableColumns={[
          {
            id: 'patientStatus',
            title: 'Patient Status'
          },
          {
            id: 'city',
            title: 'City'
          },
          {
            id: 'surgery',
            title: 'Surgery'
          },
          {
            id: 'implant',
            title: 'Implant'
          },
          {
            id: 'hospital',
            title: 'Hospital'
          }
        ]}
      />
    </>
  );
};