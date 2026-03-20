"use client";

import { useEffect, useState } from "react";
import { Plus, Edit2, Trash2, Eye } from "lucide-react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { EmptyState } from "@/components/empty-state";
import { Button } from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import { useModal } from "@/hooks/use-modal-store";
import toast from "react-hot-toast";

export default function TemplatesPage() {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const { onOpen } = useModal();
  const router = useRouter();

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    try {
      const response = await axios.get("/api/templates");
      setTemplates(response.data);
    } catch (error) {
      console.error("Failed to fetch templates:", error);
      toast.error("Failed to load templates");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await axios.delete(`/api/templates/${id}`);
      toast.success("Template deleted successfully");
      fetchTemplates();
    } catch (error) {
      console.error("Failed to delete template:", error);
      toast.error("Failed to delete template");
    }
  };

  const columns = [
    { field: 'name', headerName: 'Template Name', flex: 1 },
    { field: 'displayName', headerName: 'Display Name', flex: 1 },
    { field: 'category', headerName: 'Category', flex: 1 },
    { field: 'language', headerName: 'Language', flex: 1 },
    { field: 'status', headerName: 'Status', flex: 1 },
    {
      field: 'actions',
      headerName: 'Actions',
      flex: 1,
      renderCell: (params: any) => (
        <div className="flex gap-2">
          <Tooltip title="View Template">
            <IconButton 
              onClick={() => onOpen("viewTemplate", { template: params.row })}
              size="small"
            >
              <Eye className="h-4 w-4" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Edit Template">
            <IconButton 
              onClick={() => onOpen("editTemplate", { template: params.row })}
              size="small"
            >
              <Edit2 className="h-4 w-4" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Delete Template">
            <IconButton 
              onClick={() => handleDelete(params.row.id)}
              size="small"
              color="error"
            >
              <Trash2 className="h-4 w-4" />
            </IconButton>
          </Tooltip>
        </div>
      ),
    },
  ];

  if (!templates.length) {
    return (
      <div className="h-full p-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold">WhatsApp Templates</h1>
          <Button
            variant="contained"
            startIcon={<Plus />}
            onClick={() => onOpen("createTemplate")}
          >
            Create Template
          </Button>
        </div>
        <EmptyState 
          title="No templates found" 
          description="Get started by creating your first WhatsApp message template."
        />
      </div>
    );
  }

  return (
    <div className="h-full p-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold">WhatsApp Templates</h1>
        <Button
          variant="contained"
          startIcon={<Plus />}
          onClick={() => onOpen("createTemplate")}
        >
          Create Template
        </Button>
      </div>
      <div style={{ height: 400, width: '100%' }}>
        <DataGrid
          rows={templates}
          columns={columns}
          initialState={{
            pagination: {
              paginationModel: { pageSize: 5, page: 0 },
            },
          }}
          pageSizeOptions={[5]}
          checkboxSelection
          disableRowSelectionOnClick
        />
      </div>
    </div>
  );
} 