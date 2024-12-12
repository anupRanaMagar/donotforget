ALTER TABLE "columns" DROP CONSTRAINT "columns_todos_todos_id_fk";
--> statement-breakpoint
ALTER TABLE "todos" ADD COLUMN "column_id" integer;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "todos" ADD CONSTRAINT "todos_column_id_columns_id_fk" FOREIGN KEY ("column_id") REFERENCES "public"."columns"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
ALTER TABLE "columns" DROP COLUMN IF EXISTS "todos";