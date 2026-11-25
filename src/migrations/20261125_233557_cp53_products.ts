import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_products_pack_sizes_stock_status" AS ENUM('in_stock', 'low', 'out', 'preorder');
  CREATE TYPE "public"."enum_products_discount_type" AS ENUM('percent', 'fixed');
  CREATE TYPE "public"."enum_products_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__products_v_version_pack_sizes_stock_status" AS ENUM('in_stock', 'low', 'out', 'preorder');
  CREATE TYPE "public"."enum__products_v_version_discount_type" AS ENUM('percent', 'fixed');
  CREATE TYPE "public"."enum__products_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum_price_history_source" AS ENUM('admin', 'inline', 'csv');
  CREATE TABLE "products_images" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"image_id" integer
  );
  
  CREATE TABLE "products_description" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"body" varchar
  );
  
  CREATE TABLE "products_how_to_use" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"body" varchar
  );
  
  CREATE TABLE "products_safety_info" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"body" varchar
  );
  
  CREATE TABLE "products_pack_sizes" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"label" varchar,
  	"sku" varchar,
  	"rate" numeric,
  	"stock_status" "enum_products_pack_sizes_stock_status" DEFAULT 'in_stock'
  );
  
  CREATE TABLE "products" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"slug" varchar,
  	"category_id" integer,
  	"discount_type" "enum_products_discount_type" DEFAULT 'percent',
  	"discount_value" numeric,
  	"discount_starts_at" timestamp(3) with time zone,
  	"discount_ends_at" timestamp(3) with time zone,
  	"featured" boolean DEFAULT false,
  	"seo_meta_title" varchar,
  	"seo_meta_description" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"deleted_at" timestamp(3) with time zone,
  	"_status" "enum_products_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "products_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"media_id" integer
  );
  
  CREATE TABLE "_products_v_version_images" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"image_id" integer,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_products_v_version_description" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"body" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_products_v_version_how_to_use" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"body" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_products_v_version_safety_info" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"body" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_products_v_version_pack_sizes" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"label" varchar,
  	"sku" varchar,
  	"rate" numeric,
  	"stock_status" "enum__products_v_version_pack_sizes_stock_status" DEFAULT 'in_stock',
  	"_uuid" varchar
  );
  
  CREATE TABLE "_products_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_title" varchar,
  	"version_slug" varchar,
  	"version_category_id" integer,
  	"version_discount_type" "enum__products_v_version_discount_type" DEFAULT 'percent',
  	"version_discount_value" numeric,
  	"version_discount_starts_at" timestamp(3) with time zone,
  	"version_discount_ends_at" timestamp(3) with time zone,
  	"version_featured" boolean DEFAULT false,
  	"version_seo_meta_title" varchar,
  	"version_seo_meta_description" varchar,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version_deleted_at" timestamp(3) with time zone,
  	"version__status" "enum__products_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"latest" boolean
  );
  
  CREATE TABLE "_products_v_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"media_id" integer
  );
  
  CREATE TABLE "price_history" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"product_id" integer NOT NULL,
  	"pack_sku" varchar NOT NULL,
  	"old_rate" numeric,
  	"new_rate" numeric NOT NULL,
  	"old_discount" jsonb,
  	"new_discount" jsonb,
  	"changed_by_id" integer,
  	"changed_at" timestamp(3) with time zone NOT NULL,
  	"source" "enum_price_history_source" DEFAULT 'admin' NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  ALTER TABLE "services_rels" ADD COLUMN "products_id" integer;
  ALTER TABLE "_services_v_rels" ADD COLUMN "products_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "products_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "price_history_id" integer;
  ALTER TABLE "products_images" ADD CONSTRAINT "products_images_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "products_images" ADD CONSTRAINT "products_images_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "products_description" ADD CONSTRAINT "products_description_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "products_how_to_use" ADD CONSTRAINT "products_how_to_use_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "products_safety_info" ADD CONSTRAINT "products_safety_info_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "products_pack_sizes" ADD CONSTRAINT "products_pack_sizes_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "products" ADD CONSTRAINT "products_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "products_rels" ADD CONSTRAINT "products_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "products_rels" ADD CONSTRAINT "products_rels_media_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_products_v_version_images" ADD CONSTRAINT "_products_v_version_images_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_products_v_version_images" ADD CONSTRAINT "_products_v_version_images_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_products_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_products_v_version_description" ADD CONSTRAINT "_products_v_version_description_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_products_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_products_v_version_how_to_use" ADD CONSTRAINT "_products_v_version_how_to_use_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_products_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_products_v_version_safety_info" ADD CONSTRAINT "_products_v_version_safety_info_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_products_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_products_v_version_pack_sizes" ADD CONSTRAINT "_products_v_version_pack_sizes_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_products_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_products_v" ADD CONSTRAINT "_products_v_parent_id_products_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."products"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_products_v" ADD CONSTRAINT "_products_v_version_category_id_categories_id_fk" FOREIGN KEY ("version_category_id") REFERENCES "public"."categories"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_products_v_rels" ADD CONSTRAINT "_products_v_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_products_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_products_v_rels" ADD CONSTRAINT "_products_v_rels_media_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "price_history" ADD CONSTRAINT "price_history_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "price_history" ADD CONSTRAINT "price_history_changed_by_id_users_id_fk" FOREIGN KEY ("changed_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "products_images_order_idx" ON "products_images" USING btree ("_order");
  CREATE INDEX "products_images_parent_id_idx" ON "products_images" USING btree ("_parent_id");
  CREATE INDEX "products_images_image_idx" ON "products_images" USING btree ("image_id");
  CREATE INDEX "products_description_order_idx" ON "products_description" USING btree ("_order");
  CREATE INDEX "products_description_parent_id_idx" ON "products_description" USING btree ("_parent_id");
  CREATE INDEX "products_how_to_use_order_idx" ON "products_how_to_use" USING btree ("_order");
  CREATE INDEX "products_how_to_use_parent_id_idx" ON "products_how_to_use" USING btree ("_parent_id");
  CREATE INDEX "products_safety_info_order_idx" ON "products_safety_info" USING btree ("_order");
  CREATE INDEX "products_safety_info_parent_id_idx" ON "products_safety_info" USING btree ("_parent_id");
  CREATE INDEX "products_pack_sizes_order_idx" ON "products_pack_sizes" USING btree ("_order");
  CREATE INDEX "products_pack_sizes_parent_id_idx" ON "products_pack_sizes" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "products_slug_idx" ON "products" USING btree ("slug");
  CREATE INDEX "products_category_idx" ON "products" USING btree ("category_id");
  CREATE INDEX "products_updated_at_idx" ON "products" USING btree ("updated_at");
  CREATE INDEX "products_created_at_idx" ON "products" USING btree ("created_at");
  CREATE INDEX "products_deleted_at_idx" ON "products" USING btree ("deleted_at");
  CREATE INDEX "products__status_idx" ON "products" USING btree ("_status");
  CREATE INDEX "products_rels_order_idx" ON "products_rels" USING btree ("order");
  CREATE INDEX "products_rels_parent_idx" ON "products_rels" USING btree ("parent_id");
  CREATE INDEX "products_rels_path_idx" ON "products_rels" USING btree ("path");
  CREATE INDEX "products_rels_media_id_idx" ON "products_rels" USING btree ("media_id");
  CREATE INDEX "_products_v_version_images_order_idx" ON "_products_v_version_images" USING btree ("_order");
  CREATE INDEX "_products_v_version_images_parent_id_idx" ON "_products_v_version_images" USING btree ("_parent_id");
  CREATE INDEX "_products_v_version_images_image_idx" ON "_products_v_version_images" USING btree ("image_id");
  CREATE INDEX "_products_v_version_description_order_idx" ON "_products_v_version_description" USING btree ("_order");
  CREATE INDEX "_products_v_version_description_parent_id_idx" ON "_products_v_version_description" USING btree ("_parent_id");
  CREATE INDEX "_products_v_version_how_to_use_order_idx" ON "_products_v_version_how_to_use" USING btree ("_order");
  CREATE INDEX "_products_v_version_how_to_use_parent_id_idx" ON "_products_v_version_how_to_use" USING btree ("_parent_id");
  CREATE INDEX "_products_v_version_safety_info_order_idx" ON "_products_v_version_safety_info" USING btree ("_order");
  CREATE INDEX "_products_v_version_safety_info_parent_id_idx" ON "_products_v_version_safety_info" USING btree ("_parent_id");
  CREATE INDEX "_products_v_version_pack_sizes_order_idx" ON "_products_v_version_pack_sizes" USING btree ("_order");
  CREATE INDEX "_products_v_version_pack_sizes_parent_id_idx" ON "_products_v_version_pack_sizes" USING btree ("_parent_id");
  CREATE INDEX "_products_v_parent_idx" ON "_products_v" USING btree ("parent_id");
  CREATE INDEX "_products_v_version_version_slug_idx" ON "_products_v" USING btree ("version_slug");
  CREATE INDEX "_products_v_version_version_category_idx" ON "_products_v" USING btree ("version_category_id");
  CREATE INDEX "_products_v_version_version_updated_at_idx" ON "_products_v" USING btree ("version_updated_at");
  CREATE INDEX "_products_v_version_version_created_at_idx" ON "_products_v" USING btree ("version_created_at");
  CREATE INDEX "_products_v_version_version_deleted_at_idx" ON "_products_v" USING btree ("version_deleted_at");
  CREATE INDEX "_products_v_version_version__status_idx" ON "_products_v" USING btree ("version__status");
  CREATE INDEX "_products_v_created_at_idx" ON "_products_v" USING btree ("created_at");
  CREATE INDEX "_products_v_updated_at_idx" ON "_products_v" USING btree ("updated_at");
  CREATE INDEX "_products_v_latest_idx" ON "_products_v" USING btree ("latest");
  CREATE INDEX "_products_v_rels_order_idx" ON "_products_v_rels" USING btree ("order");
  CREATE INDEX "_products_v_rels_parent_idx" ON "_products_v_rels" USING btree ("parent_id");
  CREATE INDEX "_products_v_rels_path_idx" ON "_products_v_rels" USING btree ("path");
  CREATE INDEX "_products_v_rels_media_id_idx" ON "_products_v_rels" USING btree ("media_id");
  CREATE INDEX "price_history_product_idx" ON "price_history" USING btree ("product_id");
  CREATE INDEX "price_history_changed_by_idx" ON "price_history" USING btree ("changed_by_id");
  CREATE INDEX "price_history_changed_at_idx" ON "price_history" USING btree ("changed_at");
  CREATE INDEX "price_history_updated_at_idx" ON "price_history" USING btree ("updated_at");
  CREATE INDEX "price_history_created_at_idx" ON "price_history" USING btree ("created_at");
  ALTER TABLE "services_rels" ADD CONSTRAINT "services_rels_products_fk" FOREIGN KEY ("products_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_services_v_rels" ADD CONSTRAINT "_services_v_rels_products_fk" FOREIGN KEY ("products_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_products_fk" FOREIGN KEY ("products_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_price_history_fk" FOREIGN KEY ("price_history_id") REFERENCES "public"."price_history"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "services_rels_products_id_idx" ON "services_rels" USING btree ("products_id");
  CREATE INDEX "_services_v_rels_products_id_idx" ON "_services_v_rels" USING btree ("products_id");
  CREATE INDEX "payload_locked_documents_rels_products_id_idx" ON "payload_locked_documents_rels" USING btree ("products_id");
  CREATE INDEX "payload_locked_documents_rels_price_history_id_idx" ON "payload_locked_documents_rels" USING btree ("price_history_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "products_images" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "products_description" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "products_how_to_use" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "products_safety_info" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "products_pack_sizes" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "products" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "products_rels" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_products_v_version_images" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_products_v_version_description" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_products_v_version_how_to_use" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_products_v_version_safety_info" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_products_v_version_pack_sizes" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_products_v" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_products_v_rels" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "price_history" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "products_images" CASCADE;
  DROP TABLE "products_description" CASCADE;
  DROP TABLE "products_how_to_use" CASCADE;
  DROP TABLE "products_safety_info" CASCADE;
  DROP TABLE "products_pack_sizes" CASCADE;
  DROP TABLE "products" CASCADE;
  DROP TABLE "products_rels" CASCADE;
  DROP TABLE "_products_v_version_images" CASCADE;
  DROP TABLE "_products_v_version_description" CASCADE;
  DROP TABLE "_products_v_version_how_to_use" CASCADE;
  DROP TABLE "_products_v_version_safety_info" CASCADE;
  DROP TABLE "_products_v_version_pack_sizes" CASCADE;
  DROP TABLE "_products_v" CASCADE;
  DROP TABLE "_products_v_rels" CASCADE;
  DROP TABLE "price_history" CASCADE;
  ALTER TABLE "services_rels" DROP CONSTRAINT "services_rels_products_fk";
  
  ALTER TABLE "_services_v_rels" DROP CONSTRAINT "_services_v_rels_products_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_products_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_price_history_fk";
  
  DROP INDEX "services_rels_products_id_idx";
  DROP INDEX "_services_v_rels_products_id_idx";
  DROP INDEX "payload_locked_documents_rels_products_id_idx";
  DROP INDEX "payload_locked_documents_rels_price_history_id_idx";
  ALTER TABLE "services_rels" DROP COLUMN "products_id";
  ALTER TABLE "_services_v_rels" DROP COLUMN "products_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "products_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "price_history_id";
  DROP TYPE "public"."enum_products_pack_sizes_stock_status";
  DROP TYPE "public"."enum_products_discount_type";
  DROP TYPE "public"."enum_products_status";
  DROP TYPE "public"."enum__products_v_version_pack_sizes_stock_status";
  DROP TYPE "public"."enum__products_v_version_discount_type";
  DROP TYPE "public"."enum__products_v_version_status";
  DROP TYPE "public"."enum_price_history_source";`)
}
