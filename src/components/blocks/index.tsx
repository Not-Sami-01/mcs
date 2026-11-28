import { PAGE_BLOCKS } from '@/blocks/allowed';
import type { SiteChrome } from '@/cms/site-chrome';
import type { Service } from '@/payload-types';
import { getEditableSchema, getInitialValues } from '@/edit/registry';
import { AddSection, BlockTools } from '../edit/BlockTools';
import { Editable } from '../edit/Editable';

import { BeforeAfter } from './BeforeAfter';
import { Certificates } from './Certificates';
import { ContactDetails } from './ContactDetails';
import { Cta } from './Cta';
import { Faq } from './Faq';
import { Hero } from './Hero';
import { HowItWorks } from './HowItWorks';
import { InspectionForm } from './InspectionForm';
import { OurDifference } from './OurDifference';
import { Reviews } from './Reviews';
import { ServicesGrid } from './ServicesGrid';
import { TextBlocks } from './TextBlocks';
import { TrustStrip } from './TrustStrip';
import { WarrantyPromise } from './WarrantyPromise';
import { WhoWeServe } from './WhoWeServe';
import { WhyChoose } from './WhyChoose';
import type { PageBlock } from './types';

/**
 * One renderer per implemented block (`docs/CONTENT.md` §6). Blocks that wait
 * on Phase 5 collections are not in the Pages layout at all, so the default
 * branch only protects against data written by an older schema.
 */
export function BlockRenderer({
  blocks,
  chrome,
  services = [],
  edit,
}: {
  blocks: PageBlock[] | null | undefined;
  chrome: SiteChrome;
  /** Published services for auto/manual grids; resolved once per page. */
  services?: Service[];
  edit?: { pageId: number | string; updatedAt?: string | null };
}) {
  const blockTypes = PAGE_BLOCKS.map((block) => ({
    value: block.slug,
    label: blockLabel(block.slug),
  }));

  return (
    <>
      {(blocks ?? []).map((block, index) => {
        // Hidden sections stay in the draft but never reach public HTML.
        if (block.hidden && !edit) return null;

        const key = block.id ?? `${block.blockType}-${index}`;
        const rendered = renderBlock(block, chrome, services, key);
        const schema = edit ? getEditableSchema(block.blockType) : [];

        if (!edit || schema.length === 0) return rendered;

        const initialValues = getInitialValues(schema, block as unknown as Record<string, unknown>);

        return (
          <Editable
            key={key}
            label={blockLabel(block.blockType)}
            schema={schema}
            initialValues={initialValues}
            pageId={edit.pageId}
            blockId={typeof block.id === 'string' ? block.id : null}
            blockIndex={index}
            hidden={block.hidden === true}
            expectedUpdatedAt={edit.updatedAt ?? null}
            tools={
              <BlockTools
                pageId={edit.pageId}
                blockId={typeof block.id === 'string' ? block.id : null}
                index={index}
                total={blocks?.length ?? 0}
                hidden={block.hidden === true}
                blockTypes={blockTypes}
              />
            }
          >
            {rendered}
          </Editable>
        );
      })}

      {edit ? (
        <div className="mx-auto w-full max-w-6xl px-4 py-8">
          <AddSection
            pageId={edit.pageId}
            index={blocks?.length ?? 0}
            blockTypes={blockTypes}
            first={!blocks || blocks.length === 0}
          />
        </div>
      ) : null}
    </>
  );
}

function blockLabel(blockType: string): string {
  const spaced = blockType.replace(/([A-Z])/g, ' $1');
  return spaced.charAt(0).toUpperCase() + spaced.slice(1);
}

function renderBlock(block: PageBlock, chrome: SiteChrome, services: Service[], key: string) {
  switch (block.blockType) {
    case 'hero':
      return <Hero key={key} block={block} chrome={chrome} />;
    case 'trustStrip':
      return <TrustStrip key={key} block={block} />;
    case 'servicesGrid':
      return <ServicesGrid key={key} block={block} services={services} />;
    case 'whyChoose':
      return <WhyChoose key={key} block={block} />;
    case 'ourDifference':
      return <OurDifference key={key} block={block} />;
    case 'howItWorks':
      return <HowItWorks key={key} block={block} />;
    case 'warrantyPromise':
      return <WarrantyPromise key={key} block={block} chrome={chrome} />;
    case 'whoWeServe':
      return <WhoWeServe key={key} block={block} chrome={chrome} />;
    case 'beforeAfter':
      return <BeforeAfter key={key} block={block} />;
    case 'reviews':
      return <Reviews key={key} block={block} />;
    case 'certificates':
      return <Certificates key={key} block={block} />;
    case 'inspectionForm':
      return <InspectionForm key={key} block={block} />;
    case 'faq':
      return <Faq key={key} block={block} />;
    case 'cta':
      return <Cta key={key} block={block} chrome={chrome} />;
    case 'textBlocks':
      return <TextBlocks key={key} block={block} />;
    case 'contactDetails':
      return <ContactDetails key={key} block={block} chrome={chrome} />;
    default:
      return null;
  }
}
