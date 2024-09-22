import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import { fetchAllTags } from "@/lib/actions/tag.actions";
import BlogForm from "@/components/forms/BlogForm";
import { EditorStateProvider } from "@/contexts/EditorContext";
import { Response, Session, Tag } from "@/types";

const CreateBlog = async () => {
  const [session, tags] = await Promise.all([
    getServerSession(authOptions),
    fetchAllTags()
  ]) as [Session | null, Response<Tag[]>]

  if(!session) redirect("/sign-in");

  return (
    <section className="full">
      <h1 className="head">Create Your Blogs: </h1>

      <div className="full mt-6">
        <EditorStateProvider>
          <BlogForm user={session.user} tags={tags.data || []} />
        </EditorStateProvider>
      </div>
    </section>
  )
}

export default CreateBlog;
