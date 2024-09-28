import { Button } from "@/components/ui/button";
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { fetchBlogs } from "@/lib/actions/blog.actions";
import { Response, Blogs, Blog, Session } from "@/types";
import Link from "next/link";
import BlogCards from "@/components/cards/BlogCards";
import { redirect } from "next/navigation";
import Pagination from "@/components/shared/Pagination";

const Home = async ({ searchParams }: { searchParams: { "page-number": number, "page-size"?: number } }) => {
  if(!searchParams["page-number"]) redirect("?page-number=1");

  const [session, blogs] = await Promise.all([
    getServerSession(authOptions),
    fetchBlogs({ pageNumber: searchParams["page-number"] })
  ]) as [Session | null, Response<Blogs>];

  if(blogs.status === 404) redirect('/?page-number=1')
  if(blogs.status !== 200 || !blogs.data) return null;

  return (
    <>
      <div className="w-full flex justify-between">
        <h1 className="head">Welcome to the Blogs</h1>

        {session && session.user.role === "admin" && (
          <Link href="/create-blog">
            <Button className="uppercase">Create</Button>
          </Link>
        )}
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
          path='/'
          pageNumber={searchParams?.["page-number"] ? +searchParams["page-number"] : 1}
          isNext={blogs?.data?.hasNext}
        />
      </article>
    </>
  )
}

export default Home;
