

// @ts-nocheck

"use client";

import axios from "axios";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { format } from "date-fns";
import { toast } from "react-hot-toast";

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
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { redirect, useParams, useRouter, useSearchParams } from "next/navigation";
import { useModal } from "@/hooks/use-modal-store";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState } from "react";
import { ScrollArea } from "@/components//ui/scroll-area";
import { Lead } from "@prisma/client";
import { useEffect } from "react";


interface PreviousAppointmentProps {
    appointments: any
}

const formSchema = z.object({
    description: z.string()
});

type AddpatientFormValues = z.infer<typeof formSchema>;

const PreviousAppointment = ({appointments}: PreviousAppointmentProps) => {
  const router = useRouter();
  const [isloading, setLoading] = useState(false);
  const urlParams = new URLSearchParams(window.location.search);

  // Retrieve the 'date' and 'time' parameters
  const appointment = appointments[0]
  const date =  urlParams.get('date');
  const time =  urlParams.get('time');
  const city = urlParams.get('city');

  const header = {
   "headers":{
    Authorization: process.env.NEXT_PUBLIC_WHATSAPP_TOKEN,
    Accept: "application/json"
    
   } 
  }


  console.log(time)

  const form = useForm<AddpatientFormValues>({
    resolver: zodResolver(formSchema),
    // @ts-ignore
    defaultValues: {
      description: "",
      
    },
  });


  

  const isLoading = form.formState.isSubmitting;



  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    console.log("the values are ", values)
    try {
      setLoading(true);
      const body = {
        messaging_product: "whatsapp",
        recipient_type: "individual",
        to: appointment.phone,
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
                    text: date
                },
                {
                    type: "text",
                    text: time
                },
                ]
        
            }
    ]
    }}
      await axios.post(`/api/another-booking`, {values, date, time, appointment, city });
      console.log("done")
      await axios.post("https://graph.facebook.com/v18.0/197226183475191/messages", body, header);

      
      router.push("/booking/success");
      
    } catch (error: any) {
      toast.error("Something went wrong.");
    } finally {
      setLoading(false);
    }
  };


  return (
    <ScrollArea className="container mx-auto">
        <h1 className="text-3xl text-center font-bold py-8 px-6  text-black dark:text-white p-0 overflow-hidden">
            Appointment Form
        </h1>
      <Form {...form} >
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <div className="space-y-8 px-6">
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="uppercase text-sm font-bold text-black dark:text-white">
                    Add a Description
                  </FormLabel>
                  <FormControl>
                    <Input
                      disabled={isLoading}
                      className="bg-transparent border border-primary  focus-visible:ring-0 text-black dark:text-white focus-visible:ring-offset-0 h-20"
                      placeholder="Enter a description"
                      {...field}
                      type="text"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            /> 
           
          </div>

          <DialogFooter className="px-6 py-4">
            <Button variant="primary" disabled={isLoading}>
              Create
            </Button>
          </DialogFooter>
        </form>
      </Form>
    </ScrollArea>
  );
};

export default PreviousAppointment;