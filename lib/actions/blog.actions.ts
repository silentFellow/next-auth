'use server'

import { eq, sql } from 'drizzle-orm'
import { tags, blogs, users } from '@/lib/drizzle/schema'
import connectToDb from '@/lib/drizzle'
import { revalidatePath } from 'next/cache'
import { ProcessedBlog } from '@/types'

const fetchAllTags = async () => {
  try {
    const db = await connectToDb();
    const allTags = await db.select().from(tags);
    return allTags;
  } catch(error: any) {
    console.error(`Error fetching tag: ${error.message}`);
  }
}

const fetchTag = async (name: string) => {
  try {
    const db = await connectToDb();
    const tag = await db.select().from(tags).where(eq(tags.name, name)).limit(1);
    if(!tag) throw new Error("Tag not found");
    return tag;
  } catch(error: any) {
    console.error(`Error fetching tag: ${error.message}`);
  }
}

const createTag = async (name: string, path: string) => {
  try {
    const db = await connectToDb();
    const exists = await db.select().from(tags).where(eq(tags.name, name)).limit(1);

    if(exists.length > 0) throw new Error("Tag already exists");
    await db.insert(tags).values({ name });

    revalidatePath(path);
    return { message: "Tag created successfully", status: 200 }
  } catch(error: any) {
    console.error(`Error creating tag: ${error.message}`);
  }
}

const createBlog = async (
  {
    author,
    title,
    tags,
    content
  } : {
    author: string;
    title: string;
    tags: string[];
    content: string;
  },
) => {
  try {
    const db = await connectToDb();

    const user = await db.select().from(users).where(eq(users.id, author)).limit(1)
    if(!user || user.length === 0) throw new Error("author not found");

    await db.insert(blogs).values({ author, title, tags, content });

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
    .leftJoin(users, eq(blogs.author, users.id))
    .leftJoin(tags, sql`${blogs.tags} && ARRAY[${tags.id}]::uuid[]`);

    // Process the result to group tags for each blog
    const processedBlogs = blogResult.reduce<Record<string, ProcessedBlog>>((acc, row) => {
      const blogId = row.blog.id;
      if (!acc[blogId]) {
        acc[blogId] = {
          ...row.blog,
          author: row.author || null,
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
    .leftJoin(users, eq(blogs.author, users.id))
    .leftJoin(tags, sql`${blogs.tags} && ARRAY[${tags.id}]::uuid[]`);

    // Process the result to group tags for each blog
    if (blogResult.length === 0) {
      return { message: "Blog not found", status: 404 };
    }

    const row = blogResult[0];
    const processedBlog: ProcessedBlog = {
      ...row.blog,
      author: row.author || null,
      tags: blogResult.map(r => r.tag).filter(tag => tag !== null),
      createdAt: row.blog.createdAt.toISOString(),
      updatedAt: row.blog.updatedAt.toISOString()
    };

    return { message: "Blogs fetched successfully", status: 200, data: processedBlog };
  } catch(error: any) {
    console.error(`Error fetching blogs: ${error.message}`);
    return { message: "Error fetching blogs", status: 500 };
  }
}

export {
  fetchTag,
  fetchAllTags,
  createTag,
  createBlog,
  fetchBlogs,
  fetchBlog
}
