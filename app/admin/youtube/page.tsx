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
import { Youtube } from "lucide-react";

const formSchema = z.object({
  link: z.string().url({
    message: "Invalid URL. Please enter a valid YouTube link.",
  }),
});

type AddYouTubeFormValues = z.infer<typeof formSchema>;

const Page = () => {
  const [isLoading, setLoading] = useState(false);
  const router = useRouter();

  const form = useForm<AddYouTubeFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      link: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      setLoading(true);
      await axios.post("/api/youtube", values);
      form.reset();
      toast.success("YouTube link added successfully!");
    } catch (error) {
      console.error("Error adding YouTube link:", error);
      toast.error("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto px-4 py-12">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-md p-8 border border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-3 mb-6">
          <Youtube className="h-7 w-7 text-red-500" />
          <h2 className="text-2xl font-semibold tracking-tight">Add YouTube Video</h2>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="link"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    YouTube Video URL
                  </FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="url"
                      placeholder="https://www.youtube.com/watch?v=example"
                      disabled={isLoading}
                      className="h-11 text-sm focus-visible:ring-2 focus-visible:ring-primary"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex flex-col sm:flex-row gap-4 pt-2">
              <Button
                type="submit"
                disabled={isLoading}
                className="flex-1 h-11 text-sm font-medium transition-colors"
              >
                {isLoading ? "Adding..." : "Add Video"}
              </Button>

              <Button
                type="button"
                variant="outline"
                onClick={() => router.push("/admin/youtube/manage")}
                disabled={isLoading}
                className="flex-1 h-11 text-sm font-medium bg-rose-500 hover:bg-rose-600 text-white border-0 transition-colors"
              >
                Manage Videos
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
};

export default Page;
