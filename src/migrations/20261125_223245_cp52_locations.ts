import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_locations_type" AS ENUM('city', 'area');
  CREATE TYPE "public"."enum_locations_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__locations_v_version_type" AS ENUM('city', 'area');
  CREATE TYPE "public"."enum__locations_v_version_status" AS ENUM('draft', 'published');
  CREATE TABLE "services_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"locations_id" integer
  );
  
  CREATE TABLE "_services_v_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"locations_id" integer
  );
  
  CREATE TABLE "locations_neighbourhoods" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"name" varchar
  );
  
  CREATE TABLE "locations_common_pests" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"pest" varchar
  );
  
  CREATE TABLE "locations_faqs" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"question" varchar,
  	"answer" varchar
  );
  
  CREATE TABLE "locations" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar,
  	"slug" varchar,
  	"type" "enum_locations_type" DEFAULT 'city',
  	"parent_id" integer,
  	"intro" varchar,
  	"local_notes" varchar,
  	"similarity_warning" varchar,
  	"geo_latitude" numeric,
  	"geo_longitude" numeric,
  	"seo_meta_title" varchar,
  	"seo_meta_description" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"deleted_at" timestamp(3) with time zone,
  	"_status" "enum_locations_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "locations_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"services_id" integer,
  	"locations_id" integer
  );
  
  CREATE TABLE "_locations_v_version_neighbourhoods" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_locations_v_version_common_pests" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"pest" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_locations_v_version_faqs" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"question" varchar,
  	"answer" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_locations_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_name" varchar,
  	"version_slug" varchar,
  	"version_type" "enum__locations_v_version_type" DEFAULT 'city',
  	"version_parent_id" integer,
  	"version_intro" varchar,
  	"version_local_notes" varchar,
  	"version_similarity_warning" varchar,
  	"version_geo_latitude" numeric,
  	"version_geo_longitude" numeric,
  	"version_seo_meta_title" varchar,
  	"version_seo_meta_description" varchar,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version_deleted_at" timestamp(3) with time zone,
  	"version__status" "enum__locations_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"latest" boolean
  );
  
  CREATE TABLE "_locations_v_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"services_id" integer,
  	"locations_id" integer
  );
  
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "locations_id" integer;
  ALTER TABLE "services_rels" ADD CONSTRAINT "services_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."services"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "services_rels" ADD CONSTRAINT "services_rels_locations_fk" FOREIGN KEY ("locations_id") REFERENCES "public"."locations"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_services_v_rels" ADD CONSTRAINT "_services_v_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_services_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_services_v_rels" ADD CONSTRAINT "_services_v_rels_locations_fk" FOREIGN KEY ("locations_id") REFERENCES "public"."locations"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "locations_neighbourhoods" ADD CONSTRAINT "locations_neighbourhoods_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."locations"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "locations_common_pests" ADD CONSTRAINT "locations_common_pests_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."locations"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "locations_faqs" ADD CONSTRAINT "locations_faqs_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."locations"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "locations" ADD CONSTRAINT "locations_parent_id_locations_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."locations"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "locations_rels" ADD CONSTRAINT "locations_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."locations"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "locations_rels" ADD CONSTRAINT "locations_rels_services_fk" FOREIGN KEY ("services_id") REFERENCES "public"."services"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "locations_rels" ADD CONSTRAINT "locations_rels_locations_fk" FOREIGN KEY ("locations_id") REFERENCES "public"."locations"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_locations_v_version_neighbourhoods" ADD CONSTRAINT "_locations_v_version_neighbourhoods_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_locations_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_locations_v_version_common_pests" ADD CONSTRAINT "_locations_v_version_common_pests_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_locations_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_locations_v_version_faqs" ADD CONSTRAINT "_locations_v_version_faqs_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_locations_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_locations_v" ADD CONSTRAINT "_locations_v_parent_id_locations_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."locations"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_locations_v" ADD CONSTRAINT "_locations_v_version_parent_id_locations_id_fk" FOREIGN KEY ("version_parent_id") REFERENCES "public"."locations"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_locations_v_rels" ADD CONSTRAINT "_locations_v_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_locations_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_locations_v_rels" ADD CONSTRAINT "_locations_v_rels_services_fk" FOREIGN KEY ("services_id") REFERENCES "public"."services"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_locations_v_rels" ADD CONSTRAINT "_locations_v_rels_locations_fk" FOREIGN KEY ("locations_id") REFERENCES "public"."locations"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "services_rels_order_idx" ON "services_rels" USING btree ("order");
  CREATE INDEX "services_rels_parent_idx" ON "services_rels" USING btree ("parent_id");
  CREATE INDEX "services_rels_path_idx" ON "services_rels" USING btree ("path");
  CREATE INDEX "services_rels_locations_id_idx" ON "services_rels" USING btree ("locations_id");
  CREATE INDEX "_services_v_rels_order_idx" ON "_services_v_rels" USING btree ("order");
  CREATE INDEX "_services_v_rels_parent_idx" ON "_services_v_rels" USING btree ("parent_id");
  CREATE INDEX "_services_v_rels_path_idx" ON "_services_v_rels" USING btree ("path");
  CREATE INDEX "_services_v_rels_locations_id_idx" ON "_services_v_rels" USING btree ("locations_id");
  CREATE INDEX "locations_neighbourhoods_order_idx" ON "locations_neighbourhoods" USING btree ("_order");
  CREATE INDEX "locations_neighbourhoods_parent_id_idx" ON "locations_neighbourhoods" USING btree ("_parent_id");
  CREATE INDEX "locations_common_pests_order_idx" ON "locations_common_pests" USING btree ("_order");
  CREATE INDEX "locations_common_pests_parent_id_idx" ON "locations_common_pests" USING btree ("_parent_id");
  CREATE INDEX "locations_faqs_order_idx" ON "locations_faqs" USING btree ("_order");
  CREATE INDEX "locations_faqs_parent_id_idx" ON "locations_faqs" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "locations_slug_idx" ON "locations" USING btree ("slug");
  CREATE INDEX "locations_parent_idx" ON "locations" USING btree ("parent_id");
  CREATE INDEX "locations_updated_at_idx" ON "locations" USING btree ("updated_at");
  CREATE INDEX "locations_created_at_idx" ON "locations" USING btree ("created_at");
  CREATE INDEX "locations_deleted_at_idx" ON "locations" USING btree ("deleted_at");
  CREATE INDEX "locations__status_idx" ON "locations" USING btree ("_status");
  CREATE INDEX "locations_rels_order_idx" ON "locations_rels" USING btree ("order");
  CREATE INDEX "locations_rels_parent_idx" ON "locations_rels" USING btree ("parent_id");
  CREATE INDEX "locations_rels_path_idx" ON "locations_rels" USING btree ("path");
  CREATE INDEX "locations_rels_services_id_idx" ON "locations_rels" USING btree ("services_id");
  CREATE INDEX "locations_rels_locations_id_idx" ON "locations_rels" USING btree ("locations_id");
  CREATE INDEX "_locations_v_version_neighbourhoods_order_idx" ON "_locations_v_version_neighbourhoods" USING btree ("_order");
  CREATE INDEX "_locations_v_version_neighbourhoods_parent_id_idx" ON "_locations_v_version_neighbourhoods" USING btree ("_parent_id");
  CREATE INDEX "_locations_v_version_common_pests_order_idx" ON "_locations_v_version_common_pests" USING btree ("_order");
  CREATE INDEX "_locations_v_version_common_pests_parent_id_idx" ON "_locations_v_version_common_pests" USING btree ("_parent_id");
  CREATE INDEX "_locations_v_version_faqs_order_idx" ON "_locations_v_version_faqs" USING btree ("_order");
  CREATE INDEX "_locations_v_version_faqs_parent_id_idx" ON "_locations_v_version_faqs" USING btree ("_parent_id");
  CREATE INDEX "_locations_v_parent_idx" ON "_locations_v" USING btree ("parent_id");
  CREATE INDEX "_locations_v_version_version_slug_idx" ON "_locations_v" USING btree ("version_slug");
  CREATE INDEX "_locations_v_version_version_parent_idx" ON "_locations_v" USING btree ("version_parent_id");
  CREATE INDEX "_locations_v_version_version_updated_at_idx" ON "_locations_v" USING btree ("version_updated_at");
  CREATE INDEX "_locations_v_version_version_created_at_idx" ON "_locations_v" USING btree ("version_created_at");
  CREATE INDEX "_locations_v_version_version_deleted_at_idx" ON "_locations_v" USING btree ("version_deleted_at");
  CREATE INDEX "_locations_v_version_version__status_idx" ON "_locations_v" USING btree ("version__status");
  CREATE INDEX "_locations_v_created_at_idx" ON "_locations_v" USING btree ("created_at");
  CREATE INDEX "_locations_v_updated_at_idx" ON "_locations_v" USING btree ("updated_at");
  CREATE INDEX "_locations_v_latest_idx" ON "_locations_v" USING btree ("latest");
  CREATE INDEX "_locations_v_rels_order_idx" ON "_locations_v_rels" USING btree ("order");
  CREATE INDEX "_locations_v_rels_parent_idx" ON "_locations_v_rels" USING btree ("parent_id");
  CREATE INDEX "_locations_v_rels_path_idx" ON "_locations_v_rels" USING btree ("path");
  CREATE INDEX "_locations_v_rels_services_id_idx" ON "_locations_v_rels" USING btree ("services_id");
  CREATE INDEX "_locations_v_rels_locations_id_idx" ON "_locations_v_rels" USING btree ("locations_id");
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_locations_fk" FOREIGN KEY ("locations_id") REFERENCES "public"."locations"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "payload_locked_documents_rels_locations_id_idx" ON "payload_locked_documents_rels" USING btree ("locations_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "services_rels" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_services_v_rels" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "locations_neighbourhoods" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "locations_common_pests" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "locations_faqs" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "locations" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "locations_rels" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_locations_v_version_neighbourhoods" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_locations_v_version_common_pests" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_locations_v_version_faqs" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_locations_v" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_locations_v_rels" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "services_rels" CASCADE;
  DROP TABLE "_services_v_rels" CASCADE;
  DROP TABLE "locations_neighbourhoods" CASCADE;
  DROP TABLE "locations_common_pests" CASCADE;
  DROP TABLE "locations_faqs" CASCADE;
  DROP TABLE "locations" CASCADE;
  DROP TABLE "locations_rels" CASCADE;
  DROP TABLE "_locations_v_version_neighbourhoods" CASCADE;
  DROP TABLE "_locations_v_version_common_pests" CASCADE;
  DROP TABLE "_locations_v_version_faqs" CASCADE;
  DROP TABLE "_locations_v" CASCADE;
  DROP TABLE "_locations_v_rels" CASCADE;
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_locations_fk";
  
  DROP INDEX "payload_locked_documents_rels_locations_id_idx";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "locations_id";
  DROP TYPE "public"."enum_locations_type";
  DROP TYPE "public"."enum_locations_status";
  DROP TYPE "public"."enum__locations_v_version_type";
  DROP TYPE "public"."enum__locations_v_version_status";`)
}
