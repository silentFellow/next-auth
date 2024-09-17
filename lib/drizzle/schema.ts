import { pgTable, uuid, varchar, text, timestamp } from "drizzle-orm/pg-core";

// users seciton
export const users = pgTable('users', {
  id: uuid("id").primaryKey().defaultRandom(),
  username: varchar('name', { length: 255 }).notNull().unique(),
  password: varchar('password', { length: 255 }),
  role: varchar('role', { length: 255 }).notNull(),
});

// blogs section
export const blogs = pgTable("blogs", {
  id: uuid("id").primaryKey().defaultRandom(),
  tags: uuid('tags').references(() => tags.id, { onDelete: 'cascade' }).array(),
  author: uuid("author").notNull().references(() => users.id, { onDelete: "cascade" }),
  title: varchar('title', { length: 30 }).notNull(),
  content: text('content').notNull(),
  thumbnail: text('thumbnail'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow()
});

// tag section
export const tags = pgTable('tags', {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar('name', { length: 12 }).notNull().unique()
});
