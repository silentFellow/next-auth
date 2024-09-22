import ReadOnly from "@/components/editor/ReadOnly";
import { fetchBlog } from "@/lib/actions/blog.actions";
import { Response, Blog } from "@/types";
import { redirect } from "next/navigation";

const Page = async ({ params }: { params: { id: string }}) => {
  if(!params.id) redirect("/");

  const blog: Response<Blog> = await fetchBlog(params.id);
  if(blog.status !== 200 || !blog.data) redirect("/");

  return (
    <section>
      <h1 className="font-black text-xl mb-5">{blog.data.title}</h1>
      <ReadOnly content={blog.data?.content} />
    </section>
  )
}

export default Page;
