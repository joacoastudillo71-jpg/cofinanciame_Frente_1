ALTER TABLE "units" ALTER COLUMN "type" SET DEFAULT 'commercial';--> statement-breakpoint
ALTER TABLE "units" ALTER COLUMN "area" SET DATA TYPE real;--> statement-breakpoint
ALTER TABLE "units" ALTER COLUMN "bathrooms" SET DATA TYPE real;--> statement-breakpoint
ALTER TABLE "units" ALTER COLUMN "price" SET DATA TYPE real;--> statement-breakpoint
ALTER TABLE "projects" ADD COLUMN "is_preview" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "projects" ADD COLUMN "preview_metadata" jsonb;--> statement-breakpoint
ALTER TABLE "units" ADD COLUMN "storage_count" integer;--> statement-breakpoint
ALTER TABLE "units" ADD COLUMN "storage_area" real;--> statement-breakpoint
ALTER TABLE "units" ADD COLUMN "is_duplex" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "units" ADD COLUMN "duplex_level" varchar(20);