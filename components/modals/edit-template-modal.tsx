"use client";

import { useEffect } from "react";
import { useModal } from "@/hooks/use-modal-store";
import { Dialog, DialogContent, DialogTitle } from "@mui/material";
import { CreateTemplateModal } from "./create-template-modal";

interface Template {
  id: string;
  name: string;
  displayName: string;
  category: string;
  language: string;
  headerType: string;
  headerContent?: string;
  bodyContent: string;
  footerContent?: string;
  buttons?: any[];
  createdAt: Date;
}

export const EditTemplateModal = () => {
  const { isOpen, onClose, type, data } = useModal();
  const isModalOpen = isOpen && type === "editTemplate";
  
  console.log("EditTemplateModal:", { isOpen, type, data }); // Debug log
  
  // Type check the template data
  const templateData = data?.template as Template | undefined;
  
  console.log("Template data:", templateData); // Debug log

  return (
    <Dialog 
      open={isModalOpen} 
      onClose={onClose}
      maxWidth="md"
      fullWidth
    >
      <DialogTitle>
        Edit Template
      </DialogTitle>
      <DialogContent>
        {templateData && (
          <CreateTemplateModal 
            isEditing={true}
            templateData={templateData}
            onClose={onClose}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}; 