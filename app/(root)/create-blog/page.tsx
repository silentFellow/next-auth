import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import { fetchAllTags } from "@/lib/actions/blog.actions";
import BlogForm from "@/components/forms/BlogForm";

interface user {
  id: string;
  role: "user" | "admin" | "super-admin";
  username: string
}

const CreateBlog = async () => {
  const [user, tags] = await Promise.all([
    await getServerSession(authOptions) as user | null,
    await fetchAllTags()
  ])
  if(!user) redirect("/sign-in");

  return (
  <section className="full">
    <h1 className="font-bold text-xl">Create Your Blogs: </h1>

    <div className="full mt-6">
      <BlogForm user={user} tags={tags || []} />
    </div>
  </section>
  )
}

export default CreateBlog;
