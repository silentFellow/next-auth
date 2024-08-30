import { pgTable, varchar } from "drizzle-orm/pg-core";

export const users = pgTable('users', {
  id: varchar("id", { length: 255 }).notNull().unique(),
  username: varchar('name', { length: 255 }).notNull().unique(),
  password: varchar('password', { length: 255 }),
  role: varchar('role', { length: 255 }).notNull()
})
