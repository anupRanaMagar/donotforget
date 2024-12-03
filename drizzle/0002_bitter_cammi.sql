ALTER TABLE "todos" DROP CONSTRAINT "todos_column_id_columns_id_fk";
--> statement-breakpoint
ALTER TABLE "columns" ALTER COLUMN "title" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "todos" ALTER COLUMN "due_date" SET DATA TYPE timestamp;--> statement-breakpoint
ALTER TABLE "columns" ADD COLUMN "created_at" timestamp DEFAULT now();--> statement-breakpoint
ALTER TABLE "columns" ADD COLUMN "order" integer DEFAULT 0;--> statement-breakpoint
ALTER TABLE "todos" ADD COLUMN "created_at" timestamp DEFAULT now();--> statement-breakpoint
ALTER TABLE "todos" ADD COLUMN "order" integer DEFAULT 0;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "todos" ADD CONSTRAINT "todos_column_id_columns_id_fk" FOREIGN KEY ("column_id") REFERENCES "public"."columns"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
