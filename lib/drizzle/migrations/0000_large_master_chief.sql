CREATE TABLE IF NOT EXISTS "users" (
	"id" varchar(255) NOT NULL,
	"name" varchar(255) NOT NULL,
	"password" varchar(255),
	"role" varchar(255) NOT NULL,
	CONSTRAINT "users_id_unique" UNIQUE("id"),
	CONSTRAINT "users_name_unique" UNIQUE("name")
);
