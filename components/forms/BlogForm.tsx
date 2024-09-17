'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { usePathname, useRouter } from 'next/navigation';
import { zodResolver } from "@hookform/resolvers/zod";
import { blogValidation, tagValidation } from "@/lib/validation/blogs.validation";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { z } from "zod";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import Editor from '@/components/editor/Editor';
import { createBlog, createTag } from '@/lib/actions/blog.actions';

import { useEditorState } from '@/contexts/EditorContext';

interface Props {
  user: {
    id: string;
    role: "user" | "admin" | "super-admin";
    username: string
  },
  tags: {
    id: string
    name: string
  }[]
}

const BlogForm = ({ user, tags }: Props) => {
  const { editorState } = useEditorState();
  const pathname = usePathname();
  const router = useRouter();

  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const blogForm = useForm({
    resolver: zodResolver(blogValidation),
    defaultValues: {
      author: user.id,
      title: "",
      content: "",
      tags: []
    }
  })

  const tagForm = useForm({
    resolver: zodResolver(tagValidation),
    defaultValues: {
      name: ""
    }
  })

  const blogSubmit = async (value: z.infer<typeof blogValidation>) => {
    value.content = JSON.parse(editorState);

    try {
      const res = await createBlog({
        title: value.title,
        author: value.author,
        tags: value.tags,
        content: value.content
      })
      console.log(res)
      if(res && res.status === 200) router.push("/")
    } catch(error: any) {
      console.log(`Failed to post blog: ${error.message}`)
    }
  }

  const tagSubmit = async (value: z.infer<typeof tagValidation>) => {
    try {
      const res = await createTag(value.name, pathname);
      if (res && res.status === 200) {
        setIsDialogOpen(false); // Close the dialog
        console.log(res.message); // Ensure the message is logged
      }
    } catch(error: any) {
      console.error(`Failed to create tag: ${error.message}`)
    }
  }

  return (
    // container contains create tag and create blog
    <>
      <div className="flex flex-col">
        <Form {...blogForm}>
          <form
            onSubmit={blogForm.handleSubmit(blogSubmit)}
            className="flex flex-col justify-start gap-6 full"
          >

          {/* title and tags container */}
            <div className="flex justify-start gap-6 full flex-col sm:flex-row">
              <FormField
                control={blogForm.control}
                name="title"
                render={({ field }) => (
                  <FormItem className="flex flex-col w-full sm:w-[70%]">
                    <FormLabel className="text-[16px] leading-[140%] font-[600px] text-light-2">Title</FormLabel>
                    <FormControl>
                      <Input
                        type="text"
                        placeholder="Enter title..."
                        className="border border-[rgb(33,33,33)] no-focus"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={blogForm.control}
                name="tags"
                render={({ field }) => (
                  <FormItem className="flex flex-col w-full sm:w-[30%]">
                    <FormLabel className="text-[16px] leading-[140%] font-[600px] text-light-2">Tags</FormLabel>

                    <FormControl>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="outline">Select Tags</Button>
                        </DropdownMenuTrigger>

                        <DropdownMenuContent className="w-56">

                        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                          <DialogTrigger asChild>
                            <Button variant="outline" className='w-full'>Create Tag</Button>
                          </DialogTrigger>
                          <DialogContent className="sm:max-w-[425px]">
                            <DialogHeader>
                              <DialogTitle>Create Tag</DialogTitle>
                            </DialogHeader>

                            <Form {...tagForm}>
                              <form
                                onSubmit={tagForm.handleSubmit(tagSubmit)}
                                className="flex flex-col justify-start gap-6 full"
                              >
                                <FormField
                                  control={tagForm.control}
                                  name="name"
                                  render={({ field }) => (
                                    <FormItem className="flex flex-col w-full">
                                      <FormLabel className="text-[16px] leading-[140%] font-[600px] text-light-2">Tag Name</FormLabel>
                                      <FormControl>
                                        <Input
                                          type="text"
                                          placeholder="Enter tag name..."
                                          className="border border-[rgb(33,33,33)] no-focus"
                                          {...field}
                                        />
                                      </FormControl>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />

                                <DialogFooter>
                                  <Button type="submit">Create</Button>
                                </DialogFooter>
                              </form>
                            </Form>

                          </DialogContent>
                        </Dialog>

                        <DropdownMenuSeparator />
                        {tags.map((tag: {name: string, id: string}) => (
                          <DropdownMenuCheckboxItem
                            key={tag.id}
                            checked={(field.value as string[]).includes(tag.id)}
                            onCheckedChange={(checked) => {
                              const newValue = checked
                                ? [...(field.value as string[]), tag.id]
                                : (field.value as string[]).filter((value: string) => value !== tag.id);
                              field.onChange(newValue);
                            }}
                          >
                            {tag.name}
                          </DropdownMenuCheckboxItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </FormControl>
                  <FormMessage />
                </FormItem>
                )}
              />
            </div>

            {/* content area */}
            <div className="w-full">
              <FormField
                control={blogForm.control}
                name="content"
                render={() => (
                  <FormItem className="flex flex-col w-full">
                    <FormLabel className="text-[16px] leading-[140%] font-[600px] text-light-2">Content</FormLabel>
                    <FormControl>
                      <Editor />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <Button type="submit" className="bg-black">Post Blog</Button>
          </form>
        </Form>

      </div>

    </>
  )
}

export default BlogForm;
