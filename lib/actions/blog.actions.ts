'use server'

import { eq } from 'drizzle-orm'
import { tags, blogs } from '@/lib/drizzle/schema'
import connectToDb from '@/lib/drizzle'
import { revalidatePath } from 'next/cache'

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
    const exists = await fetchTag(name);
    if(exists) throw new Error("Tag already exists");
    const create = await db.insert(tags).values({ name });

    revalidatePath(path);
    return create;
  } catch(error: any) {
    console.error(`Error fetching user: ${error.message}`);
  }
}

export {
  fetchTag,
  fetchAllTags,
  createTag
}
