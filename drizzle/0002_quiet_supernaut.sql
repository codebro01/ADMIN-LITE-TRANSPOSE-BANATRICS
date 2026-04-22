ALTER TABLE "driver_campaigns" ALTER COLUMN "rejection_reason" SET DEFAULT 'poor design';--> statement-breakpoint
ALTER TABLE "driver_campaigns" ALTER COLUMN "rejection_reason" SET NOT NULL;