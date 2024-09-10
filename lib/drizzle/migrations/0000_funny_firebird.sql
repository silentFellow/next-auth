CREATE TABLE IF NOT EXISTS "blogs" (
	"id" varchar(255) NOT NULL,
	"tags" varchar(12)[],
	"title" varchar(30) NOT NULL,
	"content" text NOT NULL,
	CONSTRAINT "blogs_id_unique" UNIQUE("id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "tags" (
	"name" varchar(12) PRIMARY KEY NOT NULL,
	CONSTRAINT "tags_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "users" (
	"id" varchar(255) NOT NULL,
	"name" varchar(255) NOT NULL,
	"password" varchar(255),
	"role" varchar(255) NOT NULL,
	CONSTRAINT "users_id_unique" UNIQUE("id"),
	CONSTRAINT "users_name_unique" UNIQUE("name")
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "blogs" ADD CONSTRAINT "blogs_id_users_id_fk" FOREIGN KEY ("id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
