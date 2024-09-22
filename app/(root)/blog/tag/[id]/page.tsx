import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { fetchBlogsOnTags } from "@/lib/actions/blog.actions";
import { Blog, Session, Tag, Response } from "@/types";
import Link from "next/link";
import BlogCards from "@/components/cards/BlogCards";
import { fetchTag } from "@/lib/actions/tag.actions";

const BlogsOnTags = async ({ params }: { params: { id: string } }) => {
  if(!params.id) return null;

  const [session, blogs, tag] = await Promise.all([
    getServerSession(authOptions),
    fetchBlogsOnTags(params.id),
    fetchTag(params.id)
  ]) as [Session | null, Response<Blog[]>, Response<Tag>];

  if(blogs.status !== 200 || !blogs.data) redirect("/");
  if(tag.status !== 200 || !tag.data) redirect("/");

  return (
    <>
      <div className="w-full flex justify-between">
        <h1 className="head">{tag.data.name} Blog</h1>

        <Link href="/create-blog">
          <Button className="uppercase">Create</Button>
        </Link>
      </div>

      <article className="mt-9">
        {blogs.data.length === 0 ? (
          <p className="text-center">No blog found...</p>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {blogs?.data?.map((blog: Blog) => (
              <BlogCards
                key={blog.id}
                authUserId={session?.user?.id || null}
                author={blog.author}
                id={blog.id}
                title={blog.title}
                thumbnail={blog.thumbnail}
                tags={blog.tags}
              />
            ))}
          </div>
        )}
      </article>
    </>
  )
}

export default BlogsOnTags;
