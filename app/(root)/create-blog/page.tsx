import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import { fetchAllTags } from "@/lib/actions/tag.actions";
import BlogForm from "@/components/forms/BlogForm";
import { EditorStateProvider } from "@/contexts/EditorContext";

interface session {
  user: {
    id: string;
    role: "user" | "admin" | "super-admin";
    username: string
  }
}

const CreateBlog = async () => {
  const [session, tags] = await Promise.all([
    getServerSession(authOptions) as Promise<session | null>,
    fetchAllTags()
  ])

  if(!session) redirect("/sign-in");

  return (
    <section className="full">
      <h1 className="font-bold text-xl">Create Your Blogs: </h1>

      <div className="full mt-6">
        <EditorStateProvider>
          <BlogForm user={session.user} tags={tags || []} />
        </EditorStateProvider>
      </div>
    </section>
  )
}

export default CreateBlog;
