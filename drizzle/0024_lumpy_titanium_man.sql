ALTER TYPE "public"."package_type" ADD VALUE 'grand';--> statement-breakpoint
ALTER TABLE "campaigns" ALTER COLUMN "start_date" SET DATA TYPE timestamp with time zone;--> statement-breakpoint
ALTER TABLE "campaigns" ALTER COLUMN "end_date" SET DATA TYPE timestamp with time zone;--> statement-breakpoint
ALTER TABLE "campaigns" ALTER COLUMN "spent_at" SET DATA TYPE timestamp with time zone;--> statement-breakpoint
ALTER TABLE "campaigns" ALTER COLUMN "created_at" SET DATA TYPE timestamp with time zone;--> statement-breakpoint
ALTER TABLE "campaigns" ALTER COLUMN "created_at" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "campaigns" ALTER COLUMN "updated_at" SET DATA TYPE timestamp with time zone;--> statement-breakpoint
ALTER TABLE "campaigns" ALTER COLUMN "updated_at" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "packages" DROP COLUMN "lga_coverage";