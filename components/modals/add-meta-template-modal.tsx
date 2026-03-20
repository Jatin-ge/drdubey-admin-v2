"use client";

import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  TextField,
  Button,
  Typography,
  Box,
  Alert,
} from "@mui/material";
import { useModal } from "@/hooks/use-modal-store";
import { useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";

const formSchema = z.object({
  name: z.string()
    .min(1, "Template name is required")
    .regex(/^[a-z0-9_]+$/, "Only lowercase letters, numbers, and underscores allowed"),
  displayName: z.string().min(1, "Display name is required"),
  description: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

export const AddMetaTemplateModal = () => {
  const { isOpen, onClose, type } = useModal();
  const isModalOpen = isOpen && type === "addMetaTemplate";
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      displayName: "",
      description: "",
    }
  });

  const onSubmit = async (values: FormValues) => {
    try {
      setIsLoading(true);
      
      await axios.post("/api/meta-templates", values);
      
      toast.success("Meta template added successfully");
      form.reset();
      onClose();
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Failed to add template");
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    form.reset();
    onClose();
  };

  return (
    <Dialog 
      open={isModalOpen} 
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
    >
      <DialogContent>
        <DialogTitle>
          <Typography variant="h5" component="h2">
            Add Meta Template
          </Typography>
        </DialogTitle>

        <Alert severity="info" sx={{ mb: 3 }}>
          <Typography variant="body2">
            Add the name of a template that you've already created in the Meta Business Manager. 
            Make sure the template is approved before adding it here.
          </Typography>
        </Alert>

        <Box component="form" onSubmit={form.handleSubmit(onSubmit)} sx={{ mt: 2 }}>
          <TextField
            fullWidth
            label="Template Name"
            placeholder="e.g., appointment_reminder"
            {...form.register("name")}
            error={!!form.formState.errors.name}
            helperText={form.formState.errors.name?.message || "Exact name from Meta console"}
            disabled={isLoading}
            sx={{ mb: 3 }}
          />

          <TextField
            fullWidth
            label="Display Name"
            placeholder="e.g., Appointment Reminder"
            {...form.register("displayName")}
            error={!!form.formState.errors.displayName}
            helperText={form.formState.errors.displayName?.message || "User-friendly name"}
            disabled={isLoading}
            sx={{ mb: 3 }}
          />

          <TextField
            fullWidth
            label="Description (Optional)"
            placeholder="Brief description of the template"
            multiline
            rows={3}
            {...form.register("description")}
            disabled={isLoading}
            sx={{ mb: 3 }}
          />

          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
            <Button
              variant="outlined"
              onClick={handleClose}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={isLoading}
            >
              {isLoading ? 'Adding...' : 'Add Template'}
            </Button>
          </Box>
        </Box>
      </DialogContent>
    </Dialog>
  );
}; 