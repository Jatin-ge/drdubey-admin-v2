"use client";

import React, { useState, useEffect } from "react";
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

interface Achievement {
  id: string;
  title: string;
  slug: string;
  category: string;
  date: string;
  description: string;
  imageUrl: string;
  isFeatured: boolean;
  featuredOrder?: number | null;
  metaTitle?: string | null;
  metaDescription?: string | null;
  createdAt: string;
}

const CATEGORIES = ["Award", "Conference", "Record", "Media"];

const formSchema = z.object({
  title: z.string().min(1, { message: "Title is required" }),
  category: z.string().min(1, { message: "Category is required" }),
  date: z.string().min(1, { message: "Date is required" }),
  description: z.string().min(1, { message: "Description is required" }),
  imageUrl: z.string().min(1, { message: "Image URL is required" }),
  isFeatured: z.boolean().default(false),
  featuredOrder: z.number().nullable().optional(),
  metaTitle: z.string().optional(),
  metaDescription: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

const AchievementsAdminPage = () => {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      category: "Award",
      date: "",
      description: "",
      imageUrl: "",
      isFeatured: false,
      featuredOrder: null,
      metaTitle: "",
      metaDescription: "",
    },
  });

  const isFeatured = form.watch("isFeatured");

  const fetchAchievements = async () => {
    try {
      const res = await axios.get("/api/achievements");
      setAchievements(res.data);
    } catch {
      toast.error("Failed to load achievements");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAchievements();
  }, []);

  const openAddForm = () => {
    form.reset({
      title: "",
      category: "Award",
      date: "",
      description: "",
      imageUrl: "",
      isFeatured: false,
      featuredOrder: null,
      metaTitle: "",
      metaDescription: "",
    });
    setEditingId(null);
    setShowForm(true);
  };

  const openEditForm = (achievement: Achievement) => {
    form.reset({
      title: achievement.title,
      category: achievement.category,
      date: achievement.date.split("T")[0],
      description: achievement.description,
      imageUrl: achievement.imageUrl,
      isFeatured: achievement.isFeatured,
      featuredOrder: achievement.featuredOrder ?? null,
      metaTitle: achievement.metaTitle ?? "",
      metaDescription: achievement.metaDescription ?? "",
    });
    setEditingId(achievement.id);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this achievement?")) return;
    try {
      await axios.delete(`/api/achievements/${id}`);
      toast.success("Achievement deleted");
      fetchAchievements();
    } catch {
      toast.error("Failed to delete achievement");
    }
  };

  const onSubmit = async (values: FormValues) => {
    try {
      setSubmitting(true);
      const payload = {
        ...values,
        date: new Date(values.date).toISOString(),
        featuredOrder: values.isFeatured ? values.featuredOrder : null,
      };

      if (editingId) {
        await axios.put(`/api/achievements/${editingId}`, payload);
        toast.success("Achievement updated!");
      } else {
        await axios.post("/api/achievements", payload);
        toast.success("Achievement created!");
      }

      setShowForm(false);
      setEditingId(null);
      fetchAchievements();
    } catch (error) {
      toast.error("An error occurred. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">Achievements</h1>
        <Button variant="primary" onClick={openAddForm}>
          + Add Achievement
        </Button>
      </div>

      {showForm && (
        <div className="mb-10 p-6 border rounded-lg bg-white shadow">
          <h2 className="text-xl font-semibold mb-4">
            {editingId ? "Edit Achievement" : "New Achievement"}
          </h2>
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
                        <Input placeholder="Achievement title" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category</FormLabel>
                      <FormControl>
                        <select
                          {...field}
                          className="w-full mt-1 p-2 border border-gray-300 rounded-md focus:outline-none focus:border-primary"
                        >
                          {CATEGORIES.map((cat) => (
                            <option key={cat} value={cat}>
                              {cat}
                            </option>
                          ))}
                        </select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="date"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Date</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="imageUrl"
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
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Describe the achievement..."
                        rows={4}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="isFeatured"
                  render={({ field }) => (
                    <FormItem className="flex items-center gap-3 pt-6">
                      <FormControl>
                        <input
                          type="checkbox"
                          checked={field.value}
                          onChange={field.onChange}
                          className="h-4 w-4 accent-primary"
                        />
                      </FormControl>
                      <FormLabel className="!mt-0">Featured</FormLabel>
                    </FormItem>
                  )}
                />

                {isFeatured && (
                  <FormField
                    control={form.control}
                    name="featuredOrder"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Featured Order (1–5)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min={1}
                            max={5}
                            placeholder="1"
                            {...field}
                            value={field.value ?? ""}
                            onChange={(e) =>
                              field.onChange(
                                e.target.value ? Number(e.target.value) : null
                              )
                            }
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
              </div>

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
                name="metaDescription"
                render={({ field }) => (
                  <FormItem>
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

              <div className="flex gap-3">
                <Button type="submit" variant="primary" disabled={submitting}>
                  {submitting
                    ? "Saving..."
                    : editingId
                    ? "Update Achievement"
                    : "Create Achievement"}
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
      ) : achievements.length === 0 ? (
        <p className="text-center text-gray-500 py-20">
          No achievements yet. Click &quot;Add Achievement&quot; to get started.
        </p>
      ) : (
        <div className="overflow-x-auto rounded-lg border">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-700 uppercase text-xs">
              <tr>
                <th className="px-4 py-3 text-left">Title</th>
                <th className="px-4 py-3 text-left">Category</th>
                <th className="px-4 py-3 text-left">Date</th>
                <th className="px-4 py-3 text-center">Featured</th>
                <th className="px-4 py-3 text-center">Order</th>
                <th className="px-4 py-3 text-left">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {achievements.map((a) => (
                <tr key={a.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium max-w-xs truncate">
                    {a.title}
                  </td>
                  <td className="px-4 py-3">
                    <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                      {a.category}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {new Date(a.date).toLocaleDateString("en-IN")}
                  </td>
                  <td className="px-4 py-3 text-center">
                    {a.isFeatured ? (
                      <span className="text-green-600 font-semibold">Yes</span>
                    ) : (
                      <span className="text-gray-400">No</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-center text-gray-600">
                    {a.featuredOrder ?? "—"}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        className="text-xs px-3 py-1"
                        onClick={() => openEditForm(a)}
                      >
                        Edit
                      </Button>
                      <Button
                        variant="destructive"
                        className="text-xs px-3 py-1"
                        onClick={() => handleDelete(a.id)}
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

export default AchievementsAdminPage;
