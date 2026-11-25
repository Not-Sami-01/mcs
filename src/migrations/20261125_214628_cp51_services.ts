import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_pages_blocks_services_grid_mode" AS ENUM('auto', 'manual');
  CREATE TYPE "public"."enum__pages_v_blocks_services_grid_mode" AS ENUM('auto', 'manual');
  CREATE TYPE "public"."enum_services_blocks_warranty_promise_link_kind" AS ENUM('call', 'whatsapp', 'inspection', 'link');
  CREATE TYPE "public"."enum_services_blocks_who_we_serve_items_link_kind" AS ENUM('call', 'whatsapp', 'inspection', 'link');
  CREATE TYPE "public"."enum_services_blocks_cta_buttons_kind" AS ENUM('call', 'whatsapp', 'inspection', 'link');
  CREATE TYPE "public"."enum_services_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__services_v_blocks_warranty_promise_link_kind" AS ENUM('call', 'whatsapp', 'inspection', 'link');
  CREATE TYPE "public"."enum__services_v_blocks_who_we_serve_items_link_kind" AS ENUM('call', 'whatsapp', 'inspection', 'link');
  CREATE TYPE "public"."enum__services_v_blocks_cta_buttons_kind" AS ENUM('call', 'whatsapp', 'inspection', 'link');
  CREATE TYPE "public"."enum__services_v_version_status" AS ENUM('draft', 'published');
  CREATE TABLE "pages_blocks_services_grid" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"headline" varchar,
  	"intro" varchar,
  	"mode" "enum_pages_blocks_services_grid_mode" DEFAULT 'auto',
  	"hidden" boolean DEFAULT false,
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"services_id" integer
  );
  
  CREATE TABLE "_pages_v_blocks_services_grid" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"headline" varchar,
  	"intro" varchar,
  	"mode" "enum__pages_v_blocks_services_grid_mode" DEFAULT 'auto',
  	"hidden" boolean DEFAULT false,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"services_id" integer
  );
  
  CREATE TABLE "services_signs" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"sign" varchar
  );
  
  CREATE TABLE "services_treatment_steps" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"body" varchar
  );
  
  CREATE TABLE "services_faqs" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"question" varchar,
  	"answer" varchar
  );
  
  CREATE TABLE "services_blocks_trust_strip_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"stat_value" varchar,
  	"stat_label" varchar,
  	"proof_note" varchar
  );
  
  CREATE TABLE "services_blocks_trust_strip" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"hidden" boolean DEFAULT false,
  	"block_name" varchar
  );
  
  CREATE TABLE "services_blocks_why_choose_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"icon" varchar,
  	"card_title" varchar,
  	"card_body" varchar
  );
  
  CREATE TABLE "services_blocks_why_choose" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"headline" varchar,
  	"hidden" boolean DEFAULT false,
  	"block_name" varchar
  );
  
  CREATE TABLE "services_blocks_our_difference_points" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"point" varchar
  );
  
  CREATE TABLE "services_blocks_our_difference" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"headline" varchar,
  	"short_paragraph" varchar,
  	"proof_note" varchar,
  	"hidden" boolean DEFAULT false,
  	"block_name" varchar
  );
  
  CREATE TABLE "services_blocks_how_it_works_steps" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"card_title" varchar,
  	"card_body" varchar
  );
  
  CREATE TABLE "services_blocks_how_it_works" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"headline" varchar,
  	"hidden" boolean DEFAULT false,
  	"block_name" varchar
  );
  
  CREATE TABLE "services_blocks_warranty_promise_highlights" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"highlight" varchar
  );
  
  CREATE TABLE "services_blocks_warranty_promise" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"headline" varchar,
  	"short_paragraph" varchar,
  	"link_label" varchar,
  	"link_kind" "enum_services_blocks_warranty_promise_link_kind" DEFAULT 'link',
  	"link_href" varchar,
  	"hidden" boolean DEFAULT false,
  	"block_name" varchar
  );
  
  CREATE TABLE "services_blocks_who_we_serve_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"card_body" varchar,
  	"link_label" varchar,
  	"link_kind" "enum_services_blocks_who_we_serve_items_link_kind" DEFAULT 'link',
  	"link_href" varchar
  );
  
  CREATE TABLE "services_blocks_who_we_serve" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"headline" varchar,
  	"hidden" boolean DEFAULT false,
  	"block_name" varchar
  );
  
  CREATE TABLE "services_blocks_before_after_pairs" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"before_id" integer,
  	"after_id" integer,
  	"caption" varchar,
  	"area" varchar,
  	"consent_confirmed" boolean DEFAULT false
  );
  
  CREATE TABLE "services_blocks_before_after" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"headline" varchar,
  	"hidden" boolean DEFAULT false,
  	"block_name" varchar
  );
  
  CREATE TABLE "services_blocks_certificates_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"image_id" integer,
  	"title" varchar,
  	"issuer" varchar
  );
  
  CREATE TABLE "services_blocks_certificates" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"headline" varchar,
  	"hidden" boolean DEFAULT false,
  	"block_name" varchar
  );
  
  CREATE TABLE "services_blocks_inspection_form" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"headline" varchar,
  	"short_paragraph" varchar,
  	"hidden" boolean DEFAULT false,
  	"block_name" varchar
  );
  
  CREATE TABLE "services_blocks_faq_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"question" varchar,
  	"answer" varchar
  );
  
  CREATE TABLE "services_blocks_faq" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"headline" varchar,
  	"hidden" boolean DEFAULT false,
  	"block_name" varchar
  );
  
  CREATE TABLE "services_blocks_cta_buttons" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"label" varchar,
  	"kind" "enum_services_blocks_cta_buttons_kind" DEFAULT 'link',
  	"href" varchar
  );
  
  CREATE TABLE "services_blocks_cta" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"headline" varchar,
  	"card_body" varchar,
  	"hidden" boolean DEFAULT false,
  	"block_name" varchar
  );
  
  CREATE TABLE "services_blocks_text_blocks_paragraphs" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"paragraph" varchar
  );
  
  CREATE TABLE "services_blocks_text_blocks" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"headline" varchar,
  	"hidden" boolean DEFAULT false,
  	"block_name" varchar
  );
  
  CREATE TABLE "services_blocks_contact_details" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"headline" varchar,
  	"hidden" boolean DEFAULT false,
  	"block_name" varchar
  );
  
  CREATE TABLE "services" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"slug" varchar,
  	"category_id" integer,
  	"icon" varchar,
  	"short_description" varchar,
  	"hero_image_id" integer,
  	"starting_price" numeric,
  	"price_unit" varchar,
  	"seo_meta_title" varchar,
  	"seo_meta_description" varchar,
  	"order" numeric DEFAULT 0,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"deleted_at" timestamp(3) with time zone,
  	"_status" "enum_services_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "_services_v_version_signs" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"sign" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_services_v_version_treatment_steps" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"body" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_services_v_version_faqs" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"question" varchar,
  	"answer" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_services_v_blocks_trust_strip_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"stat_value" varchar,
  	"stat_label" varchar,
  	"proof_note" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_services_v_blocks_trust_strip" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"hidden" boolean DEFAULT false,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_services_v_blocks_why_choose_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"icon" varchar,
  	"card_title" varchar,
  	"card_body" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_services_v_blocks_why_choose" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"headline" varchar,
  	"hidden" boolean DEFAULT false,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_services_v_blocks_our_difference_points" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"point" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_services_v_blocks_our_difference" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"headline" varchar,
  	"short_paragraph" varchar,
  	"proof_note" varchar,
  	"hidden" boolean DEFAULT false,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_services_v_blocks_how_it_works_steps" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"card_title" varchar,
  	"card_body" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_services_v_blocks_how_it_works" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"headline" varchar,
  	"hidden" boolean DEFAULT false,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_services_v_blocks_warranty_promise_highlights" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"highlight" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_services_v_blocks_warranty_promise" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"headline" varchar,
  	"short_paragraph" varchar,
  	"link_label" varchar,
  	"link_kind" "enum__services_v_blocks_warranty_promise_link_kind" DEFAULT 'link',
  	"link_href" varchar,
  	"hidden" boolean DEFAULT false,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_services_v_blocks_who_we_serve_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"card_body" varchar,
  	"link_label" varchar,
  	"link_kind" "enum__services_v_blocks_who_we_serve_items_link_kind" DEFAULT 'link',
  	"link_href" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_services_v_blocks_who_we_serve" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"headline" varchar,
  	"hidden" boolean DEFAULT false,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_services_v_blocks_before_after_pairs" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"before_id" integer,
  	"after_id" integer,
  	"caption" varchar,
  	"area" varchar,
  	"consent_confirmed" boolean DEFAULT false,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_services_v_blocks_before_after" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"headline" varchar,
  	"hidden" boolean DEFAULT false,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_services_v_blocks_certificates_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"image_id" integer,
  	"title" varchar,
  	"issuer" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_services_v_blocks_certificates" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"headline" varchar,
  	"hidden" boolean DEFAULT false,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_services_v_blocks_inspection_form" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"headline" varchar,
  	"short_paragraph" varchar,
  	"hidden" boolean DEFAULT false,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_services_v_blocks_faq_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"question" varchar,
  	"answer" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_services_v_blocks_faq" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"headline" varchar,
  	"hidden" boolean DEFAULT false,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_services_v_blocks_cta_buttons" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"label" varchar,
  	"kind" "enum__services_v_blocks_cta_buttons_kind" DEFAULT 'link',
  	"href" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_services_v_blocks_cta" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"headline" varchar,
  	"card_body" varchar,
  	"hidden" boolean DEFAULT false,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_services_v_blocks_text_blocks_paragraphs" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"paragraph" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_services_v_blocks_text_blocks" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"headline" varchar,
  	"hidden" boolean DEFAULT false,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_services_v_blocks_contact_details" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"headline" varchar,
  	"hidden" boolean DEFAULT false,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_services_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_title" varchar,
  	"version_slug" varchar,
  	"version_category_id" integer,
  	"version_icon" varchar,
  	"version_short_description" varchar,
  	"version_hero_image_id" integer,
  	"version_starting_price" numeric,
  	"version_price_unit" varchar,
  	"version_seo_meta_title" varchar,
  	"version_seo_meta_description" varchar,
  	"version_order" numeric DEFAULT 0,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version_deleted_at" timestamp(3) with time zone,
  	"version__status" "enum__services_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"latest" boolean
  );
  
  ALTER TABLE "pages_blocks_hero" ADD COLUMN "hidden" boolean DEFAULT false;
  ALTER TABLE "pages_blocks_trust_strip" ADD COLUMN "hidden" boolean DEFAULT false;
  ALTER TABLE "pages_blocks_why_choose" ADD COLUMN "hidden" boolean DEFAULT false;
  ALTER TABLE "pages_blocks_our_difference" ADD COLUMN "hidden" boolean DEFAULT false;
  ALTER TABLE "pages_blocks_how_it_works" ADD COLUMN "hidden" boolean DEFAULT false;
  ALTER TABLE "pages_blocks_warranty_promise" ADD COLUMN "hidden" boolean DEFAULT false;
  ALTER TABLE "pages_blocks_who_we_serve" ADD COLUMN "hidden" boolean DEFAULT false;
  ALTER TABLE "pages_blocks_before_after" ADD COLUMN "hidden" boolean DEFAULT false;
  ALTER TABLE "pages_blocks_certificates" ADD COLUMN "hidden" boolean DEFAULT false;
  ALTER TABLE "pages_blocks_inspection_form" ADD COLUMN "hidden" boolean DEFAULT false;
  ALTER TABLE "pages_blocks_faq" ADD COLUMN "hidden" boolean DEFAULT false;
  ALTER TABLE "pages_blocks_cta" ADD COLUMN "hidden" boolean DEFAULT false;
  ALTER TABLE "pages_blocks_text_blocks" ADD COLUMN "hidden" boolean DEFAULT false;
  ALTER TABLE "pages_blocks_contact_details" ADD COLUMN "hidden" boolean DEFAULT false;
  ALTER TABLE "_pages_v_blocks_hero" ADD COLUMN "hidden" boolean DEFAULT false;
  ALTER TABLE "_pages_v_blocks_trust_strip" ADD COLUMN "hidden" boolean DEFAULT false;
  ALTER TABLE "_pages_v_blocks_why_choose" ADD COLUMN "hidden" boolean DEFAULT false;
  ALTER TABLE "_pages_v_blocks_our_difference" ADD COLUMN "hidden" boolean DEFAULT false;
  ALTER TABLE "_pages_v_blocks_how_it_works" ADD COLUMN "hidden" boolean DEFAULT false;
  ALTER TABLE "_pages_v_blocks_warranty_promise" ADD COLUMN "hidden" boolean DEFAULT false;
  ALTER TABLE "_pages_v_blocks_who_we_serve" ADD COLUMN "hidden" boolean DEFAULT false;
  ALTER TABLE "_pages_v_blocks_before_after" ADD COLUMN "hidden" boolean DEFAULT false;
  ALTER TABLE "_pages_v_blocks_certificates" ADD COLUMN "hidden" boolean DEFAULT false;
  ALTER TABLE "_pages_v_blocks_inspection_form" ADD COLUMN "hidden" boolean DEFAULT false;
  ALTER TABLE "_pages_v_blocks_faq" ADD COLUMN "hidden" boolean DEFAULT false;
  ALTER TABLE "_pages_v_blocks_cta" ADD COLUMN "hidden" boolean DEFAULT false;
  ALTER TABLE "_pages_v_blocks_text_blocks" ADD COLUMN "hidden" boolean DEFAULT false;
  ALTER TABLE "_pages_v_blocks_contact_details" ADD COLUMN "hidden" boolean DEFAULT false;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "services_id" integer;
  ALTER TABLE "pages_blocks_services_grid" ADD CONSTRAINT "pages_blocks_services_grid_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_rels" ADD CONSTRAINT "pages_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_rels" ADD CONSTRAINT "pages_rels_services_fk" FOREIGN KEY ("services_id") REFERENCES "public"."services"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_services_grid" ADD CONSTRAINT "_pages_v_blocks_services_grid_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_rels" ADD CONSTRAINT "_pages_v_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_rels" ADD CONSTRAINT "_pages_v_rels_services_fk" FOREIGN KEY ("services_id") REFERENCES "public"."services"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "services_signs" ADD CONSTRAINT "services_signs_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."services"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "services_treatment_steps" ADD CONSTRAINT "services_treatment_steps_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."services"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "services_faqs" ADD CONSTRAINT "services_faqs_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."services"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "services_blocks_trust_strip_items" ADD CONSTRAINT "services_blocks_trust_strip_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."services_blocks_trust_strip"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "services_blocks_trust_strip" ADD CONSTRAINT "services_blocks_trust_strip_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."services"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "services_blocks_why_choose_items" ADD CONSTRAINT "services_blocks_why_choose_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."services_blocks_why_choose"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "services_blocks_why_choose" ADD CONSTRAINT "services_blocks_why_choose_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."services"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "services_blocks_our_difference_points" ADD CONSTRAINT "services_blocks_our_difference_points_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."services_blocks_our_difference"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "services_blocks_our_difference" ADD CONSTRAINT "services_blocks_our_difference_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."services"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "services_blocks_how_it_works_steps" ADD CONSTRAINT "services_blocks_how_it_works_steps_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."services_blocks_how_it_works"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "services_blocks_how_it_works" ADD CONSTRAINT "services_blocks_how_it_works_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."services"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "services_blocks_warranty_promise_highlights" ADD CONSTRAINT "services_blocks_warranty_promise_highlights_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."services_blocks_warranty_promise"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "services_blocks_warranty_promise" ADD CONSTRAINT "services_blocks_warranty_promise_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."services"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "services_blocks_who_we_serve_items" ADD CONSTRAINT "services_blocks_who_we_serve_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."services_blocks_who_we_serve"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "services_blocks_who_we_serve" ADD CONSTRAINT "services_blocks_who_we_serve_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."services"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "services_blocks_before_after_pairs" ADD CONSTRAINT "services_blocks_before_after_pairs_before_id_media_id_fk" FOREIGN KEY ("before_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "services_blocks_before_after_pairs" ADD CONSTRAINT "services_blocks_before_after_pairs_after_id_media_id_fk" FOREIGN KEY ("after_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "services_blocks_before_after_pairs" ADD CONSTRAINT "services_blocks_before_after_pairs_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."services_blocks_before_after"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "services_blocks_before_after" ADD CONSTRAINT "services_blocks_before_after_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."services"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "services_blocks_certificates_items" ADD CONSTRAINT "services_blocks_certificates_items_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "services_blocks_certificates_items" ADD CONSTRAINT "services_blocks_certificates_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."services_blocks_certificates"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "services_blocks_certificates" ADD CONSTRAINT "services_blocks_certificates_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."services"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "services_blocks_inspection_form" ADD CONSTRAINT "services_blocks_inspection_form_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."services"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "services_blocks_faq_items" ADD CONSTRAINT "services_blocks_faq_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."services_blocks_faq"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "services_blocks_faq" ADD CONSTRAINT "services_blocks_faq_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."services"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "services_blocks_cta_buttons" ADD CONSTRAINT "services_blocks_cta_buttons_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."services_blocks_cta"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "services_blocks_cta" ADD CONSTRAINT "services_blocks_cta_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."services"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "services_blocks_text_blocks_paragraphs" ADD CONSTRAINT "services_blocks_text_blocks_paragraphs_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."services_blocks_text_blocks"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "services_blocks_text_blocks" ADD CONSTRAINT "services_blocks_text_blocks_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."services"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "services_blocks_contact_details" ADD CONSTRAINT "services_blocks_contact_details_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."services"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "services" ADD CONSTRAINT "services_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "services" ADD CONSTRAINT "services_hero_image_id_media_id_fk" FOREIGN KEY ("hero_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_services_v_version_signs" ADD CONSTRAINT "_services_v_version_signs_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_services_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_services_v_version_treatment_steps" ADD CONSTRAINT "_services_v_version_treatment_steps_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_services_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_services_v_version_faqs" ADD CONSTRAINT "_services_v_version_faqs_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_services_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_services_v_blocks_trust_strip_items" ADD CONSTRAINT "_services_v_blocks_trust_strip_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_services_v_blocks_trust_strip"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_services_v_blocks_trust_strip" ADD CONSTRAINT "_services_v_blocks_trust_strip_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_services_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_services_v_blocks_why_choose_items" ADD CONSTRAINT "_services_v_blocks_why_choose_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_services_v_blocks_why_choose"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_services_v_blocks_why_choose" ADD CONSTRAINT "_services_v_blocks_why_choose_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_services_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_services_v_blocks_our_difference_points" ADD CONSTRAINT "_services_v_blocks_our_difference_points_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_services_v_blocks_our_difference"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_services_v_blocks_our_difference" ADD CONSTRAINT "_services_v_blocks_our_difference_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_services_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_services_v_blocks_how_it_works_steps" ADD CONSTRAINT "_services_v_blocks_how_it_works_steps_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_services_v_blocks_how_it_works"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_services_v_blocks_how_it_works" ADD CONSTRAINT "_services_v_blocks_how_it_works_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_services_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_services_v_blocks_warranty_promise_highlights" ADD CONSTRAINT "_services_v_blocks_warranty_promise_highlights_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_services_v_blocks_warranty_promise"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_services_v_blocks_warranty_promise" ADD CONSTRAINT "_services_v_blocks_warranty_promise_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_services_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_services_v_blocks_who_we_serve_items" ADD CONSTRAINT "_services_v_blocks_who_we_serve_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_services_v_blocks_who_we_serve"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_services_v_blocks_who_we_serve" ADD CONSTRAINT "_services_v_blocks_who_we_serve_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_services_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_services_v_blocks_before_after_pairs" ADD CONSTRAINT "_services_v_blocks_before_after_pairs_before_id_media_id_fk" FOREIGN KEY ("before_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_services_v_blocks_before_after_pairs" ADD CONSTRAINT "_services_v_blocks_before_after_pairs_after_id_media_id_fk" FOREIGN KEY ("after_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_services_v_blocks_before_after_pairs" ADD CONSTRAINT "_services_v_blocks_before_after_pairs_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_services_v_blocks_before_after"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_services_v_blocks_before_after" ADD CONSTRAINT "_services_v_blocks_before_after_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_services_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_services_v_blocks_certificates_items" ADD CONSTRAINT "_services_v_blocks_certificates_items_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_services_v_blocks_certificates_items" ADD CONSTRAINT "_services_v_blocks_certificates_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_services_v_blocks_certificates"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_services_v_blocks_certificates" ADD CONSTRAINT "_services_v_blocks_certificates_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_services_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_services_v_blocks_inspection_form" ADD CONSTRAINT "_services_v_blocks_inspection_form_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_services_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_services_v_blocks_faq_items" ADD CONSTRAINT "_services_v_blocks_faq_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_services_v_blocks_faq"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_services_v_blocks_faq" ADD CONSTRAINT "_services_v_blocks_faq_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_services_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_services_v_blocks_cta_buttons" ADD CONSTRAINT "_services_v_blocks_cta_buttons_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_services_v_blocks_cta"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_services_v_blocks_cta" ADD CONSTRAINT "_services_v_blocks_cta_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_services_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_services_v_blocks_text_blocks_paragraphs" ADD CONSTRAINT "_services_v_blocks_text_blocks_paragraphs_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_services_v_blocks_text_blocks"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_services_v_blocks_text_blocks" ADD CONSTRAINT "_services_v_blocks_text_blocks_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_services_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_services_v_blocks_contact_details" ADD CONSTRAINT "_services_v_blocks_contact_details_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_services_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_services_v" ADD CONSTRAINT "_services_v_parent_id_services_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."services"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_services_v" ADD CONSTRAINT "_services_v_version_category_id_categories_id_fk" FOREIGN KEY ("version_category_id") REFERENCES "public"."categories"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_services_v" ADD CONSTRAINT "_services_v_version_hero_image_id_media_id_fk" FOREIGN KEY ("version_hero_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "pages_blocks_services_grid_order_idx" ON "pages_blocks_services_grid" USING btree ("_order");
  CREATE INDEX "pages_blocks_services_grid_parent_id_idx" ON "pages_blocks_services_grid" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_services_grid_path_idx" ON "pages_blocks_services_grid" USING btree ("_path");
  CREATE INDEX "pages_rels_order_idx" ON "pages_rels" USING btree ("order");
  CREATE INDEX "pages_rels_parent_idx" ON "pages_rels" USING btree ("parent_id");
  CREATE INDEX "pages_rels_path_idx" ON "pages_rels" USING btree ("path");
  CREATE INDEX "pages_rels_services_id_idx" ON "pages_rels" USING btree ("services_id");
  CREATE INDEX "_pages_v_blocks_services_grid_order_idx" ON "_pages_v_blocks_services_grid" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_services_grid_parent_id_idx" ON "_pages_v_blocks_services_grid" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_services_grid_path_idx" ON "_pages_v_blocks_services_grid" USING btree ("_path");
  CREATE INDEX "_pages_v_rels_order_idx" ON "_pages_v_rels" USING btree ("order");
  CREATE INDEX "_pages_v_rels_parent_idx" ON "_pages_v_rels" USING btree ("parent_id");
  CREATE INDEX "_pages_v_rels_path_idx" ON "_pages_v_rels" USING btree ("path");
  CREATE INDEX "_pages_v_rels_services_id_idx" ON "_pages_v_rels" USING btree ("services_id");
  CREATE INDEX "services_signs_order_idx" ON "services_signs" USING btree ("_order");
  CREATE INDEX "services_signs_parent_id_idx" ON "services_signs" USING btree ("_parent_id");
  CREATE INDEX "services_treatment_steps_order_idx" ON "services_treatment_steps" USING btree ("_order");
  CREATE INDEX "services_treatment_steps_parent_id_idx" ON "services_treatment_steps" USING btree ("_parent_id");
  CREATE INDEX "services_faqs_order_idx" ON "services_faqs" USING btree ("_order");
  CREATE INDEX "services_faqs_parent_id_idx" ON "services_faqs" USING btree ("_parent_id");
  CREATE INDEX "services_blocks_trust_strip_items_order_idx" ON "services_blocks_trust_strip_items" USING btree ("_order");
  CREATE INDEX "services_blocks_trust_strip_items_parent_id_idx" ON "services_blocks_trust_strip_items" USING btree ("_parent_id");
  CREATE INDEX "services_blocks_trust_strip_order_idx" ON "services_blocks_trust_strip" USING btree ("_order");
  CREATE INDEX "services_blocks_trust_strip_parent_id_idx" ON "services_blocks_trust_strip" USING btree ("_parent_id");
  CREATE INDEX "services_blocks_trust_strip_path_idx" ON "services_blocks_trust_strip" USING btree ("_path");
  CREATE INDEX "services_blocks_why_choose_items_order_idx" ON "services_blocks_why_choose_items" USING btree ("_order");
  CREATE INDEX "services_blocks_why_choose_items_parent_id_idx" ON "services_blocks_why_choose_items" USING btree ("_parent_id");
  CREATE INDEX "services_blocks_why_choose_order_idx" ON "services_blocks_why_choose" USING btree ("_order");
  CREATE INDEX "services_blocks_why_choose_parent_id_idx" ON "services_blocks_why_choose" USING btree ("_parent_id");
  CREATE INDEX "services_blocks_why_choose_path_idx" ON "services_blocks_why_choose" USING btree ("_path");
  CREATE INDEX "services_blocks_our_difference_points_order_idx" ON "services_blocks_our_difference_points" USING btree ("_order");
  CREATE INDEX "services_blocks_our_difference_points_parent_id_idx" ON "services_blocks_our_difference_points" USING btree ("_parent_id");
  CREATE INDEX "services_blocks_our_difference_order_idx" ON "services_blocks_our_difference" USING btree ("_order");
  CREATE INDEX "services_blocks_our_difference_parent_id_idx" ON "services_blocks_our_difference" USING btree ("_parent_id");
  CREATE INDEX "services_blocks_our_difference_path_idx" ON "services_blocks_our_difference" USING btree ("_path");
  CREATE INDEX "services_blocks_how_it_works_steps_order_idx" ON "services_blocks_how_it_works_steps" USING btree ("_order");
  CREATE INDEX "services_blocks_how_it_works_steps_parent_id_idx" ON "services_blocks_how_it_works_steps" USING btree ("_parent_id");
  CREATE INDEX "services_blocks_how_it_works_order_idx" ON "services_blocks_how_it_works" USING btree ("_order");
  CREATE INDEX "services_blocks_how_it_works_parent_id_idx" ON "services_blocks_how_it_works" USING btree ("_parent_id");
  CREATE INDEX "services_blocks_how_it_works_path_idx" ON "services_blocks_how_it_works" USING btree ("_path");
  CREATE INDEX "services_blocks_warranty_promise_highlights_order_idx" ON "services_blocks_warranty_promise_highlights" USING btree ("_order");
  CREATE INDEX "services_blocks_warranty_promise_highlights_parent_id_idx" ON "services_blocks_warranty_promise_highlights" USING btree ("_parent_id");
  CREATE INDEX "services_blocks_warranty_promise_order_idx" ON "services_blocks_warranty_promise" USING btree ("_order");
  CREATE INDEX "services_blocks_warranty_promise_parent_id_idx" ON "services_blocks_warranty_promise" USING btree ("_parent_id");
  CREATE INDEX "services_blocks_warranty_promise_path_idx" ON "services_blocks_warranty_promise" USING btree ("_path");
  CREATE INDEX "services_blocks_who_we_serve_items_order_idx" ON "services_blocks_who_we_serve_items" USING btree ("_order");
  CREATE INDEX "services_blocks_who_we_serve_items_parent_id_idx" ON "services_blocks_who_we_serve_items" USING btree ("_parent_id");
  CREATE INDEX "services_blocks_who_we_serve_order_idx" ON "services_blocks_who_we_serve" USING btree ("_order");
  CREATE INDEX "services_blocks_who_we_serve_parent_id_idx" ON "services_blocks_who_we_serve" USING btree ("_parent_id");
  CREATE INDEX "services_blocks_who_we_serve_path_idx" ON "services_blocks_who_we_serve" USING btree ("_path");
  CREATE INDEX "services_blocks_before_after_pairs_order_idx" ON "services_blocks_before_after_pairs" USING btree ("_order");
  CREATE INDEX "services_blocks_before_after_pairs_parent_id_idx" ON "services_blocks_before_after_pairs" USING btree ("_parent_id");
  CREATE INDEX "services_blocks_before_after_pairs_before_idx" ON "services_blocks_before_after_pairs" USING btree ("before_id");
  CREATE INDEX "services_blocks_before_after_pairs_after_idx" ON "services_blocks_before_after_pairs" USING btree ("after_id");
  CREATE INDEX "services_blocks_before_after_order_idx" ON "services_blocks_before_after" USING btree ("_order");
  CREATE INDEX "services_blocks_before_after_parent_id_idx" ON "services_blocks_before_after" USING btree ("_parent_id");
  CREATE INDEX "services_blocks_before_after_path_idx" ON "services_blocks_before_after" USING btree ("_path");
  CREATE INDEX "services_blocks_certificates_items_order_idx" ON "services_blocks_certificates_items" USING btree ("_order");
  CREATE INDEX "services_blocks_certificates_items_parent_id_idx" ON "services_blocks_certificates_items" USING btree ("_parent_id");
  CREATE INDEX "services_blocks_certificates_items_image_idx" ON "services_blocks_certificates_items" USING btree ("image_id");
  CREATE INDEX "services_blocks_certificates_order_idx" ON "services_blocks_certificates" USING btree ("_order");
  CREATE INDEX "services_blocks_certificates_parent_id_idx" ON "services_blocks_certificates" USING btree ("_parent_id");
  CREATE INDEX "services_blocks_certificates_path_idx" ON "services_blocks_certificates" USING btree ("_path");
  CREATE INDEX "services_blocks_inspection_form_order_idx" ON "services_blocks_inspection_form" USING btree ("_order");
  CREATE INDEX "services_blocks_inspection_form_parent_id_idx" ON "services_blocks_inspection_form" USING btree ("_parent_id");
  CREATE INDEX "services_blocks_inspection_form_path_idx" ON "services_blocks_inspection_form" USING btree ("_path");
  CREATE INDEX "services_blocks_faq_items_order_idx" ON "services_blocks_faq_items" USING btree ("_order");
  CREATE INDEX "services_blocks_faq_items_parent_id_idx" ON "services_blocks_faq_items" USING btree ("_parent_id");
  CREATE INDEX "services_blocks_faq_order_idx" ON "services_blocks_faq" USING btree ("_order");
  CREATE INDEX "services_blocks_faq_parent_id_idx" ON "services_blocks_faq" USING btree ("_parent_id");
  CREATE INDEX "services_blocks_faq_path_idx" ON "services_blocks_faq" USING btree ("_path");
  CREATE INDEX "services_blocks_cta_buttons_order_idx" ON "services_blocks_cta_buttons" USING btree ("_order");
  CREATE INDEX "services_blocks_cta_buttons_parent_id_idx" ON "services_blocks_cta_buttons" USING btree ("_parent_id");
  CREATE INDEX "services_blocks_cta_order_idx" ON "services_blocks_cta" USING btree ("_order");
  CREATE INDEX "services_blocks_cta_parent_id_idx" ON "services_blocks_cta" USING btree ("_parent_id");
  CREATE INDEX "services_blocks_cta_path_idx" ON "services_blocks_cta" USING btree ("_path");
  CREATE INDEX "services_blocks_text_blocks_paragraphs_order_idx" ON "services_blocks_text_blocks_paragraphs" USING btree ("_order");
  CREATE INDEX "services_blocks_text_blocks_paragraphs_parent_id_idx" ON "services_blocks_text_blocks_paragraphs" USING btree ("_parent_id");
  CREATE INDEX "services_blocks_text_blocks_order_idx" ON "services_blocks_text_blocks" USING btree ("_order");
  CREATE INDEX "services_blocks_text_blocks_parent_id_idx" ON "services_blocks_text_blocks" USING btree ("_parent_id");
  CREATE INDEX "services_blocks_text_blocks_path_idx" ON "services_blocks_text_blocks" USING btree ("_path");
  CREATE INDEX "services_blocks_contact_details_order_idx" ON "services_blocks_contact_details" USING btree ("_order");
  CREATE INDEX "services_blocks_contact_details_parent_id_idx" ON "services_blocks_contact_details" USING btree ("_parent_id");
  CREATE INDEX "services_blocks_contact_details_path_idx" ON "services_blocks_contact_details" USING btree ("_path");
  CREATE UNIQUE INDEX "services_slug_idx" ON "services" USING btree ("slug");
  CREATE INDEX "services_category_idx" ON "services" USING btree ("category_id");
  CREATE INDEX "services_hero_image_idx" ON "services" USING btree ("hero_image_id");
  CREATE INDEX "services_updated_at_idx" ON "services" USING btree ("updated_at");
  CREATE INDEX "services_created_at_idx" ON "services" USING btree ("created_at");
  CREATE INDEX "services_deleted_at_idx" ON "services" USING btree ("deleted_at");
  CREATE INDEX "services__status_idx" ON "services" USING btree ("_status");
  CREATE INDEX "_services_v_version_signs_order_idx" ON "_services_v_version_signs" USING btree ("_order");
  CREATE INDEX "_services_v_version_signs_parent_id_idx" ON "_services_v_version_signs" USING btree ("_parent_id");
  CREATE INDEX "_services_v_version_treatment_steps_order_idx" ON "_services_v_version_treatment_steps" USING btree ("_order");
  CREATE INDEX "_services_v_version_treatment_steps_parent_id_idx" ON "_services_v_version_treatment_steps" USING btree ("_parent_id");
  CREATE INDEX "_services_v_version_faqs_order_idx" ON "_services_v_version_faqs" USING btree ("_order");
  CREATE INDEX "_services_v_version_faqs_parent_id_idx" ON "_services_v_version_faqs" USING btree ("_parent_id");
  CREATE INDEX "_services_v_blocks_trust_strip_items_order_idx" ON "_services_v_blocks_trust_strip_items" USING btree ("_order");
  CREATE INDEX "_services_v_blocks_trust_strip_items_parent_id_idx" ON "_services_v_blocks_trust_strip_items" USING btree ("_parent_id");
  CREATE INDEX "_services_v_blocks_trust_strip_order_idx" ON "_services_v_blocks_trust_strip" USING btree ("_order");
  CREATE INDEX "_services_v_blocks_trust_strip_parent_id_idx" ON "_services_v_blocks_trust_strip" USING btree ("_parent_id");
  CREATE INDEX "_services_v_blocks_trust_strip_path_idx" ON "_services_v_blocks_trust_strip" USING btree ("_path");
  CREATE INDEX "_services_v_blocks_why_choose_items_order_idx" ON "_services_v_blocks_why_choose_items" USING btree ("_order");
  CREATE INDEX "_services_v_blocks_why_choose_items_parent_id_idx" ON "_services_v_blocks_why_choose_items" USING btree ("_parent_id");
  CREATE INDEX "_services_v_blocks_why_choose_order_idx" ON "_services_v_blocks_why_choose" USING btree ("_order");
  CREATE INDEX "_services_v_blocks_why_choose_parent_id_idx" ON "_services_v_blocks_why_choose" USING btree ("_parent_id");
  CREATE INDEX "_services_v_blocks_why_choose_path_idx" ON "_services_v_blocks_why_choose" USING btree ("_path");
  CREATE INDEX "_services_v_blocks_our_difference_points_order_idx" ON "_services_v_blocks_our_difference_points" USING btree ("_order");
  CREATE INDEX "_services_v_blocks_our_difference_points_parent_id_idx" ON "_services_v_blocks_our_difference_points" USING btree ("_parent_id");
  CREATE INDEX "_services_v_blocks_our_difference_order_idx" ON "_services_v_blocks_our_difference" USING btree ("_order");
  CREATE INDEX "_services_v_blocks_our_difference_parent_id_idx" ON "_services_v_blocks_our_difference" USING btree ("_parent_id");
  CREATE INDEX "_services_v_blocks_our_difference_path_idx" ON "_services_v_blocks_our_difference" USING btree ("_path");
  CREATE INDEX "_services_v_blocks_how_it_works_steps_order_idx" ON "_services_v_blocks_how_it_works_steps" USING btree ("_order");
  CREATE INDEX "_services_v_blocks_how_it_works_steps_parent_id_idx" ON "_services_v_blocks_how_it_works_steps" USING btree ("_parent_id");
  CREATE INDEX "_services_v_blocks_how_it_works_order_idx" ON "_services_v_blocks_how_it_works" USING btree ("_order");
  CREATE INDEX "_services_v_blocks_how_it_works_parent_id_idx" ON "_services_v_blocks_how_it_works" USING btree ("_parent_id");
  CREATE INDEX "_services_v_blocks_how_it_works_path_idx" ON "_services_v_blocks_how_it_works" USING btree ("_path");
  CREATE INDEX "_services_v_blocks_warranty_promise_highlights_order_idx" ON "_services_v_blocks_warranty_promise_highlights" USING btree ("_order");
  CREATE INDEX "_services_v_blocks_warranty_promise_highlights_parent_id_idx" ON "_services_v_blocks_warranty_promise_highlights" USING btree ("_parent_id");
  CREATE INDEX "_services_v_blocks_warranty_promise_order_idx" ON "_services_v_blocks_warranty_promise" USING btree ("_order");
  CREATE INDEX "_services_v_blocks_warranty_promise_parent_id_idx" ON "_services_v_blocks_warranty_promise" USING btree ("_parent_id");
  CREATE INDEX "_services_v_blocks_warranty_promise_path_idx" ON "_services_v_blocks_warranty_promise" USING btree ("_path");
  CREATE INDEX "_services_v_blocks_who_we_serve_items_order_idx" ON "_services_v_blocks_who_we_serve_items" USING btree ("_order");
  CREATE INDEX "_services_v_blocks_who_we_serve_items_parent_id_idx" ON "_services_v_blocks_who_we_serve_items" USING btree ("_parent_id");
  CREATE INDEX "_services_v_blocks_who_we_serve_order_idx" ON "_services_v_blocks_who_we_serve" USING btree ("_order");
  CREATE INDEX "_services_v_blocks_who_we_serve_parent_id_idx" ON "_services_v_blocks_who_we_serve" USING btree ("_parent_id");
  CREATE INDEX "_services_v_blocks_who_we_serve_path_idx" ON "_services_v_blocks_who_we_serve" USING btree ("_path");
  CREATE INDEX "_services_v_blocks_before_after_pairs_order_idx" ON "_services_v_blocks_before_after_pairs" USING btree ("_order");
  CREATE INDEX "_services_v_blocks_before_after_pairs_parent_id_idx" ON "_services_v_blocks_before_after_pairs" USING btree ("_parent_id");
  CREATE INDEX "_services_v_blocks_before_after_pairs_before_idx" ON "_services_v_blocks_before_after_pairs" USING btree ("before_id");
  CREATE INDEX "_services_v_blocks_before_after_pairs_after_idx" ON "_services_v_blocks_before_after_pairs" USING btree ("after_id");
  CREATE INDEX "_services_v_blocks_before_after_order_idx" ON "_services_v_blocks_before_after" USING btree ("_order");
  CREATE INDEX "_services_v_blocks_before_after_parent_id_idx" ON "_services_v_blocks_before_after" USING btree ("_parent_id");
  CREATE INDEX "_services_v_blocks_before_after_path_idx" ON "_services_v_blocks_before_after" USING btree ("_path");
  CREATE INDEX "_services_v_blocks_certificates_items_order_idx" ON "_services_v_blocks_certificates_items" USING btree ("_order");
  CREATE INDEX "_services_v_blocks_certificates_items_parent_id_idx" ON "_services_v_blocks_certificates_items" USING btree ("_parent_id");
  CREATE INDEX "_services_v_blocks_certificates_items_image_idx" ON "_services_v_blocks_certificates_items" USING btree ("image_id");
  CREATE INDEX "_services_v_blocks_certificates_order_idx" ON "_services_v_blocks_certificates" USING btree ("_order");
  CREATE INDEX "_services_v_blocks_certificates_parent_id_idx" ON "_services_v_blocks_certificates" USING btree ("_parent_id");
  CREATE INDEX "_services_v_blocks_certificates_path_idx" ON "_services_v_blocks_certificates" USING btree ("_path");
  CREATE INDEX "_services_v_blocks_inspection_form_order_idx" ON "_services_v_blocks_inspection_form" USING btree ("_order");
  CREATE INDEX "_services_v_blocks_inspection_form_parent_id_idx" ON "_services_v_blocks_inspection_form" USING btree ("_parent_id");
  CREATE INDEX "_services_v_blocks_inspection_form_path_idx" ON "_services_v_blocks_inspection_form" USING btree ("_path");
  CREATE INDEX "_services_v_blocks_faq_items_order_idx" ON "_services_v_blocks_faq_items" USING btree ("_order");
  CREATE INDEX "_services_v_blocks_faq_items_parent_id_idx" ON "_services_v_blocks_faq_items" USING btree ("_parent_id");
  CREATE INDEX "_services_v_blocks_faq_order_idx" ON "_services_v_blocks_faq" USING btree ("_order");
  CREATE INDEX "_services_v_blocks_faq_parent_id_idx" ON "_services_v_blocks_faq" USING btree ("_parent_id");
  CREATE INDEX "_services_v_blocks_faq_path_idx" ON "_services_v_blocks_faq" USING btree ("_path");
  CREATE INDEX "_services_v_blocks_cta_buttons_order_idx" ON "_services_v_blocks_cta_buttons" USING btree ("_order");
  CREATE INDEX "_services_v_blocks_cta_buttons_parent_id_idx" ON "_services_v_blocks_cta_buttons" USING btree ("_parent_id");
  CREATE INDEX "_services_v_blocks_cta_order_idx" ON "_services_v_blocks_cta" USING btree ("_order");
  CREATE INDEX "_services_v_blocks_cta_parent_id_idx" ON "_services_v_blocks_cta" USING btree ("_parent_id");
  CREATE INDEX "_services_v_blocks_cta_path_idx" ON "_services_v_blocks_cta" USING btree ("_path");
  CREATE INDEX "_services_v_blocks_text_blocks_paragraphs_order_idx" ON "_services_v_blocks_text_blocks_paragraphs" USING btree ("_order");
  CREATE INDEX "_services_v_blocks_text_blocks_paragraphs_parent_id_idx" ON "_services_v_blocks_text_blocks_paragraphs" USING btree ("_parent_id");
  CREATE INDEX "_services_v_blocks_text_blocks_order_idx" ON "_services_v_blocks_text_blocks" USING btree ("_order");
  CREATE INDEX "_services_v_blocks_text_blocks_parent_id_idx" ON "_services_v_blocks_text_blocks" USING btree ("_parent_id");
  CREATE INDEX "_services_v_blocks_text_blocks_path_idx" ON "_services_v_blocks_text_blocks" USING btree ("_path");
  CREATE INDEX "_services_v_blocks_contact_details_order_idx" ON "_services_v_blocks_contact_details" USING btree ("_order");
  CREATE INDEX "_services_v_blocks_contact_details_parent_id_idx" ON "_services_v_blocks_contact_details" USING btree ("_parent_id");
  CREATE INDEX "_services_v_blocks_contact_details_path_idx" ON "_services_v_blocks_contact_details" USING btree ("_path");
  CREATE INDEX "_services_v_parent_idx" ON "_services_v" USING btree ("parent_id");
  CREATE INDEX "_services_v_version_version_slug_idx" ON "_services_v" USING btree ("version_slug");
  CREATE INDEX "_services_v_version_version_category_idx" ON "_services_v" USING btree ("version_category_id");
  CREATE INDEX "_services_v_version_version_hero_image_idx" ON "_services_v" USING btree ("version_hero_image_id");
  CREATE INDEX "_services_v_version_version_updated_at_idx" ON "_services_v" USING btree ("version_updated_at");
  CREATE INDEX "_services_v_version_version_created_at_idx" ON "_services_v" USING btree ("version_created_at");
  CREATE INDEX "_services_v_version_version_deleted_at_idx" ON "_services_v" USING btree ("version_deleted_at");
  CREATE INDEX "_services_v_version_version__status_idx" ON "_services_v" USING btree ("version__status");
  CREATE INDEX "_services_v_created_at_idx" ON "_services_v" USING btree ("created_at");
  CREATE INDEX "_services_v_updated_at_idx" ON "_services_v" USING btree ("updated_at");
  CREATE INDEX "_services_v_latest_idx" ON "_services_v" USING btree ("latest");
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_services_fk" FOREIGN KEY ("services_id") REFERENCES "public"."services"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "payload_locked_documents_rels_services_id_idx" ON "payload_locked_documents_rels" USING btree ("services_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "pages_blocks_services_grid" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_rels" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_services_grid" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_rels" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "services_signs" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "services_treatment_steps" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "services_faqs" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "services_blocks_trust_strip_items" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "services_blocks_trust_strip" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "services_blocks_why_choose_items" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "services_blocks_why_choose" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "services_blocks_our_difference_points" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "services_blocks_our_difference" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "services_blocks_how_it_works_steps" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "services_blocks_how_it_works" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "services_blocks_warranty_promise_highlights" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "services_blocks_warranty_promise" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "services_blocks_who_we_serve_items" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "services_blocks_who_we_serve" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "services_blocks_before_after_pairs" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "services_blocks_before_after" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "services_blocks_certificates_items" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "services_blocks_certificates" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "services_blocks_inspection_form" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "services_blocks_faq_items" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "services_blocks_faq" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "services_blocks_cta_buttons" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "services_blocks_cta" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "services_blocks_text_blocks_paragraphs" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "services_blocks_text_blocks" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "services_blocks_contact_details" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "services" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_services_v_version_signs" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_services_v_version_treatment_steps" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_services_v_version_faqs" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_services_v_blocks_trust_strip_items" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_services_v_blocks_trust_strip" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_services_v_blocks_why_choose_items" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_services_v_blocks_why_choose" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_services_v_blocks_our_difference_points" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_services_v_blocks_our_difference" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_services_v_blocks_how_it_works_steps" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_services_v_blocks_how_it_works" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_services_v_blocks_warranty_promise_highlights" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_services_v_blocks_warranty_promise" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_services_v_blocks_who_we_serve_items" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_services_v_blocks_who_we_serve" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_services_v_blocks_before_after_pairs" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_services_v_blocks_before_after" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_services_v_blocks_certificates_items" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_services_v_blocks_certificates" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_services_v_blocks_inspection_form" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_services_v_blocks_faq_items" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_services_v_blocks_faq" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_services_v_blocks_cta_buttons" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_services_v_blocks_cta" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_services_v_blocks_text_blocks_paragraphs" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_services_v_blocks_text_blocks" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_services_v_blocks_contact_details" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_services_v" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "pages_blocks_services_grid" CASCADE;
  DROP TABLE "pages_rels" CASCADE;
  DROP TABLE "_pages_v_blocks_services_grid" CASCADE;
  DROP TABLE "_pages_v_rels" CASCADE;
  DROP TABLE "services_signs" CASCADE;
  DROP TABLE "services_treatment_steps" CASCADE;
  DROP TABLE "services_faqs" CASCADE;
  DROP TABLE "services_blocks_trust_strip_items" CASCADE;
  DROP TABLE "services_blocks_trust_strip" CASCADE;
  DROP TABLE "services_blocks_why_choose_items" CASCADE;
  DROP TABLE "services_blocks_why_choose" CASCADE;
  DROP TABLE "services_blocks_our_difference_points" CASCADE;
  DROP TABLE "services_blocks_our_difference" CASCADE;
  DROP TABLE "services_blocks_how_it_works_steps" CASCADE;
  DROP TABLE "services_blocks_how_it_works" CASCADE;
  DROP TABLE "services_blocks_warranty_promise_highlights" CASCADE;
  DROP TABLE "services_blocks_warranty_promise" CASCADE;
  DROP TABLE "services_blocks_who_we_serve_items" CASCADE;
  DROP TABLE "services_blocks_who_we_serve" CASCADE;
  DROP TABLE "services_blocks_before_after_pairs" CASCADE;
  DROP TABLE "services_blocks_before_after" CASCADE;
  DROP TABLE "services_blocks_certificates_items" CASCADE;
  DROP TABLE "services_blocks_certificates" CASCADE;
  DROP TABLE "services_blocks_inspection_form" CASCADE;
  DROP TABLE "services_blocks_faq_items" CASCADE;
  DROP TABLE "services_blocks_faq" CASCADE;
  DROP TABLE "services_blocks_cta_buttons" CASCADE;
  DROP TABLE "services_blocks_cta" CASCADE;
  DROP TABLE "services_blocks_text_blocks_paragraphs" CASCADE;
  DROP TABLE "services_blocks_text_blocks" CASCADE;
  DROP TABLE "services_blocks_contact_details" CASCADE;
  DROP TABLE "services" CASCADE;
  DROP TABLE "_services_v_version_signs" CASCADE;
  DROP TABLE "_services_v_version_treatment_steps" CASCADE;
  DROP TABLE "_services_v_version_faqs" CASCADE;
  DROP TABLE "_services_v_blocks_trust_strip_items" CASCADE;
  DROP TABLE "_services_v_blocks_trust_strip" CASCADE;
  DROP TABLE "_services_v_blocks_why_choose_items" CASCADE;
  DROP TABLE "_services_v_blocks_why_choose" CASCADE;
  DROP TABLE "_services_v_blocks_our_difference_points" CASCADE;
  DROP TABLE "_services_v_blocks_our_difference" CASCADE;
  DROP TABLE "_services_v_blocks_how_it_works_steps" CASCADE;
  DROP TABLE "_services_v_blocks_how_it_works" CASCADE;
  DROP TABLE "_services_v_blocks_warranty_promise_highlights" CASCADE;
  DROP TABLE "_services_v_blocks_warranty_promise" CASCADE;
  DROP TABLE "_services_v_blocks_who_we_serve_items" CASCADE;
  DROP TABLE "_services_v_blocks_who_we_serve" CASCADE;
  DROP TABLE "_services_v_blocks_before_after_pairs" CASCADE;
  DROP TABLE "_services_v_blocks_before_after" CASCADE;
  DROP TABLE "_services_v_blocks_certificates_items" CASCADE;
  DROP TABLE "_services_v_blocks_certificates" CASCADE;
  DROP TABLE "_services_v_blocks_inspection_form" CASCADE;
  DROP TABLE "_services_v_blocks_faq_items" CASCADE;
  DROP TABLE "_services_v_blocks_faq" CASCADE;
  DROP TABLE "_services_v_blocks_cta_buttons" CASCADE;
  DROP TABLE "_services_v_blocks_cta" CASCADE;
  DROP TABLE "_services_v_blocks_text_blocks_paragraphs" CASCADE;
  DROP TABLE "_services_v_blocks_text_blocks" CASCADE;
  DROP TABLE "_services_v_blocks_contact_details" CASCADE;
  DROP TABLE "_services_v" CASCADE;
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_services_fk";
  
  DROP INDEX "payload_locked_documents_rels_services_id_idx";
  ALTER TABLE "pages_blocks_hero" DROP COLUMN "hidden";
  ALTER TABLE "pages_blocks_trust_strip" DROP COLUMN "hidden";
  ALTER TABLE "pages_blocks_why_choose" DROP COLUMN "hidden";
  ALTER TABLE "pages_blocks_our_difference" DROP COLUMN "hidden";
  ALTER TABLE "pages_blocks_how_it_works" DROP COLUMN "hidden";
  ALTER TABLE "pages_blocks_warranty_promise" DROP COLUMN "hidden";
  ALTER TABLE "pages_blocks_who_we_serve" DROP COLUMN "hidden";
  ALTER TABLE "pages_blocks_before_after" DROP COLUMN "hidden";
  ALTER TABLE "pages_blocks_certificates" DROP COLUMN "hidden";
  ALTER TABLE "pages_blocks_inspection_form" DROP COLUMN "hidden";
  ALTER TABLE "pages_blocks_faq" DROP COLUMN "hidden";
  ALTER TABLE "pages_blocks_cta" DROP COLUMN "hidden";
  ALTER TABLE "pages_blocks_text_blocks" DROP COLUMN "hidden";
  ALTER TABLE "pages_blocks_contact_details" DROP COLUMN "hidden";
  ALTER TABLE "_pages_v_blocks_hero" DROP COLUMN "hidden";
  ALTER TABLE "_pages_v_blocks_trust_strip" DROP COLUMN "hidden";
  ALTER TABLE "_pages_v_blocks_why_choose" DROP COLUMN "hidden";
  ALTER TABLE "_pages_v_blocks_our_difference" DROP COLUMN "hidden";
  ALTER TABLE "_pages_v_blocks_how_it_works" DROP COLUMN "hidden";
  ALTER TABLE "_pages_v_blocks_warranty_promise" DROP COLUMN "hidden";
  ALTER TABLE "_pages_v_blocks_who_we_serve" DROP COLUMN "hidden";
  ALTER TABLE "_pages_v_blocks_before_after" DROP COLUMN "hidden";
  ALTER TABLE "_pages_v_blocks_certificates" DROP COLUMN "hidden";
  ALTER TABLE "_pages_v_blocks_inspection_form" DROP COLUMN "hidden";
  ALTER TABLE "_pages_v_blocks_faq" DROP COLUMN "hidden";
  ALTER TABLE "_pages_v_blocks_cta" DROP COLUMN "hidden";
  ALTER TABLE "_pages_v_blocks_text_blocks" DROP COLUMN "hidden";
  ALTER TABLE "_pages_v_blocks_contact_details" DROP COLUMN "hidden";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "services_id";
  DROP TYPE "public"."enum_pages_blocks_services_grid_mode";
  DROP TYPE "public"."enum__pages_v_blocks_services_grid_mode";
  DROP TYPE "public"."enum_services_blocks_warranty_promise_link_kind";
  DROP TYPE "public"."enum_services_blocks_who_we_serve_items_link_kind";
  DROP TYPE "public"."enum_services_blocks_cta_buttons_kind";
  DROP TYPE "public"."enum_services_status";
  DROP TYPE "public"."enum__services_v_blocks_warranty_promise_link_kind";
  DROP TYPE "public"."enum__services_v_blocks_who_we_serve_items_link_kind";
  DROP TYPE "public"."enum__services_v_blocks_cta_buttons_kind";
  DROP TYPE "public"."enum__services_v_version_status";`)
}
