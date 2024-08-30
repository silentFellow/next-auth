'use server'

import { eq } from 'drizzle-orm'
import { users } from '@/lib/drizzle/schema'
import connectToDb from '@/lib/drizzle'

const fetchUser = async (username: string) => {
  try {
    const db = await connectToDb();
    const user = await db.select().from(users).where(eq(users.username, username)).limit(1);
    if(!user) throw new Error("User not found");
    return user;
  } catch(error: any) {
    console.error(`Error fetching user: ${error.message}`);
  }
}

export {
  fetchUser
}
