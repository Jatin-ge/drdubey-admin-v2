"use client";

import { useModal } from "@/hooks/use-modal-store";
import { Dialog, DialogContent, DialogTitle } from "@mui/material";
import { DataGrid } from '@mui/x-data-grid';
import { Edit, Delete, Send } from "@mui/icons-material";
import { IconButton, Button, CircularProgress, Typography } from "@mui/material";
import { useState, useEffect } from "react";
import axios from "axios";
import toast from "react-hot-toast";

interface Template {
  id: string;
  name: string;
  displayName: string;
  category: string;
  language: string;
  headerType: string;
  headerContent?: string | null;
  bodyContent: string;
  footerContent?: string | null;
  buttons?: Array<{
    type: string;
    text: string;
    url?: string;
  }>;
}

interface GridParams {
  row: Template;
}

export const ViewTemplatesModal = () => {
  const { isOpen, onClose, type } = useModal();
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);

  const isModalOpen = isOpen && type === "viewTemplates";

  const fetchTemplates = async () => {
    try {
      const response = await axios.get("/api/templates");
      setTemplates(response.data);
    } catch (error) {
      toast.error("Failed to fetch templates");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isModalOpen) {
      fetchTemplates();
    }
  }, [isModalOpen]);

  const handleEdit = (template: Template) => {
    onClose();
    useModal.getState().onOpen("editTemplate", { template });
  };

  const handleDelete = async (template: Template) => {
    try {
      await axios.delete(`/api/templates/${template.id}`);
      toast.success("Template deleted successfully");
      fetchTemplates();
    } catch (error) {
      toast.error("Failed to delete template");
    }
  };

  const handleSend = (template: Template) => {
    onClose();
    useModal.getState().onOpen("sendMessage", { template });
  };

  const columns = [
    { field: 'name', headerName: 'Name', width: 150 },
    { field: 'displayName', headerName: 'Display Name', width: 200 },
    { field: 'category', headerName: 'Category', width: 130 },
    { field: 'language', headerName: 'Language', width: 130 },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 200,
      renderCell: (params: GridParams) => (
        <div className="flex gap-2">
          <IconButton onClick={() => handleEdit(params.row)}>
            <Edit />
          </IconButton>
          <IconButton onClick={() => handleDelete(params.row)}>
            <Delete />
          </IconButton>
          <IconButton onClick={() => handleSend(params.row)}>
            <Send />
          </IconButton>
        </div>
      ),
    },
  ];

  return (
    <Dialog 
      open={isModalOpen} 
      onClose={onClose}
      maxWidth="lg"
      fullWidth
    >
      <DialogTitle>Templates</DialogTitle>
      <DialogContent>
        {loading ? (
          <div className="flex items-center justify-center p-8">
            <CircularProgress />
          </div>
        ) : templates.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-8 text-gray-500">
            <Typography variant="body1">No templates found</Typography>
            <Button 
              onClick={() => {
                onClose();
                useModal.getState().onOpen("createTemplate");
              }}
              variant="contained"
              sx={{ mt: 2 }}
            >
              Create Template
            </Button>
          </div>
        ) : (
          <div style={{ height: 400, width: '100%' }}>
            <DataGrid
              rows={templates}
              columns={columns}
              initialState={{
                pagination: {
                  paginationModel: { pageSize: 5 }
                },
              }}
              pageSizeOptions={[5]}
              disableRowSelectionOnClick
            />
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}; 