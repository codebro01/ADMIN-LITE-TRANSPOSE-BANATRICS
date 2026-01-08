ALTER TABLE "earnings" ALTER COLUMN "payment_status" SET DEFAULT 'pending';--> statement-breakpoint
ALTER TABLE "weekly_proofs" ADD COLUMN "week_number" integer;--> statement-breakpoint
ALTER TABLE "weekly_proofs" ADD COLUMN "year" integer;--> statement-breakpoint
ALTER TABLE "packages" ADD COLUMN "description" text;