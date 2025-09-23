DROP TABLE "invitation" CASCADE;--> statement-breakpoint
DROP TABLE "member" CASCADE;--> statement-breakpoint
DROP TABLE "organization" CASCADE;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "role" text DEFAULT 'user' NOT NULL;--> statement-breakpoint
ALTER TABLE "session" DROP COLUMN "active_organization_id";