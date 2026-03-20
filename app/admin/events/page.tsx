"use client";

import { EventImage } from "@/app/components/ui/event-image";
import { ImageModal } from "@/app/components/ui/modal-image";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";
import { Eye, Image as ImageIcon, Pencil, Plus, Trash2, Upload, X } from "lucide-react";
import React, { useCallback, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-hot-toast";
import { z } from "zod";

const formSchema = z.object({
  title: z.string().min(1, { message: "Title is required." }),
  mediaType: z.enum(['none', 'video', 'image']).default('none'),
  videoLink: z.string().url({ message: "Invalid URL" }).optional().nullable()
    .transform(val => (!val ? null : val)),
  imageUrl: z.string().optional().nullable()
    .transform(val => (!val ? null : val)),
  description: z.string().min(1, { message: "Description is required." }),
});

type Event = {
  id: string;
  title: string;
  videoLink?: string;
  imageUrl?: string;
  description: string;
  createdAt: string;
};

type FormValues = z.infer<typeof formSchema>;

const EventsPage: React.FC = () => {
  const [isLoading, setLoading] = useState(false);
  const [events, setEvents] = useState<Event[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [selectedImage, setSelectedImage] = useState<{ url: string; title: string } | null>(null);
  const [failedImages, setFailedImages] = useState<Set<string>>(new Set());

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      mediaType: "none",
      videoLink: null,
      imageUrl: null,
      description: "",
    },
    mode: "onChange"
  });

  useEffect(() => {
    const subscription = form.watch((value, { name, type }) => {
      console.log("Form changed:", { value, name, type });
      // You can also update some state here if needed
    });
  
    return () => subscription.unsubscribe();
  }, [form]);
  

  const fetchEvents = async () => {
    try {
      const response = await axios.get("/api/events");
      setEvents(response.data);
    } catch (error) {
      toast.error("Failed to fetch events");
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement> | DragEvent) => {
    let file: File | null = null;
    
    if (e instanceof DragEvent) {
      e.preventDefault();
      if (e.dataTransfer?.files) {
        file = e.dataTransfer.files[0];
      }
    } else if (e.target.files) {
      file = e.target.files[0];
    }

    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast.error("File size should be less than 5MB");
        return;
      }
      if (!file.type.startsWith('image/')) {
        toast.error("Please select an image file");
        return;
      }
      setSelectedFile(file);
    }
  }, []);

  useEffect(() => {
    const dropZone = document.querySelector('.border-dashed');
    if (!dropZone) return;

    const handleDragOver = (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
    };

    const handleDrop = (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      handleFileChange(e);
    };

    dropZone.addEventListener('dragover', handleDragOver as unknown as EventListener);
    dropZone.addEventListener('drop', handleDrop as unknown as EventListener);

    return () => {
      dropZone.removeEventListener('dragover', handleDragOver as unknown as EventListener);
      dropZone.removeEventListener('drop', handleDrop as unknown as EventListener);
    };
  }, [handleFileChange]);

  const onSubmit = async (values: FormValues) => {
    

    if (!values.title?.trim() || !values.description?.trim()) {
      toast.error("Please fill in all required fields");
      return;
    }

    if (values.mediaType === 'video' && !values.videoLink) {
      toast.error("Please provide a valid video URL");
      return;
    }

    try {
      setLoading(true);
      let imageUrl = values.imageUrl;

      if (values.mediaType === 'image' && selectedFile) {
        
        try {
          // Create FormData and append file
          const formData = new FormData();
          formData.append('file', selectedFile);

          // Upload file through API
          const uploadResponse = await axios.post('/api/upload', formData, {
            headers: {
              'Content-Type': 'multipart/form-data',
            },
            onUploadProgress: (progressEvent) => {
              const progress = progressEvent.total
                ? Math.round((progressEvent.loaded * 100) / progressEvent.total)
                : 0;
              setUploadProgress(progress);
            },
          });

          imageUrl = uploadResponse.data.imageUrl;
          
        } catch (error) {
          console.error("Image upload error:", error);
          toast.error("Failed to upload image. Please try again.");
          return;
        }
      }

      const dataToSubmit = {
        ...values,
        title: values.title.trim(),
        description: values.description.trim(),
        imageUrl: values.mediaType === 'image' ? imageUrl : null,
        videoLink: values.mediaType === 'video' ? values.videoLink : null,
      };

      
      
      if (editingEvent) {
        const response = await axios.patch(`/api/events`, { ...dataToSubmit, id: editingEvent.id });
        
        toast.success("Event updated successfully!");
      } else {
        const response = await axios.post("/api/events", dataToSubmit);
        
        toast.success("Event added successfully!");
      }
      
      setSelectedFile(null);
      setUploadProgress(0);
      form.reset();
      setShowForm(false);
      setEditingEvent(null);
      fetchEvents();
    } catch (error: any) {
      console.error("Submission error:", error);
      toast.error(error.response?.data?.error || "An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (event: Event) => {
    setEditingEvent(event);
    form.reset({
      title: event.title,
      mediaType: event.videoLink ? "video" : event.imageUrl ? "image" : "none",
      videoLink: event.videoLink,
      imageUrl: event.imageUrl,
      description: event.description,
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this event?")) {
      try {
        await axios.delete("/api/events", { data: { id } });
        toast.success("Event deleted successfully!");
        fetchEvents();
      } catch (error) {
        toast.error("Failed to delete event");
      }
    }
  };

  const getYouTubeEmbedUrl = (url: string) => {
    try {
      const videoId = url.split('v=')[1]?.split('&')[0];
      return videoId ? `https://www.youtube.com/embed/${videoId}` : url;
    } catch {
      return url;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-semibold tracking-tight">Events Management</h2>
        <Button
          onClick={() => {
            setShowForm(!showForm);
            setEditingEvent(null);
            form.reset();
          }}
          className="bg-blue-600 hover:bg-blue-700"
        >
          {showForm ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
          {showForm ? " Cancel" : " Add Event"}
        </Button>
      </div>

      {showForm && (
        <div className="mb-8 bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-xl font-semibold mb-4">
            {editingEvent ? "Edit Event" : "Add New Event"}
          </h3>
          <Form {...form}>
            <form 
              onSubmit={(e) => {
                e.preventDefault();
                
                form.handleSubmit(onSubmit)(e);
              }} 
              className="space-y-6"
            >
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Event Title</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Event Title" disabled={isLoading} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="mediaType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Media Type</FormLabel>
                    <Select
                      disabled={isLoading}
                      onValueChange={(value) => {
                        field.onChange(value);
                        // Reset file when changing media type
                        if (value !== 'image') {
                          setSelectedFile(null);
                        }
                      }}
                      value={field.value}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select media type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="none">No Media</SelectItem>
                        <SelectItem value="video">YouTube Video</SelectItem>
                        <SelectItem value="image">Image</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {form.watch("mediaType") === "image" && (
                <div className="space-y-4">
                  <FormItem>
                    <FormLabel>Upload Image</FormLabel>
                    <FormControl>
                      <div className="flex flex-col items-center gap-4">
                        <div 
                          className={cn(
                            "w-full h-32 border-2 border-dashed rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-blue-500 transition-colors",
                            selectedFile && "border-blue-500 bg-blue-50"
                          )}
                          onClick={() => document.getElementById('file-input')?.click()}
                          onDragOver={(e: React.DragEvent) => {
                            e.preventDefault();
                            e.stopPropagation();
                          }}
                          onDrop={(e: React.DragEvent) => {
                            e.preventDefault();
                            e.stopPropagation();
                            handleFileChange(e.nativeEvent as DragEvent);
                          }}
                        >
                          <input
                            id="file-input"
                            type="file"
                            accept="image/*"
                            onChange={handleFileChange}
                            className="hidden"
                          />
                          {selectedFile ? (
                            <>
                              <ImageIcon className="h-8 w-8 text-blue-500" />
                              <p className="mt-2 text-sm text-blue-500">{selectedFile.name}</p>
                            </>
                          ) : (
                            <>
                              <Upload className="h-8 w-8 text-gray-400" />
                              <p className="mt-2 text-sm text-gray-500">Click to upload or drag and drop</p>
                              <p className="text-xs text-gray-400">PNG, JPG up to 5MB</p>
                            </>
                          )}
                        </div>
                        {uploadProgress > 0 && uploadProgress < 100 && (
                          <div className="w-full h-2 bg-gray-200 rounded">
                            <div
                              className="h-full bg-blue-600 rounded"
                              style={{ width: `${uploadProgress}%` }}
                            />
                          </div>
                        )}
                      </div>
                    </FormControl>
                  </FormItem>
                </div>
              )}

              {form.watch("mediaType") === "video" && (
                <FormField
                  control={form.control}
                  name="videoLink"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>YouTube Video URL</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="url"
                          value={field.value || ''}
                          placeholder="https://www.youtube.com/watch?v=example"
                          disabled={isLoading}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        placeholder="Event Description"
                        disabled={isLoading}
                        rows={5}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button
                type="submit"
                disabled={isLoading || !form.watch("title") || !form.watch("description")}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white"
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Saving...</span>
                  </div>
                ) : (
                  <span>{editingEvent ? "Update Event" : "Add Event"}</span>
                )}
              </Button>

              {Object.keys(form.formState.errors).length > 0 && (
                <div className="text-red-500 text-sm">
                  {Object.entries(form.formState.errors).map(([key, error]) => (
                    <p key={key}>{error?.message}</p>
                  ))}
                </div>
              )}
            </form>
          </Form>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-md">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Media</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created At</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {events.map((event) => (
              <tr key={event.id}>
                <td className="px-6 py-4 whitespace-nowrap">{event.title}</td>
                <td className="px-6 py-4">
                  {event.imageUrl ? (
                    <div className="flex items-center space-x-2">
                      <div className="w-16 h-16 relative rounded-md overflow-hidden bg-gray-100">
                        <EventImage
                          fileKey={event.imageUrl.split('/').pop()!}
                          alt={event.title}
                          className="object-cover w-full h-full"
                        />
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setSelectedImage({ url: event.imageUrl!, title: event.title })}
                        className="text-blue-600 hover:text-blue-700"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : event.videoLink ? (
                    <div className="flex flex-col space-y-2">
                      <a 
                        href={event.videoLink} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 flex items-center space-x-1"
                      >
                        <span>Watch on YouTube</span>
                        <Eye className="h-4 w-4" />
                      </a>
                      <div className="text-xs text-gray-500 break-all max-w-xs">
                        {event.videoLink}
                      </div>
                    </div>
                  ) : (
                    <span className="text-gray-400">No media</span>
                  )}
                </td>
                <td className="px-6 py-4">
                  <div className="max-w-xs overflow-hidden text-ellipsis">
                    {event.description.length > 100 
                      ? `${event.description.substring(0, 100)}...` 
                      : event.description}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {new Date(event.createdAt).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex space-x-2">
                    <Button
                      onClick={() => handleEdit(event)}
                      size="sm"
                      variant="outline"
                      className="text-blue-600 hover:text-blue-700"
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      onClick={() => handleDelete(event.id)}
                      size="sm"
                      variant="outline"
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selectedImage && (
        <ImageModal
          isOpen={!!selectedImage}
          onClose={() => setSelectedImage(null)}
          imageUrl={selectedImage.url}
          title={selectedImage.title}
        />
      )}
    </div>
  );
};

export default EventsPage; 