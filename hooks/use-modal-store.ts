import {create} from "zustand"
import { Lead } from "@prisma/client";
import { LeadCloumn } from "@/app/admin/patients/components/column";
import { RowModel } from "@tanstack/react-table";


export type ModalType = 
  | "createPatient" 
  | "sendMessage" 
  | "sendBulkMessage" 
  | "createDiscussion" 
  | "editDiscussion" 
  | "sendAppointmentReminder" 
  | "payment" 
  | "selectCity" 
  | "imageUpload" 
  | "createTemplate"
  | "viewTemplates"
  | "editTemplate"
  | "viewTemplate"
  | "addMetaTemplate"
  | "viewMetaTemplates"
  | "sendWhatsAppTemplate";

interface ModalData {
    lead?: Lead;
    recipent?: LeadCloumn;
    selectedLeads?: LeadCloumn[];
    template?: {
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
    };
    metaTemplate?: {
        id: string;
        name: string;
        displayName: string;
        description?: string | null;
    };
    appointment?: any;
}

interface ModalStore {
  type: ModalType | null;
  data: ModalData | undefined;
  isOpen: boolean;
  onOpen: (type: ModalType, data?: ModalData) => void;
  onClose: () => void;
}

export const useModal = create<ModalStore>((set) => ({
  type: null,
  data: undefined,
  isOpen: false,
  onOpen: (type, data) => set({ isOpen: true, type, data }),
  onClose: () => set({ type: null, isOpen: false, data: undefined })
}));