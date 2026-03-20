"use client";

import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import { useModal } from "@/hooks/use-modal-store";
import { Paper, Typography } from '@mui/material';

export const ViewTemplateModal = () => {
  const { isOpen, onClose, type, data } = useModal();
  const template = data?.template;

  if (!template) return null;

  return (
    <Dialog
      open={isOpen && type === "viewTemplate"}
      onClose={onClose}
      maxWidth="md"
      fullWidth
    >
      <DialogTitle className="bg-primary text-white p-4">
        Template Preview: {template.displayName}
      </DialogTitle>
      <DialogContent className="p-6">
        <Paper elevation={0} className="p-4 space-y-4">
          <div>
            <Typography variant="subtitle2" color="textSecondary">
              Template Name
            </Typography>
            <Typography variant="body1">
              {template.name}
            </Typography>
          </div>

          <div>
            <Typography variant="subtitle2" color="textSecondary">
              Category
            </Typography>
            <Typography variant="body1">
              {template.category}
            </Typography>
          </div>

          {template.headerContent && (
            <div>
              <Typography variant="subtitle2" color="textSecondary">
                Header ({template.headerType})
              </Typography>
              <Typography variant="body1">
                {template.headerContent}
              </Typography>
            </div>
          )}

          <div>
            <Typography variant="subtitle2" color="textSecondary">
              Body Content
            </Typography>
            <Typography variant="body1">
              {template.bodyContent}
            </Typography>
          </div>

          {template.footerContent && (
            <div>
              <Typography variant="subtitle2" color="textSecondary">
                Footer
              </Typography>
              <Typography variant="body1">
                {template.footerContent}
              </Typography>
            </div>
          )}

          {template.buttons && template.buttons.length > 0 && (
            <div>
              <Typography variant="subtitle2" color="textSecondary">
                Buttons
              </Typography>
              <div className="space-y-2">
                {template.buttons?.map((button: any) => (
                  <Paper key={button.id} variant="outlined" className="p-2">
                    <Typography variant="body2">
                      {button.type}: {button.text}
                      {button.url && ` (${button.url})`}
                    </Typography>
                  </Paper>
                ))}
              </div>
            </div>
          )}
        </Paper>
      </DialogContent>
    </Dialog>
  );
}; 