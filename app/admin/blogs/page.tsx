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

interface Blog {
  id: string;
  title: string;
  slug: string | null;
  subtitle1: string;
  content1: string;
  image1: string;
  subtitle2?: string | null;
  content2?: string | null;
  image2?: string | null;
  coverImage?: string | null;
  tags: string[];
  metaTitle?: string | null;
  metaDescription?: string | null;
  metaKeywords?: string | null;
  isPublished: boolean;
  publishedAt?: string | null;
}

const formSchema = z.object({
  title: z.string().min(1, { message: "Title is required" }),
  slug: z.string().min(1, { message: "Slug is required" }),
  subtitle1: z.string().min(1, { message: "Subtitle is required" }),
  content1: z.string().min(1, { message: "Content is required" }),
  image1: z.string().min(1, { message: "Image URL is required" }),
  subtitle2: z.string().optional(),
  content2: z.string().optional(),
  image2: z.string().optional(),
  coverImage: z.string().optional(),
  tags: z.string().optional(),
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
    ["blockquote", "code-block"],
    ["link"],
    ["clean"],
  ],
};

const BlogsAdminPage = () => {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [currentBlog, setCurrentBlog] = useState<Blog | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      slug: "",
      subtitle1: "",
      content1: "",
      image1: "",
      subtitle2: "",
      content2: "",
      image2: "",
      coverImage: "",
      tags: "",
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

  const fetchBlogs = useCallback(async () => {
    try {
      const res = await axios.get("/api/blogs");
      setBlogs(res.data);
    } catch {
      toast.error("Failed to load blogs");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBlogs();
  }, [fetchBlogs]);

  const openAddForm = () => {
    form.reset({
      title: "",
      slug: "",
      subtitle1: "",
      content1: "",
      image1: "",
      subtitle2: "",
      content2: "",
      image2: "",
      coverImage: "",
      tags: "",
      metaTitle: "",
      metaDescription: "",
      metaKeywords: "",
    });
    setEditingId(null);
    setCurrentBlog(null);
    setShowForm(true);
  };

  const openEditForm = (blog: Blog) => {
    form.reset({
      title: blog.title,
      slug: blog.slug ?? "",
      subtitle1: blog.subtitle1,
      content1: blog.content1,
      image1: blog.image1,
      subtitle2: blog.subtitle2 ?? "",
      content2: blog.content2 ?? "",
      image2: blog.image2 ?? "",
      coverImage: blog.coverImage ?? "",
      tags: blog.tags?.join(", ") ?? "",
      metaTitle: blog.metaTitle ?? "",
      metaDescription: blog.metaDescription ?? "",
      metaKeywords: blog.metaKeywords ?? "",
    });
    setEditingId(blog.id);
    setCurrentBlog(blog);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this blog post?")) return;
    try {
      await axios.delete(`/api/blogs/${id}`);
      toast.success("Blog deleted");
      fetchBlogs();
    } catch {
      toast.error("Failed to delete blog");
    }
  };

  const onSubmit = async (values: FormValues, isPublishing: boolean) => {
    try {
      setSubmitting(true);
      const tags = values.tags
        ? values.tags
            .split(",")
            .map((t) => t.trim())
            .filter(Boolean)
        : [];

      let publishedAt: string | null | undefined = undefined;
      if (isPublishing) {
        publishedAt = currentBlog?.publishedAt || new Date().toISOString();
      } else if (currentBlog?.publishedAt) {
        publishedAt = currentBlog.publishedAt;
      }

      const payload = {
        ...values,
        tags,
        isPublished: isPublishing,
        ...(publishedAt !== undefined && { publishedAt }),
      };

      if (editingId) {
        await axios.put(`/api/blogs/${editingId}`, payload);
        toast.success(isPublishing ? "Blog published!" : "Draft saved!");
      } else {
        await axios.post("/api/blogs", payload);
        toast.success(isPublishing ? "Blog published!" : "Draft saved!");
      }

      setShowForm(false);
      setEditingId(null);
      setCurrentBlog(null);
      fetchBlogs();
    } catch {
      toast.error("An error occurred. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleSaveDraft = form.handleSubmit((values) =>
    onSubmit(values, false)
  );
  const handlePublish = form.handleSubmit((values) => onSubmit(values, true));

  return (
    <div className="max-w-6xl mx-auto p-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">Blog Posts</h1>
        <Button variant="primary" onClick={openAddForm}>
          + New Blog Post
        </Button>
      </div>

      {showForm && (
        <div className="mb-10 p-6 border rounded-lg bg-white shadow">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">
              {editingId ? "Edit Blog Post" : "New Blog Post"}
            </h2>
            <button
              onClick={() => setShowForm(false)}
              className="text-gray-400 hover:text-gray-600 text-2xl leading-none"
            >
              ×
            </button>
          </div>
          <Form {...form}>
            <form className="space-y-6">
              {/* Title + Slug */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Title</FormLabel>
                      <FormControl>
                        <Input placeholder="Blog post title" {...field} />
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

              {/* Subtitle1 + Image1 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="subtitle1"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Subtitle</FormLabel>
                      <FormControl>
                        <Input placeholder="Article subtitle" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="image1"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Image 1 URL</FormLabel>
                      <FormControl>
                        <Input placeholder="https://..." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Content1 */}
              <FormField
                control={form.control}
                name="content1"
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

              {/* Subtitle2 + Image2 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="subtitle2"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Subtitle 2 (optional)</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Second section subtitle"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="image2"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Image 2 URL (optional)</FormLabel>
                      <FormControl>
                        <Input placeholder="https://..." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Content2 */}
              <FormField
                control={form.control}
                name="content2"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Content 2 (optional)</FormLabel>
                    <FormControl>
                      <ReactQuill
                        theme="snow"
                        value={field.value ?? ""}
                        onChange={field.onChange}
                        modules={quillModules}
                        className="bg-white"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Cover Image + Tags */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="coverImage"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Cover Image URL</FormLabel>
                      <FormControl>
                        <Input placeholder="https://..." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="tags"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tags (comma-separated)</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="knee replacement, surgery, recovery"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* SEO Fields */}
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
                          placeholder="SEO description (max 160 chars)"
                          rows={2}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  disabled={submitting}
                  onClick={handleSaveDraft}
                >
                  {submitting ? "Saving..." : "Save Draft"}
                </Button>
                <Button
                  type="button"
                  variant="primary"
                  disabled={submitting}
                  onClick={handlePublish}
                >
                  {submitting ? "Publishing..." : "Publish"}
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
      ) : blogs.length === 0 ? (
        <p className="text-center text-gray-500 py-20">
          No blog posts yet. Click &quot;New Blog Post&quot; to get started.
        </p>
      ) : (
        <div className="overflow-x-auto rounded-lg border">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-700 uppercase text-xs">
              <tr>
                <th className="px-4 py-3 text-left">Title</th>
                <th className="px-4 py-3 text-left">Slug</th>
                <th className="px-4 py-3 text-center">Status</th>
                <th className="px-4 py-3 text-left">Published</th>
                <th className="px-4 py-3 text-left">Tags</th>
                <th className="px-4 py-3 text-left">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {blogs.map((blog) => (
                <tr key={blog.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium max-w-xs truncate">
                    {blog.title}
                  </td>
                  <td className="px-4 py-3 text-gray-500 max-w-[180px] truncate">
                    {blog.slug}
                  </td>
                  <td className="px-4 py-3 text-center">
                    {blog.isPublished ? (
                      <span className="px-2 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700">
                        Published
                      </span>
                    ) : (
                      <span className="px-2 py-1 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-700">
                        Draft
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {blog.publishedAt
                      ? new Date(blog.publishedAt).toLocaleDateString("en-IN")
                      : "—"}
                  </td>
                  <td className="px-4 py-3 text-gray-500 max-w-[160px] truncate">
                    {blog.tags?.join(", ") || "—"}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        className="text-xs px-3 py-1"
                        onClick={() => openEditForm(blog)}
                      >
                        Edit
                      </Button>
                      <Button
                        variant="destructive"
                        className="text-xs px-3 py-1"
                        onClick={() => handleDelete(blog.id)}
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

export default BlogsAdminPage;
