import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import { fetchAllTags } from "@/lib/actions/tag.actions";
import BlogForm from "@/components/forms/BlogForm";
import { EditorStateProvider } from "@/contexts/EditorContext";
import { fetchBlog } from "@/lib/actions/blog.actions";
import { Response, Blog, Tag, Session } from "@/types";

const EditBlog = async ({ params }: { params: { id: string } }) => {
  const [session, tags, blog] = await Promise.all([
    getServerSession(authOptions),
    fetchAllTags(),
    fetchBlog(params.id)
  ]) as [Session | null, Response<Tag[]>, Response<Blog>]

  if(!session || !session.user) redirect("/sign-in");
  if(!blog.data || blog.status !== 200) redirect("/blogs");

  const editData = {
    id: blog.data?.id,
    title: blog.data?.title,
    tags: blog.data?.tags.map((tag) => tag.id),
    content: blog.data?.content,
    thumbnail: blog.data?.thumbnail,
  }

  return (
  <section className="full">
    <h1 className="head">Edit Your Blogs: </h1>

    <div className="full mt-6">
      <EditorStateProvider>
        <BlogForm
          user={session.user}
          tags={tags.data || []}
          edit
          editData={editData}
        />
      </EditorStateProvider>
    </div>
  </section>
  )
}

export default EditBlog;
