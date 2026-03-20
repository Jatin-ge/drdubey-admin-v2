"use client";

import "react-quill/dist/quill.snow.css";
import React, { useState, useEffect, useCallback } from "react";
import dynamic from "next/dynamic";
import axios from "axios";
import { toast } from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

const ReactQuill = dynamic(() => import("react-quill"), {
  ssr: false,
  loading: () => (
    <div className="h-40 border rounded-md bg-gray-50 flex items-center justify-center text-gray-400 text-sm">
      Loading editor...
    </div>
  ),
});

interface Service {
  id: string;
  title: string;
  subtitle: string;
  blog: string;
  image: string;
  slug?: string | null;
  metaTitle?: string | null;
  metaDescription?: string | null;
  metaKeywords?: string | null;
}

const formSchema = z.object({
  title: z.string().min(1, { message: "Title is required" }),
  slug: z.string().min(1, { message: "Slug is required" }),
  subtitle: z.string().min(1, { message: "Subtitle is required" }),
  blog: z.string().min(1, { message: "Content is required" }),
  image: z.string().min(1, { message: "Image URL is required" }),
  metaTitle: z.string().optional(),
  metaDescription: z.string().optional(),
  metaKeywords: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

const quillModules = {
  toolbar: [
    [{ header: [1, 2, 3, false] }],
    ["bold", "italic", "underline", "strike"],
    [{ list: "ordered" }, { list: "bullet" }],
    ["blockquote"],
    ["link"],
    ["clean"],
  ],
};

const ServicesAdminPage = () => {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      slug: "",
      subtitle: "",
      blog: "",
      image: "",
      metaTitle: "",
      metaDescription: "",
      metaKeywords: "",
    },
  });

  const watchedTitle = form.watch("title");

  useEffect(() => {
    if (!editingId && watchedTitle) {
      const slug = watchedTitle
        .toLowerCase()
        .replace(/\s+/g, "-")
        .replace(/[^a-z0-9-]/g, "");
      form.setValue("slug", slug, { shouldValidate: false });
    }
  }, [watchedTitle, editingId, form]);

  const fetchServices = useCallback(async () => {
    try {
      const res = await axios.get("/api/services");
      setServices(res.data);
    } catch {
      toast.error("Failed to load services");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchServices();
  }, [fetchServices]);

  const openAddForm = () => {
    form.reset({
      title: "",
      slug: "",
      subtitle: "",
      blog: "",
      image: "",
      metaTitle: "",
      metaDescription: "",
      metaKeywords: "",
    });
    setEditingId(null);
    setShowForm(true);
  };

  const openEditForm = (service: Service) => {
    form.reset({
      title: service.title,
      slug: service.slug ?? "",
      subtitle: service.subtitle,
      blog: service.blog,
      image: service.image,
      metaTitle: service.metaTitle ?? "",
      metaDescription: service.metaDescription ?? "",
      metaKeywords: service.metaKeywords ?? "",
    });
    setEditingId(service.id);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this service?")) return;
    try {
      await axios.delete(`/api/services/${id}`);
      toast.success("Service deleted");
      fetchServices();
    } catch {
      toast.error("Failed to delete service");
    }
  };

  const onSubmit = async (values: FormValues) => {
    try {
      setSubmitting(true);
      if (editingId) {
        await axios.put(`/api/services/${editingId}`, values);
        toast.success("Service updated!");
      } else {
        await axios.post("/api/services", values);
        toast.success("Service created!");
      }
      setShowForm(false);
      setEditingId(null);
      fetchServices();
    } catch {
      toast.error("An error occurred. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">Services</h1>
        <Button variant="primary" onClick={openAddForm}>
          + Add Service
        </Button>
      </div>

      {showForm && (
        <div className="mb-10 p-6 border rounded-lg bg-white shadow">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">
              {editingId ? "Edit Service" : "New Service"}
            </h2>
            <button
              onClick={() => setShowForm(false)}
              className="text-gray-400 hover:text-gray-600 text-2xl leading-none"
            >
              ×
            </button>
          </div>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Title</FormLabel>
                      <FormControl>
                        <Input placeholder="Service title" {...field} />
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
                      <FormLabel>Slug</FormLabel>
                      <FormControl>
                        <Input placeholder="auto-generated-slug" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="subtitle"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Subtitle</FormLabel>
                      <FormControl>
                        <Input placeholder="Short description" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="image"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Image URL</FormLabel>
                      <FormControl>
                        <Input placeholder="https://..." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="blog"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Content</FormLabel>
                    <FormControl>
                      <ReactQuill
                        theme="snow"
                        value={field.value}
                        onChange={field.onChange}
                        modules={quillModules}
                        className="bg-white"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="border-t pt-4">
                <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">
                  SEO
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="metaTitle"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Meta Title</FormLabel>
                        <FormControl>
                          <Input placeholder="SEO title" {...field} />
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
                        <FormLabel>Meta Keywords</FormLabel>
                        <FormControl>
                          <Input placeholder="keyword1, keyword2" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <FormField
                  control={form.control}
                  name="metaDescription"
                  render={({ field }) => (
                    <FormItem className="mt-4">
                      <FormLabel>Meta Description</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="SEO description"
                          rows={2}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="flex gap-3">
                <Button type="submit" variant="primary" disabled={submitting}>
                  {submitting
                    ? "Saving..."
                    : editingId
                    ? "Update Service"
                    : "Create Service"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowForm(false)}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </Form>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary" />
        </div>
      ) : services.length === 0 ? (
        <p className="text-center text-gray-500 py-20">
          No services yet. Click &quot;Add Service&quot; to get started.
        </p>
      ) : (
        <div className="overflow-x-auto rounded-lg border">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-700 uppercase text-xs">
              <tr>
                <th className="px-4 py-3 text-left">Title</th>
                <th className="px-4 py-3 text-left">Slug</th>
                <th className="px-4 py-3 text-left">Subtitle</th>
                <th className="px-4 py-3 text-left">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {services.map((service) => (
                <tr key={service.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium max-w-xs truncate">
                    {service.title}
                  </td>
                  <td className="px-4 py-3 text-gray-500 max-w-[180px] truncate">
                    {service.slug || "—"}
                  </td>
                  <td className="px-4 py-3 text-gray-600 max-w-xs truncate">
                    {service.subtitle}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        className="text-xs px-3 py-1"
                        onClick={() => openEditForm(service)}
                      >
                        Edit
                      </Button>
                      <Button
                        variant="destructive"
                        className="text-xs px-3 py-1"
                        onClick={() => handleDelete(service.id)}
                      >
                        Delete
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ServicesAdminPage;
