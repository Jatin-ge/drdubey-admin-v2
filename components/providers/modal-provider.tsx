"use client"

import { useEffect, useState } from "react"
import { SendMessageModal } from "../modals/send-message-modal";
import { SendBulkMessageModal } from "../modals/send-bulk-messages";
import { CreateDiscuusionModal } from "../modals/create-discussion";
import { EditDiscussionModal } from "../modals/edit-discussion";
import { SendAppointmentReminder } from "../modals/appointment-reminder-modal";
import { PaymentModal } from "../modals/payment-info-modal";
import { SelectCityModal } from "../modals/select-city";
import ImageUplaodModal from "../modals/image-upload-modal";
import { CreateTemplateModal } from "@/components/modals/create-template-modal";
import { ViewTemplatesModal } from "../modals/view-templates-modal";
import { EditTemplateModal } from "../modals/edit-template-modal";
import { AddMetaTemplateModal } from "../modals/add-meta-template-modal";
import { ViewMetaTemplatesModal } from "../modals/view-meta-templates-modal";

export const ModalProvider = () => {
    const [isMounted,  setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, [])

    if(!isMounted){
        return null;
    }
    return(
        <>
            <ViewTemplatesModal />
            <CreateTemplateModal />
            <EditTemplateModal />
            <AddMetaTemplateModal />
            <ViewMetaTemplatesModal />
            <SendMessageModal/>
            <SendBulkMessageModal/>
            <CreateDiscuusionModal/>
            <EditDiscussionModal/>
            <SendAppointmentReminder/>
            <PaymentModal/>
            <SelectCityModal/>
            <ImageUplaodModal/>
        </>
    )
}