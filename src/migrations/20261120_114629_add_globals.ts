import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_site_settings_social_links_platform" AS ENUM('facebook', 'instagram', 'linkedin', 'youtube', 'tiktok', 'x');
  CREATE TYPE "public"."enum_site_settings_chat_provider" AS ENUM('none', 'whatsapp', 'tawk', 'crisp');
  CREATE TYPE "public"."enum_navigation_header_buttons_kind" AS ENUM('call', 'whatsapp', 'inspection', 'link');
  CREATE TABLE "site_settings_phones" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"label" varchar NOT NULL,
  	"number" varchar NOT NULL
  );
  
  CREATE TABLE "site_settings_social_links" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"platform" "enum_site_settings_social_links_platform" NOT NULL,
  	"url" varchar NOT NULL
  );
  
  CREATE TABLE "site_settings_lead_alert_recipients" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"email" varchar NOT NULL
  );
  
  CREATE TABLE "site_settings" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"company_name" varchar DEFAULT 'Malaysian Care System (MCS)' NOT NULL,
  	"whatsapp_number" varchar NOT NULL,
  	"email" varchar NOT NULL,
  	"address" varchar NOT NULL,
  	"working_hours" varchar NOT NULL,
  	"timezone" varchar DEFAULT 'Asia/Karachi' NOT NULL,
  	"chat_provider" "enum_site_settings_chat_provider" DEFAULT 'none' NOT NULL,
  	"chat_hours" varchar,
  	"retention_months" numeric DEFAULT 24,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "navigation_header_items_children" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"label" varchar NOT NULL,
  	"href" varchar NOT NULL
  );
  
  CREATE TABLE "navigation_header_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"label" varchar NOT NULL,
  	"href" varchar NOT NULL
  );
  
  CREATE TABLE "navigation_header_buttons" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"label" varchar NOT NULL,
  	"kind" "enum_navigation_header_buttons_kind" DEFAULT 'link' NOT NULL,
  	"href" varchar NOT NULL
  );
  
  CREATE TABLE "navigation_footer_columns_links" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"label" varchar NOT NULL,
  	"href" varchar NOT NULL
  );
  
  CREATE TABLE "navigation_footer_columns" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL
  );
  
  CREATE TABLE "navigation_legal_links" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"label" varchar NOT NULL,
  	"href" varchar NOT NULL
  );
  
  CREATE TABLE "navigation" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  ALTER TABLE "site_settings_phones" ADD CONSTRAINT "site_settings_phones_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."site_settings"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "site_settings_social_links" ADD CONSTRAINT "site_settings_social_links_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."site_settings"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "site_settings_lead_alert_recipients" ADD CONSTRAINT "site_settings_lead_alert_recipients_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."site_settings"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "navigation_header_items_children" ADD CONSTRAINT "navigation_header_items_children_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."navigation_header_items"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "navigation_header_items" ADD CONSTRAINT "navigation_header_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."navigation"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "navigation_header_buttons" ADD CONSTRAINT "navigation_header_buttons_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."navigation"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "navigation_footer_columns_links" ADD CONSTRAINT "navigation_footer_columns_links_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."navigation_footer_columns"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "navigation_footer_columns" ADD CONSTRAINT "navigation_footer_columns_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."navigation"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "navigation_legal_links" ADD CONSTRAINT "navigation_legal_links_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."navigation"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "site_settings_phones_order_idx" ON "site_settings_phones" USING btree ("_order");
  CREATE INDEX "site_settings_phones_parent_id_idx" ON "site_settings_phones" USING btree ("_parent_id");
  CREATE INDEX "site_settings_social_links_order_idx" ON "site_settings_social_links" USING btree ("_order");
  CREATE INDEX "site_settings_social_links_parent_id_idx" ON "site_settings_social_links" USING btree ("_parent_id");
  CREATE INDEX "site_settings_lead_alert_recipients_order_idx" ON "site_settings_lead_alert_recipients" USING btree ("_order");
  CREATE INDEX "site_settings_lead_alert_recipients_parent_id_idx" ON "site_settings_lead_alert_recipients" USING btree ("_parent_id");
  CREATE INDEX "navigation_header_items_children_order_idx" ON "navigation_header_items_children" USING btree ("_order");
  CREATE INDEX "navigation_header_items_children_parent_id_idx" ON "navigation_header_items_children" USING btree ("_parent_id");
  CREATE INDEX "navigation_header_items_order_idx" ON "navigation_header_items" USING btree ("_order");
  CREATE INDEX "navigation_header_items_parent_id_idx" ON "navigation_header_items" USING btree ("_parent_id");
  CREATE INDEX "navigation_header_buttons_order_idx" ON "navigation_header_buttons" USING btree ("_order");
  CREATE INDEX "navigation_header_buttons_parent_id_idx" ON "navigation_header_buttons" USING btree ("_parent_id");
  CREATE INDEX "navigation_footer_columns_links_order_idx" ON "navigation_footer_columns_links" USING btree ("_order");
  CREATE INDEX "navigation_footer_columns_links_parent_id_idx" ON "navigation_footer_columns_links" USING btree ("_parent_id");
  CREATE INDEX "navigation_footer_columns_order_idx" ON "navigation_footer_columns" USING btree ("_order");
  CREATE INDEX "navigation_footer_columns_parent_id_idx" ON "navigation_footer_columns" USING btree ("_parent_id");
  CREATE INDEX "navigation_legal_links_order_idx" ON "navigation_legal_links" USING btree ("_order");
  CREATE INDEX "navigation_legal_links_parent_id_idx" ON "navigation_legal_links" USING btree ("_parent_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "site_settings_phones" CASCADE;
  DROP TABLE "site_settings_social_links" CASCADE;
  DROP TABLE "site_settings_lead_alert_recipients" CASCADE;
  DROP TABLE "site_settings" CASCADE;
  DROP TABLE "navigation_header_items_children" CASCADE;
  DROP TABLE "navigation_header_items" CASCADE;
  DROP TABLE "navigation_header_buttons" CASCADE;
  DROP TABLE "navigation_footer_columns_links" CASCADE;
  DROP TABLE "navigation_footer_columns" CASCADE;
  DROP TABLE "navigation_legal_links" CASCADE;
  DROP TABLE "navigation" CASCADE;
  DROP TYPE "public"."enum_site_settings_social_links_platform";
  DROP TYPE "public"."enum_site_settings_chat_provider";
  DROP TYPE "public"."enum_navigation_header_buttons_kind";`)
}
