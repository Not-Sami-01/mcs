/**
 * Sample catalogue. Rates are demonstration prices, not MCS's confirmed
 * price list; every product page says so in its safety/pricing note.
 */
export const products = [
  {
    title: 'Termite Treatment — Pre-Construction',
    slug: 'termite-pre-construction-treatment',
    featured: true,
    description: [
      {
        body: 'A planned soil treatment for new construction, scheduled around the foundation and backfill stage. The visit covers the areas marked on the site plan and records what was applied for the building file.',
      },
    ],
    howToUse: [
      {
        body: 'Share the drawings and construction schedule before booking. The site must be accessible, with the treatment area clear of stored material on the day.',
      },
    ],
    safetyInfo: [
      {
        body: 'Applied by trained technicians under the product label and method statement. Keep people and animals out of the treated area until the technician confirms re-entry. This listing is for a site survey request; the final rate depends on area and access.',
      },
    ],
    packSizes: [
      { label: '1 marla plot', sku: 'TERM-1M', rate: 12000, stockStatus: 'in_stock' },
      { label: '5 marla plot', sku: 'TERM-5M', rate: 28000, stockStatus: 'in_stock' },
      { label: '10 marla plot', sku: 'TERM-10M', rate: 48000, stockStatus: 'in_stock' },
    ],
    seo: {
      metaTitle: 'Pre-Construction Termite Treatment',
      metaDescription:
        'Sample pricing for pre-construction termite soil treatment on 1, 5 and 10 marla plots in Lahore.',
    },
  },
  {
    title: 'Cockroach Gel Bait Kit',
    slug: 'cockroach-gel-bait-kit',
    featured: true,
    description: [
      {
        body: 'A professional gel bait kit for cracks, hinges and concealed harbourage. Supplied with applicator tips and a placement guide for kitchens, stores and service areas.',
      },
    ],
    howToUse: [
      {
        body: 'Place small dabs where cockroaches shelter, not on food-contact surfaces. Do not spray over bait. Replace bait when it is consumed or dries out.',
      },
    ],
    safetyInfo: [
      {
        body: 'Keep out of reach of children and pets. Read the product label before use and wash hands after handling. If bait is swallowed, contact a doctor and take the label with you.',
      },
    ],
    packSizes: [
      { label: '1 syringe + tips', sku: 'ROACH-1', rate: 1800, stockStatus: 'in_stock' },
      { label: '3 syringes + tips', sku: 'ROACH-3', rate: 4800, stockStatus: 'in_stock' },
    ],
    seo: {
      metaTitle: 'Cockroach Gel Bait Kit',
      metaDescription:
        'Professional cockroach gel bait with applicator tips and placement guidance. Sample packs and prices.',
    },
  },
  {
    title: 'Rodent Bait Station Kit',
    slug: 'rodent-bait-station-kit',
    featured: false,
    description: [
      {
        body: 'Tamper-resistant stations for secured bait or traps along rodent routes. The kit includes labelled stations and a simple site map for recorded checks.',
      },
    ],
    howToUse: [
      {
        body: 'Fix stations along walls and behind equipment, out of reach of children and pets. Check on a fixed schedule, record activity and refill only as the label allows.',
      },
    ],
    safetyInfo: [
      {
        body: 'Bait, if used, must be placed only inside locked stations and handled by a trained person. Remove carcasses with gloves. Keep the station key away from children.',
      },
    ],
    packSizes: [
      { label: '2 stations', sku: 'ROD-2', rate: 3600, stockStatus: 'in_stock' },
      { label: '6 stations', sku: 'ROD-6', rate: 9600, stockStatus: 'low' },
    ],
    seo: {
      metaTitle: 'Rodent Bait Station Kit',
      metaDescription:
        'Tamper-resistant rodent bait stations with labels and a check sheet. Sample packs and prices.',
    },
  },
  {
    title: 'Mosquito Larvicide Pack',
    slug: 'mosquito-larvicide-pack',
    featured: false,
    description: [
      {
        body: 'A measured larvicide pack for non-drinking water that cannot be drained or covered, such as drains, planters and disused tanks.',
      },
    ],
    howToUse: [
      {
        body: 'Apply only to non-drinking water at the label rate. Never treat water used for drinking, cooking or bathing. Re-check treated sites after rain.',
      },
    ],
    safetyInfo: [
      {
        body: 'Not for drinking-water containers. Keep away from fish ponds and ornamental water with sensitive aquatic life unless the label permits it. Store sealed and out of reach of children.',
      },
    ],
    packSizes: [
      { label: '250 g', sku: 'MOS-250', rate: 1400, stockStatus: 'in_stock' },
      { label: '1 kg', sku: 'MOS-1000', rate: 4200, stockStatus: 'in_stock' },
    ],
    seo: {
      metaTitle: 'Mosquito Larvicide Pack',
      metaDescription:
        'Measured larvicide for non-drinking standing water, with application and safety guidance.',
    },
  },
  {
    title: 'Bed Bug Treatment Kit',
    slug: 'bed-bug-treatment-kit',
    featured: false,
    description: [
      {
        body: 'A room treatment kit for seams, frames and identified harbourage, supplied with preparation instructions and a follow-up checklist.',
      },
    ],
    howToUse: [
      {
        body: 'Wash and bag bedding, clear the floor and follow the preparation sheet before application. Treat seams and joints, not just the mattress surface. Keep the room ventilated and follow the re-entry time.',
      },
    ],
    safetyInfo: [
      {
        body: 'For use by a trained technician. Do not apply to occupied bedding. Pregnant people, infants and pets should stay out of the treated room for the stated period.',
      },
    ],
    packSizes: [
      { label: '1 room', sku: 'BED-1', rate: 6500, stockStatus: 'in_stock' },
      { label: '3 rooms', sku: 'BED-3', rate: 16500, stockStatus: 'in_stock' },
    ],
    seo: {
      metaTitle: 'Bed Bug Treatment Kit',
      metaDescription:
        'Room treatment kit for bed bug seams and frames, with preparation and follow-up guidance.',
    },
  },
  {
    title: 'General Disinfection Service',
    slug: 'general-disinfection-service',
    featured: true,
    description: [
      {
        body: 'A scheduled disinfection visit for homes, offices and small commercial spaces, covering agreed high-touch surfaces and shared areas.',
      },
    ],
    howToUse: [
      {
        body: 'Book after a walkthrough so the treated areas are listed. Clear personal items from surfaces before the team arrives and allow the stated drying time.',
      },
    ],
    safetyInfo: [
      {
        body: 'Disinfection does not replace pest control or cleaning. The product is applied according to its label; people with respiratory sensitivities should ask about the product before booking.',
      },
    ],
    packSizes: [
      { label: 'Up to 1,000 sq ft', sku: 'DIS-1000', rate: 9000, stockStatus: 'in_stock' },
      { label: 'Up to 2,500 sq ft', sku: 'DIS-2500', rate: 18000, stockStatus: 'in_stock' },
    ],
    seo: {
      metaTitle: 'General Disinfection Service',
      metaDescription:
        'Scheduled disinfection for homes, offices and small commercial spaces. Sample sizes and prices.',
    },
  },
] as const;
