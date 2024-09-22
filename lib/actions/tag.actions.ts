'use server'

import { eq } from 'drizzle-orm'
import { tags } from '@/lib/drizzle/schema'
import connectToDb from '@/lib/drizzle'
import { revalidatePath } from 'next/cache'
import { Response, Tag } from '@/types'

export const fetchAllTags = async (): Promise<Response<Tag[]>> => {
  try {
    const db = await connectToDb();
    const allTags = await db.select().from(tags);
    return { message: "Tags fetched successfully", status: 200, data: allTags };
  } catch(error: any) {
    console.error(`Error fetching tags: ${error.message}`);
    return { message: "Error fetching tags", status: 500 };
  }
}

export const fetchTag = async (id: string): Promise<Response<Tag>> => {
  try {
    const db = await connectToDb();
    const tag = await db.select().from(tags).where(eq(tags.id, id)).limit(1);
    if(!tag || tag.length === 0) throw new Error("Tag not found");
    return { message: "Tag fetched successfully", status: 200, data: tag[0] };
  } catch(error: any) {
    console.error(`Error fetching tag: ${error.message}`);
    return { message: "Tag not found", status: 404 };
  }
}

export const createTag = async (name: string, path: string): Promise<Response> => {
  try {
    const db = await connectToDb();
    const exists = await db.select().from(tags).where(eq(tags.name, name)).limit(1);

    if(exists.length > 0) throw new Error("Tag already exists");
    await db.insert(tags).values({ name });

    revalidatePath(path);
    return { message: "Tag created successfully", status: 200 };
  } catch(error: any) {
    console.error(`Error creating tag: ${error.message}`);
    return { message: "Error creating tag", status: 500 };
  }
}
