ALTER TABLE "assets" ADD COLUMN "geo_lat" double precision;--> statement-breakpoint
ALTER TABLE "assets" ADD COLUMN "geo_lng" double precision;--> statement-breakpoint
ALTER TABLE "assets" ADD COLUMN "geo_alt" double precision DEFAULT 0;--> statement-breakpoint
ALTER TABLE "assets" ADD COLUMN "geo_rotation" double precision DEFAULT 0;--> statement-breakpoint
ALTER TABLE "assets" ADD COLUMN "geo_scale" double precision DEFAULT 1;