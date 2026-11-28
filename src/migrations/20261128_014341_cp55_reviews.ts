import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_reviews_source" AS ENUM('google', 'facebook', 'direct');
  CREATE TABLE "pages_blocks_reviews" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"headline" varchar,
  	"hidden" boolean DEFAULT false,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_reviews" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"headline" varchar,
  	"hidden" boolean DEFAULT false,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "services_blocks_reviews" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"headline" varchar,
  	"hidden" boolean DEFAULT false,
  	"block_name" varchar
  );
  
  CREATE TABLE "_services_v_blocks_reviews" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"headline" varchar,
  	"hidden" boolean DEFAULT false,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "reviews" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"reviewer_name" varchar NOT NULL,
  	"city" varchar NOT NULL,
  	"text" varchar NOT NULL,
  	"rating" numeric NOT NULL,
  	"source" "enum_reviews_source" NOT NULL,
  	"source_url" varchar,
  	"review_date" timestamp(3) with time zone NOT NULL,
  	"permission_confirmed" boolean DEFAULT false,
  	"verified" boolean DEFAULT false,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"deleted_at" timestamp(3) with time zone
  );
  
  ALTER TABLE "pages_rels" ADD COLUMN "reviews_id" integer;
  ALTER TABLE "_pages_v_rels" ADD COLUMN "reviews_id" integer;
  ALTER TABLE "services_rels" ADD COLUMN "reviews_id" integer;
  ALTER TABLE "_services_v_rels" ADD COLUMN "reviews_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "reviews_id" integer;
  ALTER TABLE "pages_blocks_reviews" ADD CONSTRAINT "pages_blocks_reviews_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_reviews" ADD CONSTRAINT "_pages_v_blocks_reviews_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "services_blocks_reviews" ADD CONSTRAINT "services_blocks_reviews_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."services"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_services_v_blocks_reviews" ADD CONSTRAINT "_services_v_blocks_reviews_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_services_v"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "pages_blocks_reviews_order_idx" ON "pages_blocks_reviews" USING btree ("_order");
  CREATE INDEX "pages_blocks_reviews_parent_id_idx" ON "pages_blocks_reviews" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_reviews_path_idx" ON "pages_blocks_reviews" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_reviews_order_idx" ON "_pages_v_blocks_reviews" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_reviews_parent_id_idx" ON "_pages_v_blocks_reviews" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_reviews_path_idx" ON "_pages_v_blocks_reviews" USING btree ("_path");
  CREATE INDEX "services_blocks_reviews_order_idx" ON "services_blocks_reviews" USING btree ("_order");
  CREATE INDEX "services_blocks_reviews_parent_id_idx" ON "services_blocks_reviews" USING btree ("_parent_id");
  CREATE INDEX "services_blocks_reviews_path_idx" ON "services_blocks_reviews" USING btree ("_path");
  CREATE INDEX "_services_v_blocks_reviews_order_idx" ON "_services_v_blocks_reviews" USING btree ("_order");
  CREATE INDEX "_services_v_blocks_reviews_parent_id_idx" ON "_services_v_blocks_reviews" USING btree ("_parent_id");
  CREATE INDEX "_services_v_blocks_reviews_path_idx" ON "_services_v_blocks_reviews" USING btree ("_path");
  CREATE INDEX "reviews_verified_idx" ON "reviews" USING btree ("verified");
  CREATE INDEX "reviews_updated_at_idx" ON "reviews" USING btree ("updated_at");
  CREATE INDEX "reviews_created_at_idx" ON "reviews" USING btree ("created_at");
  CREATE INDEX "reviews_deleted_at_idx" ON "reviews" USING btree ("deleted_at");
  ALTER TABLE "pages_rels" ADD CONSTRAINT "pages_rels_reviews_fk" FOREIGN KEY ("reviews_id") REFERENCES "public"."reviews"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_rels" ADD CONSTRAINT "_pages_v_rels_reviews_fk" FOREIGN KEY ("reviews_id") REFERENCES "public"."reviews"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "services_rels" ADD CONSTRAINT "services_rels_reviews_fk" FOREIGN KEY ("reviews_id") REFERENCES "public"."reviews"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_services_v_rels" ADD CONSTRAINT "_services_v_rels_reviews_fk" FOREIGN KEY ("reviews_id") REFERENCES "public"."reviews"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_reviews_fk" FOREIGN KEY ("reviews_id") REFERENCES "public"."reviews"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "pages_rels_reviews_id_idx" ON "pages_rels" USING btree ("reviews_id");
  CREATE INDEX "_pages_v_rels_reviews_id_idx" ON "_pages_v_rels" USING btree ("reviews_id");
  CREATE INDEX "services_rels_reviews_id_idx" ON "services_rels" USING btree ("reviews_id");
  CREATE INDEX "_services_v_rels_reviews_id_idx" ON "_services_v_rels" USING btree ("reviews_id");
  CREATE INDEX "payload_locked_documents_rels_reviews_id_idx" ON "payload_locked_documents_rels" USING btree ("reviews_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "pages_blocks_reviews" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_reviews" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "services_blocks_reviews" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_services_v_blocks_reviews" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "reviews" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "pages_blocks_reviews" CASCADE;
  DROP TABLE "_pages_v_blocks_reviews" CASCADE;
  DROP TABLE "services_blocks_reviews" CASCADE;
  DROP TABLE "_services_v_blocks_reviews" CASCADE;
  DROP TABLE "reviews" CASCADE;
  ALTER TABLE "pages_rels" DROP CONSTRAINT "pages_rels_reviews_fk";
  
  ALTER TABLE "_pages_v_rels" DROP CONSTRAINT "_pages_v_rels_reviews_fk";
  
  ALTER TABLE "services_rels" DROP CONSTRAINT "services_rels_reviews_fk";
  
  ALTER TABLE "_services_v_rels" DROP CONSTRAINT "_services_v_rels_reviews_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_reviews_fk";
  
  DROP INDEX "pages_rels_reviews_id_idx";
  DROP INDEX "_pages_v_rels_reviews_id_idx";
  DROP INDEX "services_rels_reviews_id_idx";
  DROP INDEX "_services_v_rels_reviews_id_idx";
  DROP INDEX "payload_locked_documents_rels_reviews_id_idx";
  ALTER TABLE "pages_rels" DROP COLUMN "reviews_id";
  ALTER TABLE "_pages_v_rels" DROP COLUMN "reviews_id";
  ALTER TABLE "services_rels" DROP COLUMN "reviews_id";
  ALTER TABLE "_services_v_rels" DROP COLUMN "reviews_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "reviews_id";
  DROP TYPE "public"."enum_reviews_source";`)
}
