"use client";
import React, { useState } from "react";
import axios from "axios";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { toast } from "react-hot-toast";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { FileUpload } from "@/components/ui/image-upload";
import { Textarea } from "@/components/ui/textarea";

type Props = {};

interface ServiceProps{ 
    initialData: any
}

const formSchema = z.object({
  title  :z.string().min(1, {
    message: "Title is required"
  }),
  subtitle  :z.string().min(1, {
    message: "subtitle is required"
  }),
  blog  :z.string().min(1, {
    message: "blog is required"
  }),
  image  :z.string().min(1, {
    message: "Image is required"
  }),
  slug: z.string().min(1, {
    message: "Slug is required"
  }),
  metaTitle :  z.string().min(1, {
    message: "metaTitle is required"
  }),
  metaDescription :  z.string().min(1, {
    message: "metaDescription is required"
  }),
  metaKeywords :  z.string().min(1, {
    message: "metaKeywords is required"
  }),
});

type AddYouTubeFormValues = z.infer<typeof formSchema>;

const Services: React.FC<ServiceProps> = ({initialData}) => {
  const [isLoading, setLoading] = useState(false);

  const router = useRouter();

  const form = useForm<AddYouTubeFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData || {
        title: "",
        subtitle: "",
        blog: "",
        image: "",
        slug: "",
        metaTitle: "",
        metaDescription: "",
        metaKeywords: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
        setLoading(true);
        if(initialData){
            const res = await axios.put(`/api/services/${initialData.id}`, values);
            console.log("res", res.data)
            toast.success("Service updated successfully!");
            router.push("/admin/services/manage");
            return;
        
        }
        else{
            await axios.post("/api/services", values);
            form.reset();
            toast.success("Service added successfully!");

        }
      
     
      // Redirect or perform any other action after successful submission
    } catch (error) {
      console.error("Error adding services:", error);
      toast.error("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-5xl mx-auto">
        {/* Header Section */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold text-gray-900">
              {initialData ? "Edit Service" : "Add Service"}
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              {initialData ? "Update your service information" : "Add a new service to your website"}
            </p>
          </div>
          <Button
            variant="default"
            onClick={() => router.push("/admin/services/manage")}
            className="h-10"
          >
            Manage Services
          </Button>
        </div>

        {/* Main Form Section */}
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              {/* Image Upload Section */}
              <div className="space-y-6">
                <div className="text-lg font-semibold text-primary border-b pb-2">
                  Service Image
                </div>
                <FormField
                  control={form.control}
                  name="image"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <FileUpload
                          endpoint="galleryImage"
                          value={field.value}
                          onChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>

              {/* Basic Information */}
              <div className="space-y-6">
                <div className="text-lg font-semibold text-primary border-b pb-2">
                  Basic Information
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium">
                          Title
                        </FormLabel>
                        <FormControl>
                          <Input
                            disabled={isLoading}
                            className="h-11"
                            placeholder="Enter title"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="slug"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium">
                          Slug
                        </FormLabel>
                        <FormControl>
                          <Input
                            disabled={isLoading}
                            className="h-11"
                            placeholder="Enter slug"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="subtitle"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium">
                        Subtitle
                      </FormLabel>
                      <FormControl>
                        <Textarea
                          disabled={isLoading}
                          className="resize-none"
                          placeholder="Enter subtitle"
                          {...field}
                          rows={3}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="blog"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium">
                        Blog Content
                      </FormLabel>
                      <FormControl>
                        <Textarea
                          disabled={isLoading}
                          className="resize-none min-h-[200px]"
                          placeholder="Enter blog content"
                          {...field}
                          rows={8}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* SEO Information */}
              <div className="space-y-6">
                <div className="text-lg font-semibold text-primary border-b pb-2">
                  SEO Information
                </div>
                <div className="grid grid-cols-1 gap-6">
                  <FormField
                    control={form.control}
                    name="metaTitle"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium">
                          Meta Title
                        </FormLabel>
                        <FormControl>
                          <Input
                            disabled={isLoading}
                            className="h-11"
                            placeholder="Enter meta title"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="metaDescription"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium">
                          Meta Description
                        </FormLabel>
                        <FormControl>
                          <Textarea
                            disabled={isLoading}
                            className="resize-none"
                            placeholder="Enter meta description"
                            {...field}
                            rows={3}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="metaKeywords"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium">
                          Meta Keywords
                        </FormLabel>
                        <FormControl>
                          <Input
                            disabled={isLoading}
                            className="h-11"
                            placeholder="Enter meta keywords (comma-separated)"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* Submit Button */}
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
                  {initialData ? "Update Service" : "Add Service"}
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </div>
    </div>
  );
};

export default Services;