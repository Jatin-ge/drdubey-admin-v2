"use client";

import axios from "axios";
import { useState } from "react";
import { Edit, MessageSquareIcon, MoreHorizontal, Printer, Trash } from "lucide-react";
import { toast } from "react-hot-toast";
import { useParams, useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { AlertModal } from "@/components/modals/alert-modal";

import { LeadCloumn } from "./column";
import { useModal } from "@/hooks/use-modal-store";

interface CellActionProps {
  data: LeadCloumn;
}

export const CellAction: React.FC<CellActionProps> = ({ data }) => {
  const router = useRouter();
  const params = useParams();
  const {onOpen} = useModal();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const onConfirm = async () => {
    try {
      setLoading(true);
      await axios.delete(`/api/patients/${data.id}/delete`);
      toast.success("Lead deleted.");
      router.refresh();
    } catch (error) {
      toast.error(
        "Make sure you removed all categories using this billboard first."
      );
    } finally {
      setOpen(false);
      setLoading(false);
    }
  };

  const printReceipt = async () => {
    try{
       router.push(`/admin/receipt/${data.id}`);
    }
    catch(error){
      console.log(error)
    }
  }

  return (
    <>
      <AlertModal
        isOpen={open}
        onClose={() => setOpen(false)}
        onConfirm={onConfirm}
        loading={loading}
      />
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <span className="sr-only">Open menu</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Actions</DropdownMenuLabel>
          <DropdownMenuItem
            onClick={() => router.push(`/admin/patients/${data.id}`)}
          >
            <Edit className="mr-2 h-4 w-4" /> Update
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setOpen(true)}>
            <Trash className="mr-2 h-4 w-4" /> Delete
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => onOpen("sendMessage",{recipent: data})}>
            <MessageSquareIcon className="mr-2 h-4 w-4" /> Whatsapp
          </DropdownMenuItem>
          <DropdownMenuItem onClick={printReceipt}>
            <Printer className="mr-2 h-4 w-4" /> Print Receipt
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
};
