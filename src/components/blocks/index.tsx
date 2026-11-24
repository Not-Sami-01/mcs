import type { SiteChrome } from '@/cms/site-chrome';
import { getEditableFields } from '@/edit/registry';
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
  edit,
}: {
  blocks: PageBlock[] | null | undefined;
  chrome: SiteChrome;
  edit?: { pageId: number | string };
}) {
  return (
    <>
      {(blocks ?? []).map((block, index) => {
        const key = block.id ?? `${block.blockType}-${index}`;
        const rendered = renderBlock(block, chrome, key);
        const fields = edit ? getEditableFields(block.blockType) : [];

        if (!edit || fields.length === 0) return rendered;

        const source = block as unknown as Record<string, unknown>;
        const initialValues = Object.fromEntries(
          fields.map((field) => [
            field.name,
            typeof source[field.name] === 'string' || typeof source[field.name] === 'number'
              ? String(source[field.name])
              : '',
          ]),
        );

        return (
          <Editable
            key={key}
            label={blockLabel(block.blockType)}
            fields={fields}
            initialValues={initialValues}
            pageId={edit.pageId}
            blockId={typeof block.id === 'string' ? block.id : null}
            blockIndex={index}
          >
            {rendered}
          </Editable>
        );
      })}
    </>
  );
}

function blockLabel(blockType: string): string {
  const spaced = blockType.replace(/([A-Z])/g, ' $1');
  return spaced.charAt(0).toUpperCase() + spaced.slice(1);
}

function renderBlock(block: PageBlock, chrome: SiteChrome, key: string) {
  switch (block.blockType) {
    case 'hero':
      return <Hero key={key} block={block} chrome={chrome} />;
    case 'trustStrip':
      return <TrustStrip key={key} block={block} />;
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
