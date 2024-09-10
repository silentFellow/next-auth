import { pgTable, uuid, varchar, text } from "drizzle-orm/pg-core";

export const users = pgTable('users', {
  id: varchar("id", { length: 255 }).notNull().unique(),
  username: varchar('name', { length: 255 }).notNull().unique(),
  password: varchar('password', { length: 255 }),
  role: varchar('role', { length: 255 }).notNull()
})

export const tags = pgTable('tags', {
  name: varchar('name', { length: 12 }).primaryKey().notNull().unique()
})

export const blogs = pgTable("blogs", {
  id: uuid("id").primaryKey().defaultRandom(),
  tags: varchar('tags', { length: 12 }).references(() => tags.name, { onDelete: 'cascade' }).array(),
  author: varchar("id", { length: 255 }).notNull().unique().references(() => users.id, { onDelete: "cascade" }),
  title: varchar('title', { length: 30 }).notNull(),
  content: text('content').notNull()
})
