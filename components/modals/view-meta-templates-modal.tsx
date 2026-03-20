"use client";

import {
  Dialog,
  DialogContent,
  DialogTitle,
  Typography,
  Box,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Chip,
} from "@mui/material";
import { useModal } from "@/hooks/use-modal-store";
import { useState, useEffect } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { Delete, Add, Send } from "@mui/icons-material";

interface MetaTemplate {
  id: string;
  name: string;
  displayName: string;
  description?: string | null;
  isActive: boolean;
  createdAt: string;
}

export const ViewMetaTemplatesModal = () => {
  const { isOpen, onClose, type, onOpen } = useModal();
  const isModalOpen = isOpen && type === "viewMetaTemplates";
  const [templates, setTemplates] = useState<MetaTemplate[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchTemplates = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get("/api/meta-templates");
      setTemplates(response.data);
    } catch (error) {
      toast.error("Failed to fetch templates");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isModalOpen) {
      fetchTemplates();
    }
  }, [isModalOpen]);

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete "${name}"?`)) {
      return;
    }

    try {
      await axios.delete(`/api/meta-templates?id=${id}`);
      toast.success("Template deleted successfully");
      fetchTemplates();
    } catch (error) {
      toast.error("Failed to delete template");
    }
  };

  const handleSendTemplate = (template: MetaTemplate) => {
    onClose();
    onOpen("sendWhatsAppTemplate", { metaTemplate: template });
  };

  return (
    <Dialog 
      open={isModalOpen} 
      onClose={onClose}
      maxWidth="lg"
      fullWidth
    >
      <DialogContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <DialogTitle sx={{ p: 0 }}>
            <Typography variant="h5" component="h2">
              Meta Templates ({templates.length})
            </Typography>
          </DialogTitle>
          
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => {
              onClose();
              onOpen("addMetaTemplate");
            }}
          >
            Add Template
          </Button>
        </Box>

        {isLoading ? (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography>Loading templates...</Typography>
          </Box>
        ) : templates.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography color="text.secondary">
              No Meta templates found. Add your first template to get started.
            </Typography>
          </Box>
        ) : (
          <TableContainer component={Paper} elevation={0} sx={{ border: 1, borderColor: 'divider' }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell><strong>Template Name</strong></TableCell>
                  <TableCell><strong>Display Name</strong></TableCell>
                  <TableCell><strong>Description</strong></TableCell>
                  <TableCell><strong>Status</strong></TableCell>
                  <TableCell><strong>Created</strong></TableCell>
                  <TableCell align="center"><strong>Actions</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {templates.map((template) => (
                  <TableRow key={template.id}>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                        {template.name}
                      </Typography>
                    </TableCell>
                    <TableCell>{template.displayName}</TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        {template.description || '-'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={template.isActive ? 'Active' : 'Inactive'} 
                        color={template.isActive ? 'success' : 'default'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        {new Date(template.createdAt).toLocaleDateString()}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
                        <Button
                          size="small"
                          variant="contained"
                          color="primary"
                          startIcon={<Send />}
                          onClick={() => handleSendTemplate(template)}
                        >
                          Send
                        </Button>
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => handleDelete(template.id, template.displayName)}
                        >
                          <Delete />
                        </IconButton>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </DialogContent>
    </Dialog>
  );
}; 