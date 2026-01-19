ALTER TABLE "businessOwners" ALTER COLUMN "business_owner_status" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "drivers" ALTER COLUMN "approved_status" SET DEFAULT 'approved';