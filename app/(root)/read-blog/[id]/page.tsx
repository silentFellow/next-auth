import ReadOnly from "@/components/editor/ReadOnly";
import { fetchBlog } from "@/lib/actions/blog.actions";
import { redirect } from "next/navigation";

const Page = async ({ params }: { params: { id: string }}) => {
  if(!params.id) redirect("/");

  const blog = await fetchBlog(params.id);
  if(blog.status !== 200) redirect("/");

  return (
    <div>
      <ReadOnly content={blog.data?.content} />
    </div>
  )
}

export default Page;
