import type { SiteChrome } from '@/cms/site-chrome';

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
}: {
  blocks: PageBlock[] | null | undefined;
  chrome: SiteChrome;
}) {
  return (
    <>
      {(blocks ?? []).map((block, index) => {
        const key = block.id ?? `${block.blockType}-${index}`;

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
      })}
    </>
  );
}
