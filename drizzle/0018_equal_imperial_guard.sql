CREATE TYPE "public"."design_approval_status_type" AS ENUM('pending', 'approved', 'rejected');--> statement-breakpoint
CREATE TYPE "public"."campaign_status_type" AS ENUM('draft', 'pending', 'approved', 'completed', 'rejected');--> statement-breakpoint
CREATE TYPE "public"."weekly_proof_status" AS ENUM('approved', 'pending_review', 'rejected', 'flagged');--> statement-breakpoint
CREATE TABLE "campaign_designs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"campaignId" uuid NOT NULL,
	"designs" jsonb NOT NULL,
	"approval_status" "design_approval_status_type" DEFAULT 'pending',
	"comment" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "campaigns" ALTER COLUMN "status_type" SET DATA TYPE "public"."campaign_status_type" USING "status_type"::text::"public"."campaign_status_type";--> statement-breakpoint
ALTER TABLE "weekly_proofs" ALTER COLUMN "weekly_proof_status" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "weekly_proofs" ALTER COLUMN "weekly_proof_status" SET DATA TYPE "public"."weekly_proof_status" USING "weekly_proof_status"::text::"public"."weekly_proof_status";--> statement-breakpoint
ALTER TABLE "weekly_proofs" ALTER COLUMN "weekly_proof_status" SET DEFAULT 'pending_review';--> statement-breakpoint
ALTER TABLE "weekly_proofs" ALTER COLUMN "weekly_proof_status" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "campaigns" ADD COLUMN "active" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "campaigns" ADD COLUMN "print_house_phone_no" varchar(20);--> statement-breakpoint
ALTER TABLE "businessOwners" ADD COLUMN "business_owner_status" boolean DEFAULT true;--> statement-breakpoint
ALTER TABLE "campaign_designs" ADD CONSTRAINT "campaign_designs_campaignId_campaigns_id_fk" FOREIGN KEY ("campaignId") REFERENCES "public"."campaigns"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
DROP TYPE "public"."status_type";--> statement-breakpoint
DROP TYPE "public"."earning_payment_status_type";--> statement-breakpoint
DROP TYPE "public"."weekly_proof_status_type";