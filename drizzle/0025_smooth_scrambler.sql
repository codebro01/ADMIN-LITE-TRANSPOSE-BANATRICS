ALTER TABLE "campaigns" ALTER COLUMN "payment_status" SET DATA TYPE boolean;--> statement-breakpoint
ALTER TABLE "campaigns" ALTER COLUMN "payment_status" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "refreshToken" SET DATA TYPE varchar;--> statement-breakpoint
ALTER TABLE "businessOwners" ADD COLUMN "totalSpent" double precision DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "weekly_proofs" DROP COLUMN "frontview";--> statement-breakpoint
ALTER TABLE "weekly_proofs" DROP COLUMN "sideview";