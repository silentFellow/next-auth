'use server'

import { eq } from 'drizzle-orm'
import { tags } from '@/lib/drizzle/schema'
import connectToDb from '@/lib/drizzle'
import { revalidatePath } from 'next/cache'

export const fetchAllTags = async () => {
  try {
    const db = await connectToDb();
    const allTags = await db.select().from(tags);
    return allTags;
  } catch(error: any) {
    console.error(`Error fetching tag: ${error.message}`);
  }
}

export const fetchTag = async (name: string) => {
  try {
    const db = await connectToDb();
    const tag = await db.select().from(tags).where(eq(tags.name, name)).limit(1);
    if(!tag) throw new Error("Tag not found");
    return tag;
  } catch(error: any) {
    console.error(`Error fetching tag: ${error.message}`);
  }
}

export const createTag = async (name: string, path: string) => {
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
