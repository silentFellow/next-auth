// import { getServerSession } from "next-auth/next"
// import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { fetchBlogs } from "@/lib/actions/blog.actions";
import { ProcessedBlog } from "@/types";
import Link from "next/link";

interface Blogs {
  message: string;
  status: number;
  data?: ProcessedBlog[];
}

const Home = async () => {
  const blogs: Blogs = await fetchBlogs()
  if(blogs.status !== 200) return null;

  return (
    <>
      <h1 className="font-bold text-xl">Welcome to the Blog</h1>

      <section className="mt-9 h-full flex flex-col gap-3">
        {blogs.data?.map((blog) => (
          <Link key={blog.id} href={`/read-blog/${blog.id}`}>{blog.title}</Link>
        ))}
      </section>
    </>
  )
}

export default Home;
