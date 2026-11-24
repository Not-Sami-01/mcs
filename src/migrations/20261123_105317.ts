import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TABLE "users_totp_backup_codes" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"hash" varchar,
  	"used" boolean DEFAULT false
  );
  
  CREATE TABLE "payload_totp_rate_limits" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"user_key" varchar NOT NULL,
  	"failures" numeric DEFAULT 0 NOT NULL,
  	"window_start" timestamp(3) with time zone NOT NULL,
  	"locked_until" timestamp(3) with time zone,
  	"version" numeric DEFAULT 0 NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  ALTER TABLE "users" ADD COLUMN "totp_enabled" boolean DEFAULT false;
  ALTER TABLE "users" ADD COLUMN "totp_secret" varchar;
  ALTER TABLE "users" ADD COLUMN "totp_last_counter" numeric;
  ALTER TABLE "users_totp_backup_codes" ADD CONSTRAINT "users_totp_backup_codes_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "users_totp_backup_codes_order_idx" ON "users_totp_backup_codes" USING btree ("_order");
  CREATE INDEX "users_totp_backup_codes_parent_id_idx" ON "users_totp_backup_codes" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "payload_totp_rate_limits_user_key_idx" ON "payload_totp_rate_limits" USING btree ("user_key");
  CREATE INDEX "payload_totp_rate_limits_updated_at_idx" ON "payload_totp_rate_limits" USING btree ("updated_at");
  CREATE INDEX "payload_totp_rate_limits_created_at_idx" ON "payload_totp_rate_limits" USING btree ("created_at");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "users_totp_backup_codes" CASCADE;
  DROP TABLE "payload_totp_rate_limits" CASCADE;
  ALTER TABLE "users" DROP COLUMN "totp_enabled";
  ALTER TABLE "users" DROP COLUMN "totp_secret";
  ALTER TABLE "users" DROP COLUMN "totp_last_counter";`)
}
