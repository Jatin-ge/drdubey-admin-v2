// @ts-nocheck

"use client";

import axios from "axios";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { GenderType } from "@prisma/client";
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
import {
  redirect,
  useParams,
  useRouter,
  useSearchParams,
} from "next/navigation";
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

interface AddpatientProps {
  name: string;
  email: string;
  userId: string;
}

const formSchema = z.object({
  name: z.string().min(1, {
    message: "Patient name is required.",
  }),
  email: z.string(),
  phone:
    z.string().min(1, {
      message: "phone is required",
    }) || null,
  age: z.number().lte(150).positive(),
  gender: z.nativeEnum(GenderType),
  address: z.string().min(1, {
    message: "address is required.",
  }),
});

type AddpatientFormValues = z.infer<typeof formSchema>;

const Appointment = ({ name, email, userId }: AddpatientProps) => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const urlParams = new URLSearchParams(window.location.search);

  // Retrieve the 'date' and 'time' parameters
  const date = urlParams.get("date");
  const time = urlParams.get("time");
  const city = urlParams.get("city");

  const header = {
    headers: {
      Authorization: process.env.NEXT_PUBLIC_WHATSAPP_TOKEN,
      Accept: "application/json",
    },
  };

  console.log(time);

  const form = useForm<AddpatientFormValues>({
    resolver: zodResolver(formSchema),
    // @ts-ignore
    defaultValues: {
      name,
      email,
      phone: "",
      age: 0,
      gender: GenderType.M,
      address: "",
      remark: "",
      bokingDate: date,
      bookingTime: "",
    },
  });

  useEffect(() => {
    if (time) {
      form.setValue("age", null);
      form.setValue("time", time);
    }
  }, [form, time]);

  const isLoading = form.formState.isSubmitting;

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      setLoading(true);
      const body = {
        messaging_product: "whatsapp",
        recipient_type: "individual",
        to: values.phone,
        type: "template",
        template: {
          name: "booking_confirmation",
          language: {
            code: "en_US",
          },
          components: [
            {
              type: "body",
              parameters: [
                {
                  type: "text",
                  text: values.name,
                },
                {
                  type: "text",
                  text: date,
                },
                {
                  type: "text",
                  text: time,
                },
              ],
            },
          ],
        },
      };
      await axios.post(`/api/booking`, { values, date, time, userId, city });
      await axios.post(
        `https://graph.facebook.com/${WHATSAPP_API_VERSION}/${WHATSAPP_PHONE_NUMBER_ID}/messages`,
        body,
        header
      );

      router.push("/booking/success");
    } catch (error: any) {
      toast.error("Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    form.reset();
  };

  return (
    <ScrollArea className="container mx-auto">
      <h1 className="text-2xl text-center font-bold py-8 px-6 bg-white text-black p-0 overflow-hidden">
        Appointment Form
      </h1>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <div className="space-y-8 px-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="uppercase text-sm font-bold text-black dark:text-white">
                    Patient name
                  </FormLabel>
                  <FormControl>
                    <Input
                      disabled={isLoading}
                      className="bg-transparent border border-primary  focus-visible:ring-0 text-black dark:text-white focus-visible:ring-offset-0"
                      placeholder="Enter Patient name"
                      {...field}
                      type="text"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="uppercase text-sm font-bold text-black dark:text-white">
                    Enter email
                  </FormLabel>
                  <FormControl>
                    <Input
                      disabled={isLoading}
                      className="bg-transparent border border-primary  focus-visible:ring-0 text-black dark:text-white focus-visible:ring-offset-0"
                      placeholder="Enter email"
                      {...field}
                      type="email"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="uppercase text-sm font-bold text-black dark:text-white">
                    Phone number
                  </FormLabel>
                  <FormControl>
                    <Input
                      disabled={isLoading}
                      className="bg-transparent border border-primary  text-black dark:text-white focus-visible:ring-0focus-visible:ring-offset-0"
                      placeholder="Enter Phone number"
                      {...field}
                      type="phone"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="age"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="uppercase text-sm font-bold text-black dark:text-white">
                    Age
                  </FormLabel>
                  <FormControl>
                    <Input
                      disabled={isLoading}
                      className="bg-transparent border border-primary  focus-visible:ring-0 text-black dark:text-white focus-visible:ring-offset-0"
                      placeholder="Enter Patient's age"
                      {...field}
                      {...form.register("age", { valueAsNumber: true })}
                      type="number"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="gender"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="uppercase text-sm font-bold text-black dark:text-white">
                    Gender
                  </FormLabel>
                  <Select
                    disabled={isLoading}
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger className="bg-transparent border border-primary  focus:ring-0 dark:text-white ring-offset-0 focus:ring-offset-0 capitalize outline-none">
                        <SelectValue placeholder="Select Gender" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {Object.values(GenderType).map((type) => (
                        <SelectItem
                          key={type}
                          value={type}
                          className="capitalize"
                        >
                          {type.toLowerCase()}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="uppercase text-sm font-bold text-black dark:text-white">
                    Address
                  </FormLabel>
                  <FormControl>
                    <Input
                      disabled={isLoading}
                      className="bg-transparent border border-primary  focus-visible:ring-0 text-black focus-visible:ring-offset-0"
                      placeholder="Enter Address"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <DialogFooter className=" px-6 py-4">
            <Button variant="primary" disabled={isLoading}>
              Create
            </Button>
          </DialogFooter>
        </form>
      </Form>
    </ScrollArea>
  );
};

export default Appointment;
