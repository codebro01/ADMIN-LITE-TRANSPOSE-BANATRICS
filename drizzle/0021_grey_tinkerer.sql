CREATE TABLE "invoices" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"campaignId" uuid,
	"userId" uuid,
	"status" varchar(100) DEFAULT 'pending',
	"amount" double precision NOT NULL,
	"due_date" timestamp DEFAULT now() NOT NULL,
	"invoice_id" varchar(50) NOT NULL,
	"date" timestamp DEFAULT now() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "businessOwners" ALTER COLUMN "business_owner_status" SET DATA TYPE varchar(50);--> statement-breakpoint
ALTER TABLE "businessOwners" ALTER COLUMN "business_owner_status" SET DEFAULT 'approved';--> statement-breakpoint
ALTER TABLE "drivers" ALTER COLUMN "approved_status" SET DATA TYPE varchar(20);--> statement-breakpoint
ALTER TABLE "drivers" ALTER COLUMN "approved_status" SET DEFAULT 'pending';--> statement-breakpoint
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_campaignId_campaigns_id_fk" FOREIGN KEY ("campaignId") REFERENCES "public"."campaigns"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_userId_drivers_userId_fk" FOREIGN KEY ("userId") REFERENCES "public"."drivers"("userId") ON DELETE cascade ON UPDATE no action;