'use client';

import { ChangeEvent, useState } from 'react';
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
import { createBlog, updateBlog, uploadImage } from '@/lib/actions/blog.actions';
import { createTag } from '@/lib/actions/tag.actions';

import { useEditorState } from '@/contexts/EditorContext';
import Image from 'next/image';
import { isBase64Image } from '@/lib/utils';
import { IoMdAdd } from "react-icons/io";
import { toast } from 'sonner';

interface Props {
  user: {
    id: string;
    role: "user" | "admin" | "superadmin";
    username: string
  },
  tags: {
    id: string
    name: string
  }[],
  edit?: boolean,
  editData?: {
    id: string;
    title: string;
    tags: string[];
    content: string;
    thumbnail: string;
  }
}

const BlogForm = ({ user, tags, edit, editData }: Props) => {
  const [phase, setPhase] = useState<"metadata" | "content">("metadata");
  const [files, setFiles] = useState<File[]>([]);
  const [tagSearch, setTagSearch] = useState<string>("")
  const [isSubmitting, setIsSubmitting] = useState<{ tag: boolean, blog: boolean }>({
    tag: false,
    blog: false
  })

  const { editorState } = useEditorState();
  const pathname = usePathname();
  const router = useRouter();

  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const blogForm = useForm({
    resolver: zodResolver(blogValidation),
    defaultValues: {
      author: user.id,
      title: edit ? (editData?.title || "") : "",
      content: edit ? (JSON.stringify(editData?.content) || "") : "",
      thumbnail: edit ? (editData?.thumbnail || "") : "",
      tags: edit ? (editData?.tags || []) : []
    }
  })

  const tagForm = useForm({
    resolver: zodResolver(tagValidation),
    defaultValues: {
      name: ""
    }
  })

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>, fieldChange: (value: string) => void) => {
    e.preventDefault();

    const fileReader = new FileReader();

    if(e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setFiles(Array.from(e.target.files));

      if(!file.type.includes("image")) return;

      fileReader.onload = async (event) => {
        const imageUrl = event.target?.result?.toString() || '';
        fieldChange(imageUrl)
      }

      fileReader.readAsDataURL(file);
    }
  }

  const handleNext = async () => {
    // title, tags verification
    const isValid = await blogForm.trigger(["title", "tags", "thumbnail"]);
    if(!isValid) return;

    // validation of max image size
    const fileSize = Number((files[0].size / 1024 / 1024).toFixed(2))
    if(fileSize > 4) {
      toast.error("Thumbnail too large");
      return;
    }

    if (isValid) {
      setPhase("content");
    }
  };

  const isEditorStateEmpty = (editorState: string): boolean => {
    const parsedState = JSON.parse(editorState);
    const root = parsedState.root;

    // Check if root has only one child and that child is an empty paragraph
    if (root.children.length === 1) {
      const firstChild = root.children[0];
      if (firstChild.type === 'paragraph' && firstChild.children.length === 0) {
        return true;
      }
    }

    return false;
  };

  const blogSubmit = async (value: z.infer<typeof blogValidation>) => {
    // content validation
    if(!editorState || isEditorStateEmpty(editorState)) {
      blogForm.setError("content", {
        type: "manual",
        message: "Content cannot be empty"
      });

      return;
    }
    value.content = JSON.parse(editorState);

    // uploading image
    if(!edit || (edit && files.length > 0)) { // Only upload image if it has changed
      try {
        setIsSubmitting((prev) => ({ ...prev, blog: true }));

        const blob = value.thumbnail;
        const hasChanged = isBase64Image(blob);

        if(hasChanged) {
          const formData = new FormData();
          formData.append('file', files[0]);

          const imageRes = await uploadImage(formData);
          if(imageRes.status !== 200 || !imageRes.data) throw new Error(imageRes.message)
          value.thumbnail = imageRes.data
        }
      } catch(error: any) {
        console.error(`Failed to upload image`)
        throw new Error("Failed to upload image")
      } finally {
        setIsSubmitting((prev) => ({ ...prev, blog: false }));
      }
    }

    // posting blog
    try {
      setIsSubmitting((prev) => ({ ...prev, blog: true }));

      let res;
      if(edit) {
        res = await updateBlog(editData?.id as string, pathname, {
          title: value.title,
          tags: value.tags,
          content: value.content,
          thumbnail: value.thumbnail
        })
      } else {
        res = await createBlog(pathname, {
          title: value.title,
          author: value.author,
          tags: value.tags,
          content: value.content,
          thumbnail: value.thumbnail
        })
      }
      if(!res || res.status !== 200) throw new Error(res.message);
      router.push("/")
    } catch(error: any) {
      console.error(`Failed to create blog: ${error.message}`)
      throw new Error(error.message)
    } finally {
      setIsSubmitting((prev) => ({ ...prev, blog: false }));
    }
  }

  const tagSubmit = async (value: z.infer<typeof tagValidation>) => {
    try {
      setIsSubmitting((prev) => ({ ...prev, tag: true }));

      const res = await createTag(value.name, pathname);
      if (!res || res.status !== 200) throw new Error(res.message)
      setIsDialogOpen(false); // Close the dialog
    } catch(error: any) {
      console.error(`Failed to create tag: ${error.message}`)
      throw new Error(error.message)
    } finally {
      setIsSubmitting((prev) => ({ ...prev, tag: true }));
    }
  }

  return (
    // container contains create tag and create blog
    <>

      {phase === "metadata" ? (
          <Form {...blogForm}>
            <div className="center">
              <form
                className="w-[80%] flex-col"
                onSubmit={blogForm.handleSubmit(async (value) => {
                  toast.promise(blogSubmit(value), {
                    loading: "posting blogs...",
                    success: "successfully posted blog",
                    error: (err: any) => `${err.message}`
                  })
                })}
                // onSubmit={blogForm.handleSubmit(blogSubmit)}
              >
                <div className="w-full p-4 rounded-md flex flex-col md:flex-row gap-3 bg-[#f5f5f5] shadow-xl">
                  <FormField
                    control={blogForm.control}
                    name="thumbnail"
                    render={({ field }) => (
                      <FormItem className="flex flex-col items-center gap-4 w-full md:w-[40%] rounded-md">
                        <FormLabel className="relative w-full h-96 md:h-full" htmlFor='imageUpload'>
                          {field.value ? (
                            <Image
                              src={field.value}
                              alt="Thumbnail"
                              priority
                              className="object-fill rounded-md"
                              fill
                            />
                          ) : (
                            <Image
                              src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAOEAAADhCAMAAAAJbSJIAAAAPFBMVEXk5ueutLepsLPo6uursbXJzc/p6+zj5ea2u76orrKvtbi0ubzZ3N3O0dPAxcfg4uPMz9HU19i8wcPDx8qKXtGiAAAFTElEQVR4nO2d3XqzIAyAhUD916L3f6+f1m7tVvtNINFg8x5tZ32fQAIoMcsEQRAEQRAEQRAEQRAEQRAEQRAEQRAEQRAEQRAEQTghAJD1jWtnXJPP/54IgNzZQulSmxvTH6oYXX4WS+ivhTbqBa1r26cvCdCu6i0YXbdZ0o4A1rzV+5IcE3YE+z58T45lqo7g1Aa/JY5tgoqQF3qb382x7lNzBLcxft+O17QUYfQI4IIeklKsPSN4i6LKj/7Zm8n99RbHJpEw9gEBXNBpKIYLJqKYRwjOikf//r+J8ZsVuacbqCMNleI9TqGLGqMzhnVdBOdd6F/RlrFijiCoVMk320CBIahUxTWI0KKEcJqKbMdpdJb5QvdHq6wCI5qhKlgGMS/RBHkubWDAE+QZxB4xhCyDiDkLZxgGEVdQldzSKbTIhmZkFkSEPcVvmBn2SMuZB9od7fQDsMiDdKJjFUSCQarM5WirZ3C2TT/htYnyPcPfgrFHWz0BI74gr6J/IZiGUxAZGQLqmvQLTrtE/Go4YxhVRIpEw+sww1IIcqr5NKmUUzLF3d4/qPkYIp2T/obPuemlojFUR4t9Q2Vojhb7BmgElWHzLPH8hucfpefPNFTVgs9h1AdU/Pin96vwWbWdf+X9Absn3OdO34aMdsDnP8WgKYisTqI6CkNGqZQo1XA6Ef6AU32SJzOcBukHPF07/xNSgmHKa5BOhtezv6mA/rYJpwXNAnbRZ1XuF3BzDcO3vpA3+ny2909gbqE4hhD3LIPhLLyBNhPZvbZ3B+3tPYa18A7auSlXQayKwTPNLKDcuOB0xPYKDPFTkWsevQPRZ1J8Hji9I1KQ34r7hZhrwNwOZ97QxNx0drwn4QI0wQk1DcEsfKCWKdxVvxPSNUIp/knmAXT+nT+Ko3+0H96rcNb3m1fx7MBTJdeBJ7uFcWsc0wvgAsC4pROW0l2inbAmIBv/7GZmuhQH6API2rr8T0e6yuZJ+80A9LZeG62T3tik31XwxtwZcizKuTHkMjB1WdZde4Kmic/A5ZI3rr1ae21d08PlVHYfAaxw9G9CYRbJ+8ZdbTcMRV1XM3VdF0M32vtoTdZ0+u29s0OttJ5bz64UwinjaFMVY9vkqc3KKSxN21Xl+0L4Q3Vuv1tYl0pqnX6ms4XetFz7gdZVAgUEoJntfOUe4ZwsHd9FzqQ3Vv6xe41l0XJcqcKl6TZvlv7ClAW3BsqQW4X7ypApB8dmTgK4IX5wvqIVj33HtD2qSG4BqznxdIefL27Y4sahi0MdIdvUsDva8agGGbCtITmCY31MHD2O0uIdh/0rJDQ1VX5Zdxz3rR2QDbv6qXl9vudzqQtGm1Jv9LDXOsfvvB7VcZ8PDKD0mQ1VHPYQ9O+Yj4hR1IUD8rBnn3ho2m8oQMxbCFiKlL2ioSW5heeJqegED52CzxCtcGD3Kv8Wms9EYLyUhwaFIhSMBClevWEmiK/Iaogu4H7sg6ppQhQG8RUqivuTGOAJOg6FfgW0q0M0PQMRMEgXaeNf3SYDZ8PIMI0+wHgr/MgN7wYwpiLjCCqM6ydUDZLQiB6nDdNC8SDyig3jPPpFXGcC9O8BUBDVmgBY59E7Md/35Loe/UVEECEJwYggJjELZ4J71SaQSBeC02n4Da29CayJNA28SAhd2CQyC1Xw6pSmGSINQVuMhAZp4DClan9MgmkDDNmezqwS8sgtlXK/EPBhoaSmYVC/F7IO1jQEdHOlabpKh3+jzLQSTUiq4X2I+Ip/zU8rlaqAvkS21ElR+gqu3zbjjL+hIAiCIAiCIAiCIAiCsCf/AKrfVhSbvA+DAAAAAElFTkSuQmCC"
                              alt="Thumbnail"
                              priority
                              fill
                              className="object-fill rounded-md"
                            />
                          )}
                        </FormLabel>
                        <FormControl className="flex-1 text-base-semibold text-gray-200">
                          <Input
                            type="file"
                            accept="image/*"
                            placeholder="upload profile picture"
                            className='hidden'
                            id="imageUpload"
                            onChange={(e) => handleImageChange(e, field.onChange)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="flex flex-col justify-start gap-6 full">
                    <FormField
                      control={blogForm.control}
                      name="title"
                      render={({ field }) => (
                        <FormItem className="flex flex-col w-full">
                          <FormLabel className="text-[16px] leading-[140%] font-bold">Title</FormLabel>
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
                        <FormItem className="flex flex-col w-full">
                          <FormLabel className="text-[16px] leading-[140%] font-bold">Tags</FormLabel>

                          <FormControl>
                            <div className="flex gap-5">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild className='bg-white w-[70%] rounded-md'>
                                <Button variant="outline">Select Tags</Button>
                              </DropdownMenuTrigger>

                              <DropdownMenuContent className="w-64 flex flex-col px-3">

                              <DropdownMenuSeparator />

                              {/* search */}
                              <Input
                                type="text"
                                placeholder="Search..."
                                className="border border-[rgb(33,33,33)] no-focus"
                                onChange={(e) => setTagSearch(e.target.value)}
                              />

                              <DropdownMenuSeparator />

                              {/* tags */}
                              {
                                (() => {
                                  const filteredTags = tags.filter((tag) => tag.name.includes(tagSearch));
                                  return filteredTags.length === 0 ? (
                                    <p className='text-center p-3'>No match</p>
                                  ) : (
                                    filteredTags.map((tag: { name: string, id: string }) => (
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
                                    ))
                                  );
                                })()
                              }
                            </DropdownMenuContent>
                          </DropdownMenu>

                          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>

                            <DialogTrigger asChild className='hidden sm:flex'>
                              <Button variant="outline" className='w-[30%]'>Create Tag</Button>
                            </DialogTrigger>
                            <DialogTrigger asChild className='flex sm:hidden'>
                              <Button variant="outline" className='rounded-md'>
                                <IoMdAdd />
                              </Button>
                            </DialogTrigger>

                            <DialogContent className="sm:max-w-[425px]">
                              <DialogHeader>
                                <DialogTitle>Create Tag</DialogTitle>
                              </DialogHeader>

                              <Form {...tagForm}>
                                    <form
                                      onSubmit={(e) => {
                                        e.preventDefault();
                                        tagForm.handleSubmit(async (value) => {
                                          toast.promise(tagSubmit(value), {
                                            loading: "Creating tag...",
                                            success: "Successfully created tag",
                                            error: (err: any) => `${err.message}`
                                          });
                                        })(e);
                                        e.stopPropagation();
                                      }}
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
                                    <Button type="submit" disabled={isSubmitting.tag}>
                                      {isSubmitting.tag ? "Creating tag..." : "Create"}
                                    </Button>
                                  </DialogFooter>
                                </form>
                              </Form>

                            </DialogContent>
                          </Dialog>

                        </div>
                        </FormControl>
                        <FormMessage />

                        {/* Render selected tags */}
                        <div className="border rounded-md w-full h-24 p-3">
                          <h3 className='font-bold'>Selected Tags: </h3>
                          <div className="full mt-2 overflow-auto">
                            {field.value.length === 0 ? (
                              <p className='text-center'>No tags selected</p>
                            ) : (
                              (field.value as string[])
                                .map(tagId => {
                                  const tag = tags.find(t => t.id === tagId);
                                  return tag ? tag.name : null;
                                })
                                .filter(tagName => tagName !== null)
                                .join(', ')
                            )}
                          </div>
                        </div>
                      </FormItem>
                      )}
                    />
                  </div>
                </div>

                <div className="mt-5 flex justify-end items-center gap-5">
                  <Button type="button" className="bg-black" disabled>
                    Prev
                  </Button>

                  <Button type="submit" className="bg-black" onClick={handleNext}>
                    Next
                  </Button>
                </div>

              </form>
            </div>
          </Form>

      ) : (
        <div className="flex flex-col">
          <Form {...blogForm}>
            <form
              onSubmit={blogForm.handleSubmit(async (value) => {
                toast.promise(blogSubmit(value), {
                  loading: "posting blogs...",
                  success: "successfully posted blog",
                  error: (err: any) => `${err.message}`
                })
              })}
              className="flex flex-col justify-start gap-6 full"
            >
              <div className="w-full">
                <FormField
                  control={blogForm.control}
                  name="content"
                  render={({ field }) => (
                    <FormItem className="flex flex-col w-full">
                      <FormLabel className="text-[16px] leading-[140%] font-[600px] text-light-2">Content</FormLabel>
                      <FormControl>
                        <Editor editorState={field.value} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="flex justify-end items-center gap-5">
                <Button type="button" className="bg-black" onClick={() => setPhase("metadata")}>
                  Prev
                </Button>

                <Button type="submit" disabled={isSubmitting.blog} className="bg-black">
                  {isSubmitting.blog ? "Posting Blog..." : "Post Blog"}
                </Button>
              </div>
            </form>
          </Form>

        </div>
      )}

    </>
  )
}

export default BlogForm;
