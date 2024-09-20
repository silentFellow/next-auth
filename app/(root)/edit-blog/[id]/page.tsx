import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import { fetchAllTags } from "@/lib/actions/tag.actions";
import BlogForm from "@/components/forms/BlogForm";
import { EditorStateProvider } from "@/contexts/EditorContext";
import { fetchBlog } from "@/lib/actions/blog.actions";

interface session {
  user: {
    id: string;
    role: "user" | "admin" | "super-admin";
    username: string
  }
}

const EditBlog = async ({ params }: { params: { id: string } }) => {
  const [session, tags, blog] = await Promise.all([
    getServerSession(authOptions) as Promise<session | null>,
    fetchAllTags(),
    fetchBlog(params.id)
  ])

  if(!session) redirect("/sign-in");
  if(!blog.data || blog.status !== 200) redirect("/blogs");

  const editData = {
    id: blog.data[0]?.id,
    title: blog.data[0]?.title,
    tags: blog.data[0]?.tags.map((tag) => tag.id),
    content: blog.data[0]?.content,
    thumbnail: blog.data[0]?.thumbnail,
  }

  return (
  <section className="full">
    <h1 className="font-bold text-xl">Edit Your Blogs: </h1>

    <div className="full mt-6">
      <EditorStateProvider>
        <BlogForm
          user={session.user}
          tags={tags || []}
          edit
          editData={editData}
        />
      </EditorStateProvider>
    </div>
  </section>
  )
}

export default EditBlog;
