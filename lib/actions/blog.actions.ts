'use server'

import { arrayOverlaps, eq, sql } from 'drizzle-orm'
import { tags, blogs, users } from '@/lib/drizzle/schema'
import connectToDb from '@/lib/drizzle'
import { Blog } from '@/types'
import { uploadFilesToS3 } from '../aws-fileupload'
import { revalidatePath } from 'next/cache'

const createBlog = async (
  {
    author,
    title,
    tags,
    content,
    thumbnail
  } : {
    author: string;
    title: string;
    tags: string[];
    content: string;
    thumbnail: string;
  },
) => {
  try {
    const db = await connectToDb();

    const user = await db.select().from(users).where(eq(users.id, author)).limit(1)
    if(!user || user.length === 0) throw new Error("author not found");

    await db.insert(blogs).values({ author, title, tags, content, thumbnail });

    return { message: "Blog created successfully", status: 200 }
  } catch(error: any) {
    console.error(`Error creating blogs: ${error.message}`);
  }
}

// fetch blogs
const fetchBlogs = async () => {
  try {
    const db = await connectToDb();
    const blogResult = await db.select({
      blog: blogs,
      tag: tags,
      author: {
        id: users.id,
        username: users.username
      }
    })
    .from(blogs)
    .innerJoin(users, eq(blogs.author, users.id))
    .leftJoin(tags, sql`${blogs.tags} && ARRAY[${tags.id}]::uuid[]`);

    // Process the result to group tags for each blog
    const processedBlogs = blogResult.reduce<Record<string, Blog>>((acc, row) => {
      const blogId = row.blog.id;
      if (!acc[blogId]) {
        acc[blogId] = {
          ...row.blog,
          author: row.author,
          tags: [],
          createdAt: row.blog.createdAt.toISOString(),
          updatedAt: row.blog.updatedAt.toISOString()
        };
      }
      if (row.tag) {
        acc[blogId].tags.push(row.tag);
      }
      return acc;
    }, {});

    const result = Object.values(processedBlogs);

    return { message: "Blogs fetched successfully", status: 200, data: result };
  } catch(error: any) {
    console.error(`Error fetching blogs: ${error.message}`);
    return { message: "Error fetching blogs", status: 500 };
  }
}

const fetchBlog = async (id: string) => {
  try {
    const db = await connectToDb();
    const blogResult = await db.select({
      blog: blogs,
      tag: tags,
      author: {
        id: users.id,
        username: users.username
      }
    })
    .from(blogs)
    .where(eq(blogs.id, id))
    .limit(1)
    .innerJoin(users, eq(blogs.author, users.id))
    .leftJoin(tags, sql`${blogs.tags} && ARRAY[${tags.id}]::uuid[]`);

    // Process the result to group tags for each blog
    const processedBlogs = blogResult.reduce<Record<string, Blog>>((acc, row) => {
      const blogId = row.blog.id;
      if (!acc[blogId]) {
        acc[blogId] = {
          ...row.blog,
          author: row.author,
          tags: [],
          createdAt: row.blog.createdAt.toISOString(),
          updatedAt: row.blog.updatedAt.toISOString()
        };
      }
      if (row.tag) {
        acc[blogId].tags.push(row.tag);
      }
      return acc;
    }, {});

    const result = Object.values(processedBlogs);

    return { message: "Blogs fetched successfully", status: 200, data: result };
  } catch(error: any) {
    console.error(`Error fetching blogs: ${error.message}`);
    return { message: "Error fetching blogs", status: 500 };
  }
}

const uploadImage = async (imageForm: FormData): Promise<string> => {
  try {
    const image: File | null = imageForm.get("file") as File;
    if(!image) throw new Error("No image found");
    const res = await uploadFilesToS3(image);
    return res
  } catch(error: any) {
    throw new Error(`Failed to upload image: ${error.message}`)
  }
}

const deleteBlog = async (id: string, path: string) => {
  try {
    const db = await connectToDb();
    const result = await db.delete(blogs).where(eq(blogs.id, id)).returning();

    if (result.length === 0) {
      throw new Error("Blog not found");
    }

    revalidatePath(path);
    return { message: "Blog deleted successfully", status: 200 };
  } catch (error: any) {
    console.error(`Error deleting blog: ${error.message}`);
    return { message: error.message, status: 404 };
  }
}

const updateBlog = async (
  id: string,
  {
    title,
    tags,
    content,
    thumbnail
  } : {
    title: string;
    tags: string[];
    content: string;
    thumbnail: string;
  }
) => {
  try {
    const db = await connectToDb();

    const exists = await db.select().from(blogs).where(eq(blogs.id, id))
    if (!exists || exists.length === 0) throw new Error("Blog not found");

    await db.update(blogs)
        .set({ 
            title, 
            tags, 
            content, 
            thumbnail, 
            updatedAt: new Date() 
        })
    .where(eq(blogs.id, id));
    return { message: "Blog updated successfully", status: 200 };
  } catch(error: any) {
    console.error(`Error updating blogs: ${error.message}`);
  }
}

const fetchBlogsOnTags = async (id: string) => {
  try {
    const db = await connectToDb();
    const blogResult = await db.select({
      blog: blogs,
      tag: tags,
      author: {
        id: users.id,
        username: users.username
      }
    })
    .from(blogs)
    .where(arrayOverlaps(blogs.tags, [id]))
    .innerJoin(users, eq(blogs.author, users.id))
    .leftJoin(tags, sql`${blogs.tags} && ARRAY[${tags.id}]::uuid[]`);

    // Process the result to group tags for each blog
    const processedBlogs = blogResult.reduce<Record<string, Blog>>((acc, row) => {
      const blogId = row.blog.id;
      if (!acc[blogId]) {
        acc[blogId] = {
          ...row.blog,
          author: row.author,
          tags: [],
          createdAt: row.blog.createdAt.toISOString(),
          updatedAt: row.blog.updatedAt.toISOString()
        };
      }
      if (row.tag) {
        acc[blogId].tags.push(row.tag);
      }
      return acc;
    }, {});

    const result = Object.values(processedBlogs);

    return { message: "Blogs fetched successfully", status: 200, data: result };
  } catch(error: any) {
    console.error(`Error fetching blogs: ${error.message}`);
    return { message: "Error fetching blogs", status: 500 };
  }
}

export {
  createBlog,
  updateBlog,
  fetchBlogs,
  fetchBlog,
  fetchBlogsOnTags,
  deleteBlog,
  uploadImage
}
