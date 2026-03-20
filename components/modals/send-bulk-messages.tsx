"use client";

import axios from "axios";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { MessageCircle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { useModal } from "@/hooks/use-modal-store";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ScrollArea } from "../ui/scroll-area";
import toast from "react-hot-toast";
import { useState, useEffect } from "react";
import { LeadCloumn } from "@/app/admin/patients/components/column";

interface MetaTemplate {
  id: string;
  name: string;
  displayName: string;
  description?: string | null;
  isActive: boolean;
  createdAt: string;
}

interface SendBulkMessagesModalProps {
  isOpen: boolean;
  onClose: () => void;
  data?: {
    selectedLeads?: LeadCloumn[];
  };
}

const formSchema = z.object({
  template: z.string().min(1, "Please select a template"),
  language: z.string().min(1, "Language is required"),
});

const formatPhoneNumber = (phone: string | null): string => {
  if (!phone) return "";
  
  const cleaned = phone.replace(/\D/g, '');
  
  if (!cleaned.startsWith('91')) {
    return `91${cleaned}`;
  }
  
  return cleaned;
};

export const SendBulkMessageModal = () => {
  const { isOpen, onClose, type, data } = useModal();
  const [templates, setTemplates] = useState<MetaTemplate[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        const response = await axios.get("/api/meta-templates");
        setTemplates(response.data);
      } catch (error) {
        toast.error("Failed to load Meta templates");
      }
    };

    if (isOpen) {
      fetchTemplates();
    }
  }, [isOpen]);

  const isModalOpen = isOpen && type === "sendBulkMessage";

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      template: "",
      language: "en_US",
    },
  });

  const recipients = data?.selectedLeads || [];

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      setIsLoading(true);
      
      // Prepare recipients with formatted phone numbers
      const formattedRecipients = recipients
        .filter(recipient => recipient.phone)
        .map(recipient => ({
          name: recipient.name,
          phone: formatPhoneNumber(recipient.phone)
        }))
        .filter(recipient => recipient.phone);

      if (formattedRecipients.length === 0) {
        toast.error("No valid phone numbers found");
        return;
      }

      const response = await axios.post("/api/send-whatsapp", {
        templateName: values.template,
        language: values.language,
        recipients: formattedRecipients
      });

      const result = response.data;
      
      if (result.success) {
        toast.success(`Successfully sent ${result.sent} messages${result.failed > 0 ? `, ${result.failed} failed` : ''}`);
      } else {
        toast.error("Failed to send messages");
      }

      // Show detailed results if there are errors
      if (result.errors && result.errors.length > 0) {
        console.error("Failed messages:", result.errors);
      }

      form.reset();
      onClose();
    } catch (error: any) {
      console.error("Error sending messages:", error);
      toast.error(error.response?.data?.error || "Failed to send messages");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isModalOpen} onOpenChange={onClose}>
      <DialogContent className="bg-white text-black p-0 overflow-hidden max-w-4xl">
        <DialogHeader className="pt-8 px-6">
          <DialogTitle className="text-2xl text-center font-bold flex items-center justify-center gap-2">
            <MessageCircle className="h-6 w-6 text-primary" />
            Send WhatsApp Messages (Meta Templates)
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-5 gap-4 p-6">
          <div className="col-span-3">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                <div className="space-y-8">
                  <FormField
                    control={form.control}
                    name="template"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-semibold text-gray-700">
                          Select Meta Template
                        </FormLabel>
                        <Select
                          disabled={isLoading}
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger className="bg-gray-50 border border-gray-200 h-12 focus:ring-primary">
                              <SelectValue placeholder="Choose a Meta template" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="max-h-[300px]">
                            {templates.length === 0 ? (
                              <div className="px-2 py-4 text-center text-gray-500">
                                No Meta templates found. Add templates first.
                              </div>
                            ) : (
                              templates.map((template) => (
                                <SelectItem
                                  key={template.id}
                                  value={template.name}
                                  className="cursor-pointer hover:bg-gray-100"
                                >
                                  <div className="flex flex-col">
                                    <span className="font-medium">{template.displayName}</span>
                                    <span className="text-xs text-gray-500">Name: {template.name}</span>
                                    {template.description && (
                                      <span className="text-xs text-gray-400">{template.description}</span>
                                    )}
                                  </div>
                                </SelectItem>
                              ))
                            )}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="language"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-semibold text-gray-700">
                          Language
                        </FormLabel>
                        <Select
                          disabled={isLoading}
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger className="bg-gray-50 border border-gray-200 h-12 focus:ring-primary">
                              <SelectValue placeholder="Select language" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="en_US">English (US)</SelectItem>
                            <SelectItem value="en">English</SelectItem>
                            <SelectItem value="hi">Hindi</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </form>
            </Form>
          </div>

          <div className="col-span-2 bg-gray-50 rounded-lg p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-gray-700">
                Selected Recipients
              </h3>
              <span className="text-xs text-gray-500">
                Total: {recipients.length}
              </span>
            </div>

            <ScrollArea className="h-[300px] pr-4">
              <div className="space-y-2">
                {recipients.map((recipient: LeadCloumn, index: number) => (
                  <div
                    key={index}
                    className="bg-white p-3 rounded-lg border border-gray-200 shadow-sm"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-medium text-sm">
                          {recipient.name}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {recipient.phone}
                        </p>
                        {recipient.address && (
                          <p className="text-xs text-gray-500 mt-1">
                            {recipient.address}
                          </p>
                        )}
                      </div>
                      {recipient.city && (
                        <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">
                          {recipient.city}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>
        </div>

        <DialogFooter className="bg-gray-50 px-6 py-4">
          <div className="flex items-center justify-end gap-2 w-full">
            <Button
              variant="outline"
              onClick={onClose}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              onClick={form.handleSubmit(onSubmit)}
              disabled={isLoading || !recipients.length || templates.length === 0}
              className="bg-primary hover:bg-primary/90"
            >
              {isLoading ? "Sending..." : `Send to ${recipients.length} Recipients`}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
