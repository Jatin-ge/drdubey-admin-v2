"use client";

import axios from "axios";

import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { Button } from "@/components/ui/button";
import { useModal } from "@/hooks/use-modal-store";
import toast from "react-hot-toast";

export const WHATSAPP_API_VERSION = process.env.WHATSAPP_API_VERSION || 'v18.0';
export const WHATSAPP_PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID || '197226183475191';

export const SendAppointmentReminder = () => {
  const { isOpen, onClose, type, data } = useModal();

  const header = {
    headers: {
      Authorization: process.env.NEXT_PUBLIC_WHATSAPP_TOKEN,
      Accept: "application/json"
    }
  };

  const isModalOpen = isOpen && type === "sendAppointmentReminder";
  const appointments = data?.selectedLeads || [];

  const onSubmit = async () => {
    try {
      for (const appointment of appointments) {
        const body = {
          messaging_product: "whatsapp",
          recipient_type: "individual",
          to: appointment.phone?.startsWith("+") 
            ? appointment.phone 
            : `+91${appointment.phone}`,
          type: "template",
          template: {
            name: "booking_confirmation",
            language: {
              code: "en_US"
            },
            components: [
              {
                type: "body",
                parameters: [
                  {
                    type: "text",
                    text: appointment.name
                  },
                  {
                    type: "text",
                    text: appointment.doad || 'Not scheduled'
                  },
                  {
                    type: "text",
                    text: appointment.patientStatus || 'Not specified'
                  }
                ]
              }
            ]
          }
        };

        await axios.post(
          `https://graph.facebook.com/${WHATSAPP_API_VERSION}/${WHATSAPP_PHONE_NUMBER_ID}/messages`, 
          body, 
          header
        );
      }
      
      toast.success("Messages sent successfully");
      handleClose();
    } catch (error) {
      console.error("Failed to send reminders:", error);
      toast.error("Failed to send reminders");
    }
  };

  const handleClose = () => {
    onClose();
  };

  return (
    <Dialog open={isModalOpen} onOpenChange={handleClose}>
      <DialogContent className="bg-white text-black p-0 overflow-hidden">
        <DialogHeader className="pt-8 px-6">
          <DialogTitle className="text-3xl text-center font-bold m-4">
            Send Appointment Reminder to {appointments.length} clients
          </DialogTitle>
        </DialogHeader>
        <DialogFooter className="bg-gray-100 px-6 py-4 flex text-center">
          <Button 
            variant="primary" 
            onClick={onSubmit}
            disabled={appointments.length === 0}
          >
            Send
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
