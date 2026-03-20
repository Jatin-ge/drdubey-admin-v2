// @ts-nocheck

"use client";

import axios from "axios";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Appointment, GenderType } from "@prisma/client";
import { format } from "date-fns";
import { toast } from "react-hot-toast";
import { useEffect, useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";

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
import { redirect, useParams, useRouter } from "next/navigation";
import { useModal } from "@/hooks/use-modal-store";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ScrollArea } from "@/components//ui/scroll-area";
import { Lead } from "@prisma/client";
import { type } from "os";
import React from "react";

interface AddpatientProps {
  initialData: Lead | Appointment | null;
  type: "lead" | "appointment";
}

const formSchema = z.object({
  name: z.string().min(1, {
    message: "Patient name is required.",
  }),
  email: z.string().optional(),
  phone: z
    .string()
    .min(1, { message: "Phone is required" })
    .regex(/^\d{10}$/, { message: "Enter a valid 10-digit phone number" }),
  age: z
    .union([z.number().int().positive().min(1), z.nan()])
    .refine((val) => val && !isNaN(val), {
      message: "Age is required",
    }),
  gender: z.nativeEnum(GenderType),
  address: z.string().optional(),
  remark: z.string().optional(),
  doad: z
    .string()
    .transform((str) => new Date(str))
    .optional()
    .or(z.literal("")),
  dood: z
    .string()
    .transform((str) => new Date(str))
    .optional()
    .or(z.literal("")),
  patientStatus: z.string().min(1, { message: "Patient status is required" }),
  side: z.string().optional(),
  implant: z.string().optional(),
  ipdReg: z.union([z.number().int().positive().min(1), z.nan()]).optional(),
  bill: z.union([z.number().int().positive().min(1), z.nan()]).optional(),
  surgery: z.string().min(1, { message: "Surgery type is required" }),
  tpa: z.string().optional(),
  dx: z.string().optional(),
  cities: z.string().min(1, { message: "City is required" }),
  hospital: z.string().optional(),
  otherHospital: z.string().optional(),
});

type AddpatientFormValues = z.infer<typeof formSchema>;

const Addpatient: React.FC<AddpatientProps> = ({ initialData, type }) => {
  const implants = ["J&J", "Maxx", "Zimmer", "Stryker", "S&N"];

  // Surgery types will be fetched from database
  const [availableSurgeryTypes, setAvailableSurgeryTypes] = useState<string[]>(
    []
  );

  const PatientStatus = ["OPD", "IPD", "Conservative"];
  const router = useRouter();

  const [isloading, setLoading] = useState(false);
  const [showAdditional, setShowAdditional] = useState(false);

  const toastMessage = initialData ? "Patient updated." : "Patient created.";

  const [availableCities, setAvailableCities] = useState<string[]>([]);

  const TPA = ["Private", "Cash", "Schemes"];

  const Side = ["LEFT", "RIGHT", "BOTH"];

  const form = useForm<AddpatientFormValues>({
    resolver: zodResolver(formSchema),
    // @ts-ignore
    defaultValues: initialData || {
      name: "",
      email: "",
      phone: "",
      age: "",
      gender: GenderType.M,
      address: "",
      remark: "",
      doad: "",
      dood: "",
      patientStatus: "",
      side: "",
      implant: "",
      ipdReg: "",
      bill: "",
      dx: "",
      surgery: "",
      tpa: "",
      cities: "",
      hospital: "",
      otherHospital: "",
    },
  });

  const isLoading = form.formState.isSubmitting;

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      setLoading(true);

      // Handle hospital value
      const hospitalValue =
        values.hospital === "Other" ? values.otherHospital : values.hospital;

      // Update the values with formatted city name and hospital
      // Filter out empty strings for optional fields
      const updatedValues = {
        ...values,
        cities: values.cities,
        hospital: hospitalValue,
        otherHospital: undefined, // Remove otherHospital from the payload
        email: values.email || undefined,
        address: values.address || undefined,
        remark: values.remark || undefined,
        doad: values.doad || undefined,
        dood: values.dood || undefined,
        patientStatus: values.patientStatus || undefined,
        side: values.side || undefined,
        implant: values.implant || undefined,
        surgery: values.surgery || undefined,
        tpa: values.tpa || undefined,
        dx: values.dx || undefined,
        ipdReg: values.ipdReg || undefined,
        bill: values.bill || undefined,
      };

      if (type === "lead") {
        await axios.patch(`/api/patients/${initialData.id}`, updatedValues);
        toast.success("Patient Updated Successfully");
      } else {
        await axios.post(`/api/patients`, updatedValues);
        toast.success("Patient Added Successfully");
      }
      form.reset({
        name: "",
        email: "",
        phone: "",
        age: "",
        gender: GenderType.M,
        address: "",
        remark: "",
        doad: "",
        dood: "",
        patientStatus: "",
        side: "",
        implant: "",
        ipdReg: "",
        bill: "",
        dx: "",
        surgery: "",
        tpa: "",
        cities: "",
        hospital: "",
        otherHospital: "",
      });
      router.push(`/admin/patients`);
    } catch (error) {
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (initialData?.doad) {
      form.setValue("doad", format(new Date(initialData.doad), "yyyy-MM-dd"));
    }
  }, [form, initialData?.doad]);

  useEffect(() => {
    if (initialData?.dood) {
      form.setValue("dood", format(new Date(initialData.dood), "yyyy-MM-dd"));
    }
  }, [form, initialData?.dood]);

  useEffect(() => {
    const fetchCities = async () => {
      try {
        const response = await axios.get("/api/cities");
        setAvailableCities(response.data);
      } catch (error) {
        console.error("Failed to fetch cities:", error);
      }
    };

    fetchCities();
  }, []);

  useEffect(() => {
    const fetchSurgeryTypes = async () => {
      try {
        const response = await axios.get("/api/surgery-types");
        setAvailableSurgeryTypes(response.data);
      } catch (error) {
        console.error("Failed to fetch surgery types:", error);
      }
    };

    fetchSurgeryTypes();
  }, []);

  return (
    <div className="min-h-full p-6 bg-gray-50">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold text-gray-900">
              {type === "lead" ? "Update Patient" : "Add New Patient"}
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              Fill in the form below to {type === "lead" ? "update" : "add"}{" "}
              patient information
            </p>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border p-6">
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800">
              <span className="text-red-500 font-semibold">*</span> Required
              fields: Name, Age, Gender, Phone Number, City, Patient Status, and
              Surgery Type
            </p>
            <p className="text-sm text-blue-700 mt-1">
              All other fields are optional and can be filled in later
            </p>
          </div>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              {/* Personal Information */}
              <div className="space-y-6">
                <div className="text-lg font-semibold text-primary border-b pb-2">
                  Personal Information
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Name Field */}
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium">
                          Patient Name <span className="text-red-500">*</span>
                        </FormLabel>
                        <FormControl>
                          <Input
                            disabled={isLoading}
                            className="h-11"
                            placeholder="Enter patient name"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Age and Gender in a row */}
                  <div className="grid grid-cols-2 gap-4">
                    {/* Age Field */}
                    <FormField
                      control={form.control}
                      name="age"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-medium">
                            Age <span className="text-red-500">*</span>
                          </FormLabel>
                          <FormControl>
                            <Input
                              disabled={isLoading}
                              className="h-11 bg-white border-gray-200 focus-visible:ring-1 focus-visible:ring-primary"
                              placeholder="Age"
                              {...field}
                              {...form.register("age", { valueAsNumber: true })}
                              type="number"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Gender Field */}
                    <FormField
                      control={form.control}
                      name="gender"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-medium">
                            Gender <span className="text-red-500">*</span>
                          </FormLabel>
                          <Select
                            disabled={isLoading}
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger className="h-11 bg-white border-gray-200 focus:ring-1 focus:ring-primary">
                                <SelectValue placeholder="Select gender" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {Object.values(GenderType).map((type) => (
                                <SelectItem key={type} value={type}>
                                  {type.charAt(0) + type.slice(1).toLowerCase()}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Phone Field */}
                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium">
                          Phone Number <span className="text-red-500">*</span>
                        </FormLabel>
                        <FormControl>
                          <Input
                            disabled={isLoading}
                            className="h-11 bg-white border-gray-200 focus-visible:ring-1 focus-visible:ring-primary"
                            placeholder="Enter phone number"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Email Field */}
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium text-gray-600">
                          Email Address{" "}
                          <span className="text-xs text-gray-400">
                            (Optional)
                          </span>
                        </FormLabel>
                        <FormControl>
                          <Input
                            disabled={isLoading}
                            className="h-11 bg-white border-gray-200 focus-visible:ring-1 focus-visible:ring-primary"
                            placeholder="Enter email address"
                            {...field}
                            type="email"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Address Field */}
                  <FormField
                    control={form.control}
                    name="address"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium text-gray-600">
                          Address{" "}
                          <span className="text-xs text-gray-400">
                            (Optional)
                          </span>
                        </FormLabel>
                        <FormControl>
                          <Input
                            disabled={isLoading}
                            className="h-11 bg-white border-gray-200 focus-visible:ring-1 focus-visible:ring-primary"
                            placeholder="Enter address"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* City Field */}
                  <FormField
                    control={form.control}
                    name="cities"
                    render={({ field }) => {
                      const [inputValue, setInputValue] = React.useState("");

                      return (
                        <FormItem className="flex flex-col">
                          <FormLabel className="text-sm font-medium">
                            City <span className="text-red-500">*</span>
                          </FormLabel>
                          <Popover>
                            <PopoverTrigger asChild>
                              <FormControl>
                                <Button
                                  variant="outline"
                                  role="combobox"
                                  className={cn(
                                    "h-11 w-full justify-between bg-white border-gray-200 font-normal",
                                    !field.value && "text-muted-foreground"
                                  )}
                                >
                                  {field.value || "Select city"}
                                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                </Button>
                              </FormControl>
                            </PopoverTrigger>
                            <PopoverContent
                              className="w-[200px] p-0"
                              align="start"
                              sideOffset={5}
                            >
                              <Command className="w-full">
                                <CommandInput
                                  placeholder="Search city..."
                                  className="h-9 text-sm"
                                  value={inputValue}
                                  onValueChange={setInputValue}
                                />
                                <CommandEmpty className="py-2 px-2 text-xs text-muted-foreground">
                                  No results found
                                </CommandEmpty>
                                <CommandGroup className="max-h-[200px] overflow-auto">
                                  {availableCities
                                    .filter((city) =>
                                      city
                                        .toLowerCase()
                                        .includes(inputValue.toLowerCase())
                                    )
                                    .map((city) => (
                                      <CommandItem
                                        value={city}
                                        key={city}
                                        onSelect={() => {
                                          field.onChange(city);
                                          setInputValue("");
                                        }}
                                        className="text-sm py-2 px-2"
                                      >
                                        <Check
                                          className={cn(
                                            "mr-2 h-3 w-3",
                                            field.value === city
                                              ? "opacity-100"
                                              : "opacity-0"
                                          )}
                                        />
                                        {city}
                                      </CommandItem>
                                    ))}
                                </CommandGroup>
                              </Command>
                            </PopoverContent>
                          </Popover>
                          <FormMessage />
                        </FormItem>
                      );
                    }}
                  />
                </div>
              </div>

              {/* Medical Information */}
              <div className="space-y-6">
                <div className="text-lg font-semibold text-primary border-b pb-2">
                  Medical Information
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Dates in a row */}
                  <div className="grid grid-cols-2 gap-4">
                    {/* Date of Admission */}
                    <FormField
                      control={form.control}
                      name="doad"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-medium">
                            Admission Date
                          </FormLabel>
                          <FormControl>
                            <Input
                              disabled={isLoading}
                              className="h-11 bg-white border-gray-200 focus-visible:ring-1 focus-visible:ring-primary"
                              {...field}
                              type="date"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Date of Operation */}
                    <FormField
                      control={form.control}
                      name="dood"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-medium">
                            Operation Date
                          </FormLabel>
                          <FormControl>
                            <Input
                              disabled={isLoading}
                              className="h-11 bg-white border-gray-200 focus-visible:ring-1 focus-visible:ring-primary"
                              {...field}
                              type="date"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Patient Status */}
                  <FormField
                    control={form.control}
                    name="patientStatus"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium">
                          Patient Status <span className="text-red-500">*</span>
                        </FormLabel>
                        <Select
                          disabled={isLoading}
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger className="h-11 bg-white border-gray-200 focus:ring-1 focus:ring-primary">
                              <SelectValue placeholder="Select patient status" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="IPD">IPD</SelectItem>
                            <SelectItem value="OPD">OPD</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Surgery Type */}
                  <FormField
                    control={form.control}
                    name="surgery"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium">
                          Surgery Type <span className="text-red-500">*</span>
                        </FormLabel>
                        <Select
                          disabled={isLoading}
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger className="h-11 bg-white border-gray-200 focus:ring-1 focus:ring-primary">
                              <SelectValue placeholder="Select surgery type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {availableSurgeryTypes.map((type) => (
                              <SelectItem key={type} value={type}>
                                {type}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Side */}
                  <FormField
                    control={form.control}
                    name="side"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium">
                          Side
                        </FormLabel>
                        <Select
                          disabled={isLoading}
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger className="h-11">
                              <SelectValue placeholder="Select side" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {Side.map((type) => (
                              <SelectItem key={type} value={type}>
                                {type}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Implant */}
                  <FormField
                    control={form.control}
                    name="implant"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium">
                          Implant
                        </FormLabel>
                        <Select
                          disabled={isLoading}
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger className="h-11">
                              <SelectValue placeholder="Select implant" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {implants.map((type) => (
                              <SelectItem key={type} value={type}>
                                {type}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Description */}
                  <FormField
                    control={form.control}
                    name="remark"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium">
                          Description
                        </FormLabel>
                        <FormControl>
                          <Input
                            disabled={isLoading}
                            className="h-11 bg-white border-gray-200 focus-visible:ring-1 focus-visible:ring-primary"
                            placeholder="Enter description"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* Billing Information */}
              <div className="space-y-6">
                <div className="text-lg font-semibold text-primary border-b pb-2">
                  Billing Information
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* TPA */}
                  <FormField
                    control={form.control}
                    name="tpa"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium">
                          TPA
                        </FormLabel>
                        <Select
                          disabled={isLoading}
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger className="h-11">
                              <SelectValue placeholder="Select TPA" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {TPA.map((type) => (
                              <SelectItem key={type} value={type}>
                                {type}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* IPD Registration */}
                  <FormField
                    control={form.control}
                    name="ipdReg"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium">
                          IPD Registration
                        </FormLabel>
                        <FormControl>
                          <Input
                            disabled={isLoading}
                            className="h-11"
                            placeholder="Enter IPD registration number"
                            {...field}
                            {...form.register("ipdReg", {
                              valueAsNumber: true,
                            })}
                            type="number"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Bill Amount */}
                  <FormField
                    control={form.control}
                    name="bill"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium">
                          Bill Amount
                        </FormLabel>
                        <FormControl>
                          <Input
                            disabled={isLoading}
                            className="h-11"
                            placeholder="Enter bill amount"
                            {...field}
                            {...form.register("bill", { valueAsNumber: true })}
                            type="number"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* Hospital Field */}
              <div className="space-y-6">
                <FormField
                  control={form.control}
                  name="hospital"
                  render={({ field }) => {
                    const [showOtherHospital, setShowOtherHospital] = useState(
                      field.value === "Other"
                    );

                    return (
                      <FormItem>
                        <FormLabel>Hospital</FormLabel>
                        <Select
                          disabled={isLoading}
                          onValueChange={(value) => {
                            field.onChange(value);
                            setShowOtherHospital(value === "Other");
                            if (value !== "Other") {
                              form.setValue("otherHospital", "");
                            }
                          }}
                          value={field.value || ""}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select Hospital" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="Shalby">Shalby</SelectItem>
                            <SelectItem value="Tagore">Tagore</SelectItem>
                            <SelectItem value="Other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    );
                  }}
                />

                {/* Other Hospital Input */}
                <FormField
                  control={form.control}
                  name="otherHospital"
                  render={({ field }) => (
                    <FormItem
                      className={cn(
                        !form.watch("hospital") ||
                          (form.watch("hospital") !== "Other" && "hidden")
                      )}
                    >
                      <FormLabel>Other Hospital Name</FormLabel>
                      <FormControl>
                        <Input
                          disabled={isLoading}
                          className="h-11"
                          placeholder="Enter hospital name"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-4 pt-6 border-t">
                <Button
                  type="button"
                  variant="outline"
                  disabled={isLoading}
                  onClick={() => router.back()}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="bg-primary hover:bg-primary/90"
                >
                  {type === "lead" ? "Update Patient" : "Add Patient"}
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </div>
    </div>
  );
};

export default Addpatient;
