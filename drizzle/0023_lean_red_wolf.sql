ALTER TABLE "drivers" ALTER COLUMN "approved_status" SET DEFAULT 'pending';--> statement-breakpoint
ALTER TABLE "drivers" ADD COLUMN "active_status" varchar DEFAULT 'activated' NOT NULL;