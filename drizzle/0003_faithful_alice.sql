ALTER TABLE "todos" DROP CONSTRAINT "todos_column_id_columns_id_fk";
--> statement-breakpoint
ALTER TABLE "todos" ALTER COLUMN "due_date" SET DATA TYPE date;--> statement-breakpoint
ALTER TABLE "columns" ADD COLUMN "todos" integer;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "columns" ADD CONSTRAINT "columns_todos_todos_id_fk" FOREIGN KEY ("todos") REFERENCES "public"."todos"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
ALTER TABLE "todos" DROP COLUMN IF EXISTS "column_id";