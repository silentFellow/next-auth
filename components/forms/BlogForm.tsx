'use client';

import { useForm } from 'react-hook-form';
import { usePathname } from 'next/navigation';
import { zodResolver } from "@hookform/resolvers/zod";
import { blogValidation, tagValidation } from "@/lib/validation/blogs.validation";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { z } from "zod";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import Editor from '@/components/editor/Editor';
import { createTag } from '@/lib/actions/blog.actions';

interface Props {
  user: {
    id: string;
    role: "user" | "admin" | "super-admin";
    username: string
  },
  tags: {
    name: string
  }[]
}

const BlogForm = ({ user, tags }: Props) => {
  const pathname = usePathname();

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
    console.log(value);
  }

  const tagSubmit = async (value: z.infer<typeof tagValidation>) => {
    try {
      const res = await createTag(value.name, pathname);
      console.log(res);
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
                    <FormLabel className="text-[16px] leading-[140%] font-[600px] text-light-2">Username</FormLabel>
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
                    <FormLabel className="text-[16px] leading-[140%] font-[600px] text-light-2">Username</FormLabel>

                    <FormControl>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="outline">Select Tags</Button>
                        </DropdownMenuTrigger>

                        <DropdownMenuContent className="w-56">

                        <Dialog>
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
                        {tags.map((tag: {name: string}) => (
                          <DropdownMenuCheckboxItem
                            key={tag.name}
                            checked={(field.value as string[]).includes(tag.name)}
                            onCheckedChange={(checked) => {
                              const newValue = checked
                                ? [...(field.value as string[]), tag.name]
                                : (field.value as string[]).filter((value: string) => value !== tag.name);
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
                render={({ field }) => (
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

          </form>
        </Form>

      </div>

    </>
  )
}

export default BlogForm;
