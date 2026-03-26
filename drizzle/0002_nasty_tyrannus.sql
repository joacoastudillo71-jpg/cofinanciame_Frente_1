ALTER TABLE "assets" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "units" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE POLICY "tenant_isolation_assets" ON "assets" AS PERMISSIVE FOR ALL TO public USING (EXISTS (SELECT 1 FROM projects WHERE projects.id = project_id AND projects.tenant_id = (SELECT auth.uid())));--> statement-breakpoint
CREATE POLICY "tenant_isolation_units" ON "units" AS PERMISSIVE FOR ALL TO public USING (EXISTS (SELECT 1 FROM projects WHERE projects.id = project_id AND projects.tenant_id = (SELECT auth.uid())));