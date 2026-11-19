import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_categories_kind" AS ENUM('services', 'industries', 'locations', 'blog', 'products', 'general');
  CREATE TYPE "public"."enum_pages_blocks_hero_secondary_actions_kind" AS ENUM('call', 'whatsapp', 'inspection', 'link');
  CREATE TYPE "public"."enum_pages_blocks_hero_primary_action_kind" AS ENUM('call', 'whatsapp', 'inspection', 'link');
  CREATE TYPE "public"."enum_pages_blocks_warranty_promise_link_kind" AS ENUM('call', 'whatsapp', 'inspection', 'link');
  CREATE TYPE "public"."enum_pages_blocks_who_we_serve_items_link_kind" AS ENUM('call', 'whatsapp', 'inspection', 'link');
  CREATE TYPE "public"."enum_pages_blocks_cta_buttons_kind" AS ENUM('call', 'whatsapp', 'inspection', 'link');
  CREATE TYPE "public"."enum_pages_template" AS ENUM('standard', 'landing', 'legal', 'form');
  CREATE TYPE "public"."enum_pages_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__pages_v_blocks_hero_secondary_actions_kind" AS ENUM('call', 'whatsapp', 'inspection', 'link');
  CREATE TYPE "public"."enum__pages_v_blocks_hero_primary_action_kind" AS ENUM('call', 'whatsapp', 'inspection', 'link');
  CREATE TYPE "public"."enum__pages_v_blocks_warranty_promise_link_kind" AS ENUM('call', 'whatsapp', 'inspection', 'link');
  CREATE TYPE "public"."enum__pages_v_blocks_who_we_serve_items_link_kind" AS ENUM('call', 'whatsapp', 'inspection', 'link');
  CREATE TYPE "public"."enum__pages_v_blocks_cta_buttons_kind" AS ENUM('call', 'whatsapp', 'inspection', 'link');
  CREATE TYPE "public"."enum__pages_v_version_template" AS ENUM('standard', 'landing', 'legal', 'form');
  CREATE TYPE "public"."enum__pages_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum_payload_jobs_log_task_slug" AS ENUM('inline', 'schedulePublish');
  CREATE TYPE "public"."enum_payload_jobs_log_state" AS ENUM('failed', 'succeeded');
  CREATE TYPE "public"."enum_payload_jobs_task_slug" AS ENUM('inline', 'schedulePublish');
  CREATE TABLE "categories" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"slug" varchar NOT NULL,
  	"parent_id" integer,
  	"path" varchar,
  	"kind" "enum_categories_kind" DEFAULT 'general' NOT NULL,
  	"intro" varchar,
  	"show_in_nav" boolean DEFAULT false,
  	"nav_order" numeric,
  	"seo_meta_title" varchar,
  	"seo_meta_description" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"deleted_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "pages_blocks_hero_secondary_actions" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"label" varchar,
  	"kind" "enum_pages_blocks_hero_secondary_actions_kind" DEFAULT 'link',
  	"href" varchar
  );
  
  CREATE TABLE "pages_blocks_hero" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"eyebrow" varchar,
  	"headline" varchar,
  	"subheadline" varchar,
  	"primary_action_label" varchar,
  	"primary_action_kind" "enum_pages_blocks_hero_primary_action_kind" DEFAULT 'link',
  	"primary_action_href" varchar,
  	"image_id" integer,
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_trust_strip_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"stat_value" varchar,
  	"stat_label" varchar,
  	"proof_note" varchar
  );
  
  CREATE TABLE "pages_blocks_trust_strip" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_why_choose_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"icon" varchar,
  	"card_title" varchar,
  	"card_body" varchar
  );
  
  CREATE TABLE "pages_blocks_why_choose" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"headline" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_our_difference_points" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"point" varchar
  );
  
  CREATE TABLE "pages_blocks_our_difference" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"headline" varchar,
  	"short_paragraph" varchar,
  	"proof_note" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_how_it_works_steps" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"card_title" varchar,
  	"card_body" varchar
  );
  
  CREATE TABLE "pages_blocks_how_it_works" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"headline" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_warranty_promise_highlights" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"highlight" varchar
  );
  
  CREATE TABLE "pages_blocks_warranty_promise" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"headline" varchar,
  	"short_paragraph" varchar,
  	"link_label" varchar,
  	"link_kind" "enum_pages_blocks_warranty_promise_link_kind" DEFAULT 'link',
  	"link_href" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_who_we_serve_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"card_body" varchar,
  	"link_label" varchar,
  	"link_kind" "enum_pages_blocks_who_we_serve_items_link_kind" DEFAULT 'link',
  	"link_href" varchar
  );
  
  CREATE TABLE "pages_blocks_who_we_serve" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"headline" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_before_after_pairs" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"before_id" integer,
  	"after_id" integer,
  	"caption" varchar,
  	"area" varchar,
  	"consent_confirmed" boolean DEFAULT false
  );
  
  CREATE TABLE "pages_blocks_before_after" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"headline" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_certificates_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"image_id" integer,
  	"title" varchar,
  	"issuer" varchar
  );
  
  CREATE TABLE "pages_blocks_certificates" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"headline" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_inspection_form" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"headline" varchar,
  	"short_paragraph" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_faq_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"question" varchar,
  	"answer" varchar
  );
  
  CREATE TABLE "pages_blocks_faq" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"headline" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_cta_buttons" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"label" varchar,
  	"kind" "enum_pages_blocks_cta_buttons_kind" DEFAULT 'link',
  	"href" varchar
  );
  
  CREATE TABLE "pages_blocks_cta" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"headline" varchar,
  	"card_body" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_text_blocks_paragraphs" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"paragraph" varchar
  );
  
  CREATE TABLE "pages_blocks_text_blocks" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"headline" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_contact_details" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"headline" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "pages" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"slug" varchar,
  	"category_id" integer,
  	"path" varchar,
  	"template" "enum_pages_template" DEFAULT 'standard',
  	"is_legal" boolean DEFAULT false,
  	"seo_meta_title" varchar,
  	"seo_meta_description" varchar,
  	"noindex" boolean DEFAULT false,
  	"published_at" timestamp(3) with time zone,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"deleted_at" timestamp(3) with time zone,
  	"_status" "enum_pages_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "_pages_v_blocks_hero_secondary_actions" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"label" varchar,
  	"kind" "enum__pages_v_blocks_hero_secondary_actions_kind" DEFAULT 'link',
  	"href" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_hero" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"eyebrow" varchar,
  	"headline" varchar,
  	"subheadline" varchar,
  	"primary_action_label" varchar,
  	"primary_action_kind" "enum__pages_v_blocks_hero_primary_action_kind" DEFAULT 'link',
  	"primary_action_href" varchar,
  	"image_id" integer,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_trust_strip_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"stat_value" varchar,
  	"stat_label" varchar,
  	"proof_note" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_trust_strip" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_why_choose_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"icon" varchar,
  	"card_title" varchar,
  	"card_body" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_why_choose" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"headline" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_our_difference_points" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"point" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_our_difference" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"headline" varchar,
  	"short_paragraph" varchar,
  	"proof_note" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_how_it_works_steps" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"card_title" varchar,
  	"card_body" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_how_it_works" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"headline" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_warranty_promise_highlights" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"highlight" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_warranty_promise" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"headline" varchar,
  	"short_paragraph" varchar,
  	"link_label" varchar,
  	"link_kind" "enum__pages_v_blocks_warranty_promise_link_kind" DEFAULT 'link',
  	"link_href" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_who_we_serve_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"card_body" varchar,
  	"link_label" varchar,
  	"link_kind" "enum__pages_v_blocks_who_we_serve_items_link_kind" DEFAULT 'link',
  	"link_href" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_who_we_serve" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"headline" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_before_after_pairs" (
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
  
  CREATE TABLE "_pages_v_blocks_before_after" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"headline" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_certificates_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"image_id" integer,
  	"title" varchar,
  	"issuer" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_certificates" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"headline" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_inspection_form" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"headline" varchar,
  	"short_paragraph" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_faq_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"question" varchar,
  	"answer" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_faq" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"headline" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_cta_buttons" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"label" varchar,
  	"kind" "enum__pages_v_blocks_cta_buttons_kind" DEFAULT 'link',
  	"href" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_cta" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"headline" varchar,
  	"card_body" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_text_blocks_paragraphs" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"paragraph" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_text_blocks" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"headline" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_contact_details" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"headline" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_title" varchar,
  	"version_slug" varchar,
  	"version_category_id" integer,
  	"version_path" varchar,
  	"version_template" "enum__pages_v_version_template" DEFAULT 'standard',
  	"version_is_legal" boolean DEFAULT false,
  	"version_seo_meta_title" varchar,
  	"version_seo_meta_description" varchar,
  	"version_noindex" boolean DEFAULT false,
  	"version_published_at" timestamp(3) with time zone,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version_deleted_at" timestamp(3) with time zone,
  	"version__status" "enum__pages_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"latest" boolean
  );
  
  CREATE TABLE "payload_jobs_log" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"executed_at" timestamp(3) with time zone NOT NULL,
  	"completed_at" timestamp(3) with time zone NOT NULL,
  	"task_slug" "enum_payload_jobs_log_task_slug" NOT NULL,
  	"task_i_d" varchar NOT NULL,
  	"input" jsonb,
  	"output" jsonb,
  	"state" "enum_payload_jobs_log_state" NOT NULL,
  	"error" jsonb
  );
  
  CREATE TABLE "payload_jobs" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"input" jsonb,
  	"completed_at" timestamp(3) with time zone,
  	"total_tried" numeric DEFAULT 0,
  	"has_error" boolean DEFAULT false,
  	"error" jsonb,
  	"task_slug" "enum_payload_jobs_task_slug",
  	"queue" varchar DEFAULT 'default',
  	"wait_until" timestamp(3) with time zone,
  	"processing" boolean DEFAULT false,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "categories_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "pages_id" integer;
  ALTER TABLE "categories" ADD CONSTRAINT "categories_parent_id_categories_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."categories"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_blocks_hero_secondary_actions" ADD CONSTRAINT "pages_blocks_hero_secondary_actions_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_hero"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_hero" ADD CONSTRAINT "pages_blocks_hero_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_blocks_hero" ADD CONSTRAINT "pages_blocks_hero_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_trust_strip_items" ADD CONSTRAINT "pages_blocks_trust_strip_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_trust_strip"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_trust_strip" ADD CONSTRAINT "pages_blocks_trust_strip_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_why_choose_items" ADD CONSTRAINT "pages_blocks_why_choose_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_why_choose"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_why_choose" ADD CONSTRAINT "pages_blocks_why_choose_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_our_difference_points" ADD CONSTRAINT "pages_blocks_our_difference_points_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_our_difference"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_our_difference" ADD CONSTRAINT "pages_blocks_our_difference_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_how_it_works_steps" ADD CONSTRAINT "pages_blocks_how_it_works_steps_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_how_it_works"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_how_it_works" ADD CONSTRAINT "pages_blocks_how_it_works_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_warranty_promise_highlights" ADD CONSTRAINT "pages_blocks_warranty_promise_highlights_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_warranty_promise"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_warranty_promise" ADD CONSTRAINT "pages_blocks_warranty_promise_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_who_we_serve_items" ADD CONSTRAINT "pages_blocks_who_we_serve_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_who_we_serve"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_who_we_serve" ADD CONSTRAINT "pages_blocks_who_we_serve_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_before_after_pairs" ADD CONSTRAINT "pages_blocks_before_after_pairs_before_id_media_id_fk" FOREIGN KEY ("before_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_blocks_before_after_pairs" ADD CONSTRAINT "pages_blocks_before_after_pairs_after_id_media_id_fk" FOREIGN KEY ("after_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_blocks_before_after_pairs" ADD CONSTRAINT "pages_blocks_before_after_pairs_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_before_after"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_before_after" ADD CONSTRAINT "pages_blocks_before_after_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_certificates_items" ADD CONSTRAINT "pages_blocks_certificates_items_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_blocks_certificates_items" ADD CONSTRAINT "pages_blocks_certificates_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_certificates"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_certificates" ADD CONSTRAINT "pages_blocks_certificates_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_inspection_form" ADD CONSTRAINT "pages_blocks_inspection_form_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_faq_items" ADD CONSTRAINT "pages_blocks_faq_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_faq"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_faq" ADD CONSTRAINT "pages_blocks_faq_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_cta_buttons" ADD CONSTRAINT "pages_blocks_cta_buttons_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_cta"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_cta" ADD CONSTRAINT "pages_blocks_cta_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_text_blocks_paragraphs" ADD CONSTRAINT "pages_blocks_text_blocks_paragraphs_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_text_blocks"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_text_blocks" ADD CONSTRAINT "pages_blocks_text_blocks_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_contact_details" ADD CONSTRAINT "pages_blocks_contact_details_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages" ADD CONSTRAINT "pages_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_hero_secondary_actions" ADD CONSTRAINT "_pages_v_blocks_hero_secondary_actions_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_hero"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_hero" ADD CONSTRAINT "_pages_v_blocks_hero_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_hero" ADD CONSTRAINT "_pages_v_blocks_hero_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_trust_strip_items" ADD CONSTRAINT "_pages_v_blocks_trust_strip_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_trust_strip"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_trust_strip" ADD CONSTRAINT "_pages_v_blocks_trust_strip_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_why_choose_items" ADD CONSTRAINT "_pages_v_blocks_why_choose_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_why_choose"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_why_choose" ADD CONSTRAINT "_pages_v_blocks_why_choose_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_our_difference_points" ADD CONSTRAINT "_pages_v_blocks_our_difference_points_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_our_difference"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_our_difference" ADD CONSTRAINT "_pages_v_blocks_our_difference_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_how_it_works_steps" ADD CONSTRAINT "_pages_v_blocks_how_it_works_steps_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_how_it_works"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_how_it_works" ADD CONSTRAINT "_pages_v_blocks_how_it_works_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_warranty_promise_highlights" ADD CONSTRAINT "_pages_v_blocks_warranty_promise_highlights_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_warranty_promise"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_warranty_promise" ADD CONSTRAINT "_pages_v_blocks_warranty_promise_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_who_we_serve_items" ADD CONSTRAINT "_pages_v_blocks_who_we_serve_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_who_we_serve"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_who_we_serve" ADD CONSTRAINT "_pages_v_blocks_who_we_serve_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_before_after_pairs" ADD CONSTRAINT "_pages_v_blocks_before_after_pairs_before_id_media_id_fk" FOREIGN KEY ("before_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_before_after_pairs" ADD CONSTRAINT "_pages_v_blocks_before_after_pairs_after_id_media_id_fk" FOREIGN KEY ("after_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_before_after_pairs" ADD CONSTRAINT "_pages_v_blocks_before_after_pairs_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_before_after"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_before_after" ADD CONSTRAINT "_pages_v_blocks_before_after_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_certificates_items" ADD CONSTRAINT "_pages_v_blocks_certificates_items_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_certificates_items" ADD CONSTRAINT "_pages_v_blocks_certificates_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_certificates"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_certificates" ADD CONSTRAINT "_pages_v_blocks_certificates_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_inspection_form" ADD CONSTRAINT "_pages_v_blocks_inspection_form_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_faq_items" ADD CONSTRAINT "_pages_v_blocks_faq_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_faq"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_faq" ADD CONSTRAINT "_pages_v_blocks_faq_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_cta_buttons" ADD CONSTRAINT "_pages_v_blocks_cta_buttons_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_cta"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_cta" ADD CONSTRAINT "_pages_v_blocks_cta_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_text_blocks_paragraphs" ADD CONSTRAINT "_pages_v_blocks_text_blocks_paragraphs_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_text_blocks"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_text_blocks" ADD CONSTRAINT "_pages_v_blocks_text_blocks_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_contact_details" ADD CONSTRAINT "_pages_v_blocks_contact_details_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v" ADD CONSTRAINT "_pages_v_parent_id_pages_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."pages"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v" ADD CONSTRAINT "_pages_v_version_category_id_categories_id_fk" FOREIGN KEY ("version_category_id") REFERENCES "public"."categories"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "payload_jobs_log" ADD CONSTRAINT "payload_jobs_log_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."payload_jobs"("id") ON DELETE cascade ON UPDATE no action;
  CREATE UNIQUE INDEX "categories_slug_idx" ON "categories" USING btree ("slug");
  CREATE INDEX "categories_parent_idx" ON "categories" USING btree ("parent_id");
  CREATE UNIQUE INDEX "categories_path_idx" ON "categories" USING btree ("path");
  CREATE INDEX "categories_updated_at_idx" ON "categories" USING btree ("updated_at");
  CREATE INDEX "categories_created_at_idx" ON "categories" USING btree ("created_at");
  CREATE INDEX "categories_deleted_at_idx" ON "categories" USING btree ("deleted_at");
  CREATE INDEX "pages_blocks_hero_secondary_actions_order_idx" ON "pages_blocks_hero_secondary_actions" USING btree ("_order");
  CREATE INDEX "pages_blocks_hero_secondary_actions_parent_id_idx" ON "pages_blocks_hero_secondary_actions" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_hero_order_idx" ON "pages_blocks_hero" USING btree ("_order");
  CREATE INDEX "pages_blocks_hero_parent_id_idx" ON "pages_blocks_hero" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_hero_path_idx" ON "pages_blocks_hero" USING btree ("_path");
  CREATE INDEX "pages_blocks_hero_image_idx" ON "pages_blocks_hero" USING btree ("image_id");
  CREATE INDEX "pages_blocks_trust_strip_items_order_idx" ON "pages_blocks_trust_strip_items" USING btree ("_order");
  CREATE INDEX "pages_blocks_trust_strip_items_parent_id_idx" ON "pages_blocks_trust_strip_items" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_trust_strip_order_idx" ON "pages_blocks_trust_strip" USING btree ("_order");
  CREATE INDEX "pages_blocks_trust_strip_parent_id_idx" ON "pages_blocks_trust_strip" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_trust_strip_path_idx" ON "pages_blocks_trust_strip" USING btree ("_path");
  CREATE INDEX "pages_blocks_why_choose_items_order_idx" ON "pages_blocks_why_choose_items" USING btree ("_order");
  CREATE INDEX "pages_blocks_why_choose_items_parent_id_idx" ON "pages_blocks_why_choose_items" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_why_choose_order_idx" ON "pages_blocks_why_choose" USING btree ("_order");
  CREATE INDEX "pages_blocks_why_choose_parent_id_idx" ON "pages_blocks_why_choose" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_why_choose_path_idx" ON "pages_blocks_why_choose" USING btree ("_path");
  CREATE INDEX "pages_blocks_our_difference_points_order_idx" ON "pages_blocks_our_difference_points" USING btree ("_order");
  CREATE INDEX "pages_blocks_our_difference_points_parent_id_idx" ON "pages_blocks_our_difference_points" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_our_difference_order_idx" ON "pages_blocks_our_difference" USING btree ("_order");
  CREATE INDEX "pages_blocks_our_difference_parent_id_idx" ON "pages_blocks_our_difference" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_our_difference_path_idx" ON "pages_blocks_our_difference" USING btree ("_path");
  CREATE INDEX "pages_blocks_how_it_works_steps_order_idx" ON "pages_blocks_how_it_works_steps" USING btree ("_order");
  CREATE INDEX "pages_blocks_how_it_works_steps_parent_id_idx" ON "pages_blocks_how_it_works_steps" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_how_it_works_order_idx" ON "pages_blocks_how_it_works" USING btree ("_order");
  CREATE INDEX "pages_blocks_how_it_works_parent_id_idx" ON "pages_blocks_how_it_works" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_how_it_works_path_idx" ON "pages_blocks_how_it_works" USING btree ("_path");
  CREATE INDEX "pages_blocks_warranty_promise_highlights_order_idx" ON "pages_blocks_warranty_promise_highlights" USING btree ("_order");
  CREATE INDEX "pages_blocks_warranty_promise_highlights_parent_id_idx" ON "pages_blocks_warranty_promise_highlights" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_warranty_promise_order_idx" ON "pages_blocks_warranty_promise" USING btree ("_order");
  CREATE INDEX "pages_blocks_warranty_promise_parent_id_idx" ON "pages_blocks_warranty_promise" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_warranty_promise_path_idx" ON "pages_blocks_warranty_promise" USING btree ("_path");
  CREATE INDEX "pages_blocks_who_we_serve_items_order_idx" ON "pages_blocks_who_we_serve_items" USING btree ("_order");
  CREATE INDEX "pages_blocks_who_we_serve_items_parent_id_idx" ON "pages_blocks_who_we_serve_items" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_who_we_serve_order_idx" ON "pages_blocks_who_we_serve" USING btree ("_order");
  CREATE INDEX "pages_blocks_who_we_serve_parent_id_idx" ON "pages_blocks_who_we_serve" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_who_we_serve_path_idx" ON "pages_blocks_who_we_serve" USING btree ("_path");
  CREATE INDEX "pages_blocks_before_after_pairs_order_idx" ON "pages_blocks_before_after_pairs" USING btree ("_order");
  CREATE INDEX "pages_blocks_before_after_pairs_parent_id_idx" ON "pages_blocks_before_after_pairs" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_before_after_pairs_before_idx" ON "pages_blocks_before_after_pairs" USING btree ("before_id");
  CREATE INDEX "pages_blocks_before_after_pairs_after_idx" ON "pages_blocks_before_after_pairs" USING btree ("after_id");
  CREATE INDEX "pages_blocks_before_after_order_idx" ON "pages_blocks_before_after" USING btree ("_order");
  CREATE INDEX "pages_blocks_before_after_parent_id_idx" ON "pages_blocks_before_after" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_before_after_path_idx" ON "pages_blocks_before_after" USING btree ("_path");
  CREATE INDEX "pages_blocks_certificates_items_order_idx" ON "pages_blocks_certificates_items" USING btree ("_order");
  CREATE INDEX "pages_blocks_certificates_items_parent_id_idx" ON "pages_blocks_certificates_items" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_certificates_items_image_idx" ON "pages_blocks_certificates_items" USING btree ("image_id");
  CREATE INDEX "pages_blocks_certificates_order_idx" ON "pages_blocks_certificates" USING btree ("_order");
  CREATE INDEX "pages_blocks_certificates_parent_id_idx" ON "pages_blocks_certificates" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_certificates_path_idx" ON "pages_blocks_certificates" USING btree ("_path");
  CREATE INDEX "pages_blocks_inspection_form_order_idx" ON "pages_blocks_inspection_form" USING btree ("_order");
  CREATE INDEX "pages_blocks_inspection_form_parent_id_idx" ON "pages_blocks_inspection_form" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_inspection_form_path_idx" ON "pages_blocks_inspection_form" USING btree ("_path");
  CREATE INDEX "pages_blocks_faq_items_order_idx" ON "pages_blocks_faq_items" USING btree ("_order");
  CREATE INDEX "pages_blocks_faq_items_parent_id_idx" ON "pages_blocks_faq_items" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_faq_order_idx" ON "pages_blocks_faq" USING btree ("_order");
  CREATE INDEX "pages_blocks_faq_parent_id_idx" ON "pages_blocks_faq" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_faq_path_idx" ON "pages_blocks_faq" USING btree ("_path");
  CREATE INDEX "pages_blocks_cta_buttons_order_idx" ON "pages_blocks_cta_buttons" USING btree ("_order");
  CREATE INDEX "pages_blocks_cta_buttons_parent_id_idx" ON "pages_blocks_cta_buttons" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_cta_order_idx" ON "pages_blocks_cta" USING btree ("_order");
  CREATE INDEX "pages_blocks_cta_parent_id_idx" ON "pages_blocks_cta" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_cta_path_idx" ON "pages_blocks_cta" USING btree ("_path");
  CREATE INDEX "pages_blocks_text_blocks_paragraphs_order_idx" ON "pages_blocks_text_blocks_paragraphs" USING btree ("_order");
  CREATE INDEX "pages_blocks_text_blocks_paragraphs_parent_id_idx" ON "pages_blocks_text_blocks_paragraphs" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_text_blocks_order_idx" ON "pages_blocks_text_blocks" USING btree ("_order");
  CREATE INDEX "pages_blocks_text_blocks_parent_id_idx" ON "pages_blocks_text_blocks" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_text_blocks_path_idx" ON "pages_blocks_text_blocks" USING btree ("_path");
  CREATE INDEX "pages_blocks_contact_details_order_idx" ON "pages_blocks_contact_details" USING btree ("_order");
  CREATE INDEX "pages_blocks_contact_details_parent_id_idx" ON "pages_blocks_contact_details" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_contact_details_path_idx" ON "pages_blocks_contact_details" USING btree ("_path");
  CREATE UNIQUE INDEX "pages_slug_idx" ON "pages" USING btree ("slug");
  CREATE INDEX "pages_category_idx" ON "pages" USING btree ("category_id");
  CREATE UNIQUE INDEX "pages_path_idx" ON "pages" USING btree ("path");
  CREATE INDEX "pages_updated_at_idx" ON "pages" USING btree ("updated_at");
  CREATE INDEX "pages_created_at_idx" ON "pages" USING btree ("created_at");
  CREATE INDEX "pages_deleted_at_idx" ON "pages" USING btree ("deleted_at");
  CREATE INDEX "pages__status_idx" ON "pages" USING btree ("_status");
  CREATE INDEX "_pages_v_blocks_hero_secondary_actions_order_idx" ON "_pages_v_blocks_hero_secondary_actions" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_hero_secondary_actions_parent_id_idx" ON "_pages_v_blocks_hero_secondary_actions" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_hero_order_idx" ON "_pages_v_blocks_hero" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_hero_parent_id_idx" ON "_pages_v_blocks_hero" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_hero_path_idx" ON "_pages_v_blocks_hero" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_hero_image_idx" ON "_pages_v_blocks_hero" USING btree ("image_id");
  CREATE INDEX "_pages_v_blocks_trust_strip_items_order_idx" ON "_pages_v_blocks_trust_strip_items" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_trust_strip_items_parent_id_idx" ON "_pages_v_blocks_trust_strip_items" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_trust_strip_order_idx" ON "_pages_v_blocks_trust_strip" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_trust_strip_parent_id_idx" ON "_pages_v_blocks_trust_strip" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_trust_strip_path_idx" ON "_pages_v_blocks_trust_strip" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_why_choose_items_order_idx" ON "_pages_v_blocks_why_choose_items" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_why_choose_items_parent_id_idx" ON "_pages_v_blocks_why_choose_items" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_why_choose_order_idx" ON "_pages_v_blocks_why_choose" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_why_choose_parent_id_idx" ON "_pages_v_blocks_why_choose" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_why_choose_path_idx" ON "_pages_v_blocks_why_choose" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_our_difference_points_order_idx" ON "_pages_v_blocks_our_difference_points" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_our_difference_points_parent_id_idx" ON "_pages_v_blocks_our_difference_points" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_our_difference_order_idx" ON "_pages_v_blocks_our_difference" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_our_difference_parent_id_idx" ON "_pages_v_blocks_our_difference" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_our_difference_path_idx" ON "_pages_v_blocks_our_difference" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_how_it_works_steps_order_idx" ON "_pages_v_blocks_how_it_works_steps" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_how_it_works_steps_parent_id_idx" ON "_pages_v_blocks_how_it_works_steps" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_how_it_works_order_idx" ON "_pages_v_blocks_how_it_works" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_how_it_works_parent_id_idx" ON "_pages_v_blocks_how_it_works" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_how_it_works_path_idx" ON "_pages_v_blocks_how_it_works" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_warranty_promise_highlights_order_idx" ON "_pages_v_blocks_warranty_promise_highlights" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_warranty_promise_highlights_parent_id_idx" ON "_pages_v_blocks_warranty_promise_highlights" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_warranty_promise_order_idx" ON "_pages_v_blocks_warranty_promise" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_warranty_promise_parent_id_idx" ON "_pages_v_blocks_warranty_promise" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_warranty_promise_path_idx" ON "_pages_v_blocks_warranty_promise" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_who_we_serve_items_order_idx" ON "_pages_v_blocks_who_we_serve_items" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_who_we_serve_items_parent_id_idx" ON "_pages_v_blocks_who_we_serve_items" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_who_we_serve_order_idx" ON "_pages_v_blocks_who_we_serve" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_who_we_serve_parent_id_idx" ON "_pages_v_blocks_who_we_serve" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_who_we_serve_path_idx" ON "_pages_v_blocks_who_we_serve" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_before_after_pairs_order_idx" ON "_pages_v_blocks_before_after_pairs" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_before_after_pairs_parent_id_idx" ON "_pages_v_blocks_before_after_pairs" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_before_after_pairs_before_idx" ON "_pages_v_blocks_before_after_pairs" USING btree ("before_id");
  CREATE INDEX "_pages_v_blocks_before_after_pairs_after_idx" ON "_pages_v_blocks_before_after_pairs" USING btree ("after_id");
  CREATE INDEX "_pages_v_blocks_before_after_order_idx" ON "_pages_v_blocks_before_after" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_before_after_parent_id_idx" ON "_pages_v_blocks_before_after" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_before_after_path_idx" ON "_pages_v_blocks_before_after" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_certificates_items_order_idx" ON "_pages_v_blocks_certificates_items" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_certificates_items_parent_id_idx" ON "_pages_v_blocks_certificates_items" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_certificates_items_image_idx" ON "_pages_v_blocks_certificates_items" USING btree ("image_id");
  CREATE INDEX "_pages_v_blocks_certificates_order_idx" ON "_pages_v_blocks_certificates" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_certificates_parent_id_idx" ON "_pages_v_blocks_certificates" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_certificates_path_idx" ON "_pages_v_blocks_certificates" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_inspection_form_order_idx" ON "_pages_v_blocks_inspection_form" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_inspection_form_parent_id_idx" ON "_pages_v_blocks_inspection_form" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_inspection_form_path_idx" ON "_pages_v_blocks_inspection_form" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_faq_items_order_idx" ON "_pages_v_blocks_faq_items" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_faq_items_parent_id_idx" ON "_pages_v_blocks_faq_items" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_faq_order_idx" ON "_pages_v_blocks_faq" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_faq_parent_id_idx" ON "_pages_v_blocks_faq" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_faq_path_idx" ON "_pages_v_blocks_faq" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_cta_buttons_order_idx" ON "_pages_v_blocks_cta_buttons" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_cta_buttons_parent_id_idx" ON "_pages_v_blocks_cta_buttons" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_cta_order_idx" ON "_pages_v_blocks_cta" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_cta_parent_id_idx" ON "_pages_v_blocks_cta" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_cta_path_idx" ON "_pages_v_blocks_cta" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_text_blocks_paragraphs_order_idx" ON "_pages_v_blocks_text_blocks_paragraphs" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_text_blocks_paragraphs_parent_id_idx" ON "_pages_v_blocks_text_blocks_paragraphs" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_text_blocks_order_idx" ON "_pages_v_blocks_text_blocks" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_text_blocks_parent_id_idx" ON "_pages_v_blocks_text_blocks" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_text_blocks_path_idx" ON "_pages_v_blocks_text_blocks" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_contact_details_order_idx" ON "_pages_v_blocks_contact_details" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_contact_details_parent_id_idx" ON "_pages_v_blocks_contact_details" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_contact_details_path_idx" ON "_pages_v_blocks_contact_details" USING btree ("_path");
  CREATE INDEX "_pages_v_parent_idx" ON "_pages_v" USING btree ("parent_id");
  CREATE INDEX "_pages_v_version_version_slug_idx" ON "_pages_v" USING btree ("version_slug");
  CREATE INDEX "_pages_v_version_version_category_idx" ON "_pages_v" USING btree ("version_category_id");
  CREATE INDEX "_pages_v_version_version_path_idx" ON "_pages_v" USING btree ("version_path");
  CREATE INDEX "_pages_v_version_version_updated_at_idx" ON "_pages_v" USING btree ("version_updated_at");
  CREATE INDEX "_pages_v_version_version_created_at_idx" ON "_pages_v" USING btree ("version_created_at");
  CREATE INDEX "_pages_v_version_version_deleted_at_idx" ON "_pages_v" USING btree ("version_deleted_at");
  CREATE INDEX "_pages_v_version_version__status_idx" ON "_pages_v" USING btree ("version__status");
  CREATE INDEX "_pages_v_created_at_idx" ON "_pages_v" USING btree ("created_at");
  CREATE INDEX "_pages_v_updated_at_idx" ON "_pages_v" USING btree ("updated_at");
  CREATE INDEX "_pages_v_latest_idx" ON "_pages_v" USING btree ("latest");
  CREATE INDEX "payload_jobs_log_order_idx" ON "payload_jobs_log" USING btree ("_order");
  CREATE INDEX "payload_jobs_log_parent_id_idx" ON "payload_jobs_log" USING btree ("_parent_id");
  CREATE INDEX "payload_jobs_completed_at_idx" ON "payload_jobs" USING btree ("completed_at");
  CREATE INDEX "payload_jobs_total_tried_idx" ON "payload_jobs" USING btree ("total_tried");
  CREATE INDEX "payload_jobs_has_error_idx" ON "payload_jobs" USING btree ("has_error");
  CREATE INDEX "payload_jobs_task_slug_idx" ON "payload_jobs" USING btree ("task_slug");
  CREATE INDEX "payload_jobs_queue_idx" ON "payload_jobs" USING btree ("queue");
  CREATE INDEX "payload_jobs_wait_until_idx" ON "payload_jobs" USING btree ("wait_until");
  CREATE INDEX "payload_jobs_processing_idx" ON "payload_jobs" USING btree ("processing");
  CREATE INDEX "payload_jobs_updated_at_idx" ON "payload_jobs" USING btree ("updated_at");
  CREATE INDEX "payload_jobs_created_at_idx" ON "payload_jobs" USING btree ("created_at");
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_categories_fk" FOREIGN KEY ("categories_id") REFERENCES "public"."categories"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_pages_fk" FOREIGN KEY ("pages_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "payload_locked_documents_rels_categories_id_idx" ON "payload_locked_documents_rels" USING btree ("categories_id");
  CREATE INDEX "payload_locked_documents_rels_pages_id_idx" ON "payload_locked_documents_rels" USING btree ("pages_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "categories" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_hero_secondary_actions" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_hero" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_trust_strip_items" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_trust_strip" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_why_choose_items" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_why_choose" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_our_difference_points" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_our_difference" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_how_it_works_steps" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_how_it_works" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_warranty_promise_highlights" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_warranty_promise" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_who_we_serve_items" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_who_we_serve" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_before_after_pairs" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_before_after" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_certificates_items" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_certificates" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_inspection_form" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_faq_items" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_faq" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_cta_buttons" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_cta" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_text_blocks_paragraphs" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_text_blocks" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_contact_details" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_hero_secondary_actions" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_hero" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_trust_strip_items" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_trust_strip" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_why_choose_items" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_why_choose" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_our_difference_points" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_our_difference" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_how_it_works_steps" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_how_it_works" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_warranty_promise_highlights" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_warranty_promise" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_who_we_serve_items" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_who_we_serve" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_before_after_pairs" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_before_after" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_certificates_items" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_certificates" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_inspection_form" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_faq_items" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_faq" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_cta_buttons" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_cta" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_text_blocks_paragraphs" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_text_blocks" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_contact_details" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "payload_jobs_log" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "payload_jobs" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "categories" CASCADE;
  DROP TABLE "pages_blocks_hero_secondary_actions" CASCADE;
  DROP TABLE "pages_blocks_hero" CASCADE;
  DROP TABLE "pages_blocks_trust_strip_items" CASCADE;
  DROP TABLE "pages_blocks_trust_strip" CASCADE;
  DROP TABLE "pages_blocks_why_choose_items" CASCADE;
  DROP TABLE "pages_blocks_why_choose" CASCADE;
  DROP TABLE "pages_blocks_our_difference_points" CASCADE;
  DROP TABLE "pages_blocks_our_difference" CASCADE;
  DROP TABLE "pages_blocks_how_it_works_steps" CASCADE;
  DROP TABLE "pages_blocks_how_it_works" CASCADE;
  DROP TABLE "pages_blocks_warranty_promise_highlights" CASCADE;
  DROP TABLE "pages_blocks_warranty_promise" CASCADE;
  DROP TABLE "pages_blocks_who_we_serve_items" CASCADE;
  DROP TABLE "pages_blocks_who_we_serve" CASCADE;
  DROP TABLE "pages_blocks_before_after_pairs" CASCADE;
  DROP TABLE "pages_blocks_before_after" CASCADE;
  DROP TABLE "pages_blocks_certificates_items" CASCADE;
  DROP TABLE "pages_blocks_certificates" CASCADE;
  DROP TABLE "pages_blocks_inspection_form" CASCADE;
  DROP TABLE "pages_blocks_faq_items" CASCADE;
  DROP TABLE "pages_blocks_faq" CASCADE;
  DROP TABLE "pages_blocks_cta_buttons" CASCADE;
  DROP TABLE "pages_blocks_cta" CASCADE;
  DROP TABLE "pages_blocks_text_blocks_paragraphs" CASCADE;
  DROP TABLE "pages_blocks_text_blocks" CASCADE;
  DROP TABLE "pages_blocks_contact_details" CASCADE;
  DROP TABLE "pages" CASCADE;
  DROP TABLE "_pages_v_blocks_hero_secondary_actions" CASCADE;
  DROP TABLE "_pages_v_blocks_hero" CASCADE;
  DROP TABLE "_pages_v_blocks_trust_strip_items" CASCADE;
  DROP TABLE "_pages_v_blocks_trust_strip" CASCADE;
  DROP TABLE "_pages_v_blocks_why_choose_items" CASCADE;
  DROP TABLE "_pages_v_blocks_why_choose" CASCADE;
  DROP TABLE "_pages_v_blocks_our_difference_points" CASCADE;
  DROP TABLE "_pages_v_blocks_our_difference" CASCADE;
  DROP TABLE "_pages_v_blocks_how_it_works_steps" CASCADE;
  DROP TABLE "_pages_v_blocks_how_it_works" CASCADE;
  DROP TABLE "_pages_v_blocks_warranty_promise_highlights" CASCADE;
  DROP TABLE "_pages_v_blocks_warranty_promise" CASCADE;
  DROP TABLE "_pages_v_blocks_who_we_serve_items" CASCADE;
  DROP TABLE "_pages_v_blocks_who_we_serve" CASCADE;
  DROP TABLE "_pages_v_blocks_before_after_pairs" CASCADE;
  DROP TABLE "_pages_v_blocks_before_after" CASCADE;
  DROP TABLE "_pages_v_blocks_certificates_items" CASCADE;
  DROP TABLE "_pages_v_blocks_certificates" CASCADE;
  DROP TABLE "_pages_v_blocks_inspection_form" CASCADE;
  DROP TABLE "_pages_v_blocks_faq_items" CASCADE;
  DROP TABLE "_pages_v_blocks_faq" CASCADE;
  DROP TABLE "_pages_v_blocks_cta_buttons" CASCADE;
  DROP TABLE "_pages_v_blocks_cta" CASCADE;
  DROP TABLE "_pages_v_blocks_text_blocks_paragraphs" CASCADE;
  DROP TABLE "_pages_v_blocks_text_blocks" CASCADE;
  DROP TABLE "_pages_v_blocks_contact_details" CASCADE;
  DROP TABLE "_pages_v" CASCADE;
  DROP TABLE "payload_jobs_log" CASCADE;
  DROP TABLE "payload_jobs" CASCADE;
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_categories_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_pages_fk";
  
  DROP INDEX "payload_locked_documents_rels_categories_id_idx";
  DROP INDEX "payload_locked_documents_rels_pages_id_idx";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "categories_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "pages_id";
  DROP TYPE "public"."enum_categories_kind";
  DROP TYPE "public"."enum_pages_blocks_hero_secondary_actions_kind";
  DROP TYPE "public"."enum_pages_blocks_hero_primary_action_kind";
  DROP TYPE "public"."enum_pages_blocks_warranty_promise_link_kind";
  DROP TYPE "public"."enum_pages_blocks_who_we_serve_items_link_kind";
  DROP TYPE "public"."enum_pages_blocks_cta_buttons_kind";
  DROP TYPE "public"."enum_pages_template";
  DROP TYPE "public"."enum_pages_status";
  DROP TYPE "public"."enum__pages_v_blocks_hero_secondary_actions_kind";
  DROP TYPE "public"."enum__pages_v_blocks_hero_primary_action_kind";
  DROP TYPE "public"."enum__pages_v_blocks_warranty_promise_link_kind";
  DROP TYPE "public"."enum__pages_v_blocks_who_we_serve_items_link_kind";
  DROP TYPE "public"."enum__pages_v_blocks_cta_buttons_kind";
  DROP TYPE "public"."enum__pages_v_version_template";
  DROP TYPE "public"."enum__pages_v_version_status";
  DROP TYPE "public"."enum_payload_jobs_log_task_slug";
  DROP TYPE "public"."enum_payload_jobs_log_state";
  DROP TYPE "public"."enum_payload_jobs_task_slug";`)
}
