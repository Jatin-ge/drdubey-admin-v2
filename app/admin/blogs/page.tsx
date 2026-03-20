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

interface BlogProps{ 
    initialData: any
}

const formSchema = z.object({
  title  :z.string().min(0, {
    message: "Title is required"
  }),
  subtitle1  :z.string().min(0, {
    message: "subtitle is required"
  }),
  content1  :z.string().min(0, {
    message: "content is required"
  }),
  image1  :z.string().min(0, {
    message: "Image is required"
  }),
  slug: z.string() || null,
  subtitle2 :  z.string() || null,
  content2 :  z.string() || null,
  image2: z.string()  || null,
  metaTitle: z.string() || null,

  metaDescription :  z.string() || null,
  metaKeywords :  z.string() || null
  
});

type AddYouTubeFormValues = z.infer<typeof formSchema>;

const BlogForm: React.FC<BlogProps> = ({initialData}) => {
  const [isLoading, setLoading] = useState(false);

  const router = useRouter();

  const form = useForm<AddYouTubeFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData || {
      title: '',
      subtitle1: '',
      content1: '',
      image1: '',
      slug: '',
      subtitle2: '',
      content2: '',
      image2: '',
      metaTitle: '',
      metaDescription: '',
      metaKeywords: '',
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
        setLoading(true);
        if(initialData){
            const res = await axios.put(`/api/blogs/${initialData.id}`, values);
            console.log("res", res.data)
            toast.success("blog updated successfully!");
            router.push("/admin/blogs/manage");
            return;
        
        }
        else{
            await axios.post("/api/blogs", values);
            form.reset();
            toast.success("blog added successfully!");

        }     
      // Redirect or perform any other action after successful submission
    } catch (error) {
      console.error("Error adding blogs:", error);
      toast.error("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mb-20">
      <div>
        <div className="flex flex-row justify-between mr-10">
            <h2 className="text-3xl font-bold mb-5 m-10">Add Blog</h2>
              <Button
              variant="primary"
                className="w-80 py-2 px-4 mt-6 text-white rounded-md cursor-pointer justify-center "
                disabled={isLoading}
                onClick={() => router.push("/admin/blogs/manage")}
              >
                Manage blogs
      </Button>
        </div>
        
        <div className="container mx-auto">
           <Form {...form} >
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <div className="space-y-8 px-6">
            <FormField
                  control={form.control}
                  name="image1"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                       <FileUpload
                       endpoint="blogImage1"
                       value = {field.value}
                       onChange = {field.onChange}
                       />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="image2"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                       <FileUpload
                       endpoint="blogImage2"
                       value = {field.value}
                       onChange = {field.onChange}
                       />
                      </FormControl>
                    </FormItem>
                  )}
                />
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="uppercase text-sm font-bold text-black dark:text-white">
                    Add Title  
                  </FormLabel>
                  <FormControl>
                    <Input
                      disabled={isLoading}
                      className="w-full mt-1 p-2 border border-primary focus:outline-none focus:border-secondary dark:text-white dark:bg-gray-800"
                      placeholder="Enter title"
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
              name="subtitle1"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="uppercase text-sm font-bold text-black dark:text-white">
                    Add subtitle  
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      disabled={isLoading}
                      className="w-full mt-1 p-2 border border-primary focus:outline-none focus:border-secondary dark:text-white dark:bg-gray-800"
                      placeholder="Enter subtitle"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            /> 
            <FormField
              control={form.control}
              name="content1"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="uppercase text-sm font-bold text-black dark:text-white">
                    Add content  
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      disabled={isLoading}
                      className="w-full mt-1 p-2 border border-primary focus:outline-none focus:border-secondary dark:text-white dark:bg-gray-800"
                      placeholder="Enter content"
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
                  <FormLabel className="uppercase text-sm font-bold text-black dark:text-white">
                    Add slug  
                  </FormLabel>
                  <FormControl>
                    <Input
                      disabled={isLoading}
                      className="w-full mt-1 p-2 border border-primary focus:outline-none focus:border-secondary dark:text-white dark:bg-gray-800"
                      placeholder="Enter slug"
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
              name="subtitle2"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="uppercase text-sm font-bold text-black dark:text-white">
                    Another subtitle2  
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      disabled={isLoading}
                      className="w-full mt-1 p-2 border border-primary focus:outline-none focus:border-secondary dark:text-white dark:bg-gray-800"
                      placeholder="Enter subtitle2"
                      {...field}
                      
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            /> 
            <FormField
              control={form.control}
              name="content2"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="uppercase text-sm font-bold text-black dark:text-white">
                    Add content2  
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      disabled={isLoading}
                      className="w-full mt-1 p-2 border border-primary focus:outline-none focus:border-secondary dark:text-white dark:bg-gray-800"
                      placeholder="Enter content2"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            /> 
            <FormField
              control={form.control}
              name="metaTitle"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="uppercase text-sm font-bold text-black dark:text-white">
                    Add metaTitle  
                  </FormLabel>
                  <FormControl>
                    <Input
                      disabled={isLoading}
                      className="w-full mt-1 p-2 border border-primary focus:outline-none focus:border-secondary dark:text-white dark:bg-gray-800"
                      placeholder="Enter metaDescription"
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
              name="metaDescription"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="uppercase text-sm font-bold text-black dark:text-white">
                    Add metaDescription  
                  </FormLabel>
                  <FormControl>
                    <Input
                      disabled={isLoading}
                      className="w-full mt-1 p-2 border border-primary focus:outline-none focus:border-secondary dark:text-white dark:bg-gray-800"
                      placeholder="Enter metaDescription"
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
              name="metaKeywords"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="uppercase text-sm font-bold text-black dark:text-white">
                    Add metaKeywords  
                  </FormLabel>
                  <FormControl>
                    <Input
                      disabled={isLoading}
                      className="w-full mt-1 p-2 border border-primary focus:outline-none focus:border-secondary dark:text-white dark:bg-gray-800"
                      placeholder="Enter metaKeywords"
                      {...field}
                      type="text"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            /> 
           
          </div>

          
           <Button
                type="submit"
                className="w-full py-2 bg-primary text-white rounded-md cursor-pointer"
                disabled={false}
              >
                Add blog
              </Button>
              
        
        </form>
      </Form>

        </div>
        
      </div>
      

    </div>
  );
};

export default BlogForm;
