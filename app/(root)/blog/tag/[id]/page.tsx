import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { fetchBlogsOnTags } from "@/lib/actions/blog.actions";
import { Blog, Blogs, Session, Tag, Response } from "@/types";
import Link from "next/link";
import BlogCards from "@/components/cards/BlogCards";
import { fetchTag } from "@/lib/actions/tag.actions";
import Pagination from "@/components/shared/Pagination";

const BlogsOnTags = async ({ params, searchParams }: { params: { id: string }, searchParams: { "page-number": number, "page-size"?: number } }) => {
  if(!params.id) return null;
  if(!searchParams["page-number"]) redirect(`/blog/tag/${params.id}?page-number=1`);

  const [session, blogs, tag] = await Promise.all([
    getServerSession(authOptions),
    fetchBlogsOnTags({
      id: params.id,
      pageNumber: searchParams["page-number"],
    }),
    fetchTag(params.id)
  ]) as [Session | null, Response<Blogs>, Response<Tag>];

  if(blogs.status === 404) redirect(`/blog/tag/${params.id}?page-number=1`);
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
        {blogs.data.blogs.length === 0 ? (
          <p className="text-center">No blog found...</p>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {blogs?.data?.blogs?.map((blog: Blog) => (
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

        <Pagination
          path={`/blog/tag/${params.id}`}
          pageNumber={searchParams?.["page-number"] ? +searchParams["page-number"] : 1}
          isNext={blogs?.data?.hasNext}
        />
      </article>
    </>
  )
}

export default BlogsOnTags;
