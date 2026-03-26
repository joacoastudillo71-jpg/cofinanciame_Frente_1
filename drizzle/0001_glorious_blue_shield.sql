ALTER TABLE "projects" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "assets" ADD COLUMN "label" varchar(255);--> statement-breakpoint
ALTER TABLE "units" ADD COLUMN "label" varchar(255);--> statement-breakpoint
ALTER TABLE "units" ADD COLUMN "type" varchar(50);--> statement-breakpoint
ALTER TABLE "units" ADD COLUMN "bedrooms" integer;--> statement-breakpoint
ALTER TABLE "units" ADD COLUMN "habitable_area" real;--> statement-breakpoint
ALTER TABLE "units" ADD COLUMN "terrace_area" real;--> statement-breakpoint
ALTER TABLE "units" ADD COLUMN "parking_count" integer;--> statement-breakpoint
ALTER TABLE "units" ADD COLUMN "parking_area" real;--> statement-breakpoint
CREATE INDEX "asset_project_id_idx" ON "assets" USING btree ("project_id");--> statement-breakpoint
CREATE INDEX "unit_project_id_idx" ON "units" USING btree ("project_id");--> statement-breakpoint
CREATE POLICY "tenant_isolation" ON "projects" AS PERMISSIVE FOR ALL TO public USING (((SELECT auth.uid()) = tenant_id));