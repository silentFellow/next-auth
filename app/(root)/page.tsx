import { Button } from "@/components/ui/button";
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { fetchBlogs } from "@/lib/actions/blog.actions";
import { Blog, Session } from "@/types";
import Link from "next/link";
import BlogCards from "@/components/cards/BlogCards";

interface Blogs {
  message: string;
  status: number;
  data?: Blog[];
}

const Home = async () => {
  const [session, blogs] = await Promise.all([
    await getServerSession(authOptions),
    await fetchBlogs()
  ]) as [Session | null, Blogs];

  if(blogs.status !== 200 || !blogs.data) return null;

  return (
    <>
      <div className="w-full flex justify-between">
        <h1 className="font-bold text-xl">Welcome to the Blog</h1>

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

export default Home;
