'use client';

import { useState } from "react";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"

import { FaEdit } from "react-icons/fa";
import { MdDeleteOutline } from "react-icons/md";

import { usePathname } from "next/navigation";
import { deleteBlog } from "@/lib/actions/blog.actions";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";

interface Props {
  authUserId: string | null;
  author: {
    id: string;
    username: string
  },
  id: string;
  title: string;
  thumbnail: string;
  tags: {
    id: string;
    name: string;
  }[];
}

const BlogCards = ({ authUserId, author, id, title, thumbnail, tags }: Props) => {
  const path = usePathname();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isImageLoaded, setIsImageLoaded] = useState(true);

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      const res = await deleteBlog(id, path);
      if(res.status !== 200) throw new Error(res.message);
      setIsDialogOpen(false);
    } catch(error: any) {
      console.error(`Error deleting blog: ${error.message}`);
      throw new Error(error.message);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Card className="bg-[#f5f5f5] flex flex-col sm:flex-row h-full">
      {/* image section */}
      <CardContent className="relative w-full sm:w-1/3 h-64 sm:h-full p-2">
        <Image
          src={thumbnail}
          alt="Thumbnail"
          priority
          fill
          onLoadStart={() => setIsImageLoaded(false)}
          onLoad={() => setIsImageLoaded(true)}
        />
        {!isImageLoaded && (
          <Skeleton className="full bg-[rgb(200,200,200)]" />
        )}
      </CardContent>

      {/* title-tag footer section */}
      <div className="flex-1 w-full sm:w-2/3 flex flex-col">
        <CardHeader className="flex-1 w-full flex flex-col">
          <div className="flex-1 w-full overflow-hidden h-16">
            <CardTitle className="whitespace-normal break-words">{title}</CardTitle>
          </div>
          <div className="w-full flex overflow-x-scroll overflow-y-hidden py-2 h-10">
            {tags.map((tag) => (
              <Link key={tag.id} href={`/blog/tag/${tag.id}`}>
                <CardDescription className="text-blue-500 hover:underline mr-2">#{tag.name}</CardDescription>
              </Link>
            ))}
          </div>
        </CardHeader>

        <CardFooter className="flex justify-between items-center p-2">
          {/* edit and delete section */}
          {authUserId === author.id && (
            <div className="flex gap-1">
              {/* desktop navigation */}
              <Link href={`/edit-blog/${id}`} className="hidden sm:flex">
                <Button variant="outline">Edit</Button>
              </Link>

              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" className="hidden sm:flex">Delete</Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle>Delete profile</DialogTitle>
                    <DialogDescription>
                      Are you sure you want to delete this blog?
                    </DialogDescription>
                  </DialogHeader>
                  <DialogFooter>
                    <Button
                      type="submit"
                      disabled={isDeleting}
                      onClick={() => {
                        toast.promise(handleDelete(), {
                          loading: "Deleting blog...",
                          success: "Blog deleted successfully",
                          error: (err: any) => `${err.message}`
                        })
                      }}
                    >
                      Delete Blog
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>

              {/* mobile navigation */}
              <Link href={`/edit-blog/${id}`} className="flex sm:hidden">
                <Button variant="outline">
                  <FaEdit />
                </Button>
              </Link>

              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline" className="flex sm:hidden">
                    <MdDeleteOutline />
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle>Delete profile</DialogTitle>
                    <DialogDescription>
                      Are you sure you want to delete this blog?
                    </DialogDescription>
                  </DialogHeader>
                  <DialogFooter>
                    <Button
                      type="submit"
                      disabled={isDeleting}
                      onClick={() => {
                        toast.promise(handleDelete(), {
                          loading: "Deleting blog...",
                          success: "Blog deleted successfully",
                          error: (err: any) => `${err.message}`
                        })
                      }}
                    >
                      Delete Blog
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          )}

          {/* visit section */}
          <Button variant="link" asChild className="w-full flex justify-end">
            <Link href={`/read-blog/${id}`}>Read more</Link>
          </Button>
        </CardFooter>
      </div>
    </Card>
  );
}

export default BlogCards;
