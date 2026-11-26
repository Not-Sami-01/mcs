/** Home page blocks, part 1 (hero through who we serve). */
export const homeTop = [
  {
    blockType: 'hero',
    eyebrow: 'Malaysian Care System',
    headline: 'Pest control in Lahore, done properly',
    subheadline:
      'Inspection first, a written plan, and treatment that matches the pest. Serving homes, shops and commercial sites across Lahore.',
    primaryAction: {
      label: 'Book a free inspection',
      kind: 'inspection',
      href: '/free-inspection',
    },
    secondaryActions: [
      { label: 'Call our team', kind: 'call', href: '/contact-us' },
      { label: 'WhatsApp us', kind: 'whatsapp', href: '/contact-us' },
    ],
  },
  {
    blockType: 'trustStrip',
    items: [
      {
        statValue: '8',
        statLabel: 'Core pest services',
        proofNote: 'Counted from the eight published service pages on this site.',
      },
      {
        statValue: '6',
        statLabel: 'Pest Library guides',
        proofNote: 'Counted from the six published Pest Library articles.',
      },
      {
        statValue: '5',
        statLabel: 'Lahore areas listed',
        proofNote: 'Lahore city plus four published neighbourhood pages.',
      },
    ],
  },
  {
    blockType: 'servicesGrid',
    headline: 'What we treat',
    intro:
      'Every pest needs a different approach. Start with the problem you are seeing, then book an inspection so we can confirm it.',
    mode: 'auto',
  },
  {
    blockType: 'textBlocks',
    headline: 'Termites are the expensive problem',
    paragraphs: [
      {
        paragraph:
          'Termite damage is often hidden until a door sticks, paint bubbles or a skirting board crumbles. By then the colony has had months to work through timber and foundations.',
      },
      {
        paragraph:
          'Our inspection checks active areas, moisture points and construction details. Pre-construction soil treatment is planned around the foundation stage; occupied homes get a targeted plan instead.',
      },
    ],
  },
  {
    blockType: 'cta',
    headline: 'Not sure whether it is termites?',
    cardBody:
      'Book an inspection and we will confirm the pest, show you what we found and explain the options before any work starts.',
    buttons: [{ label: 'Termite control', kind: 'link', href: '/services/termite-control' }],
  },
  {
    blockType: 'whyChoose',
    headline: 'Why people call us back',
    items: [
      {
        icon: 'inspect',
        cardTitle: 'Inspection before treatment',
        cardBody:
          'We identify the pest and the source first, so the treatment targets the actual problem.',
      },
      {
        icon: 'plan',
        cardTitle: 'A written plan',
        cardBody: 'You see the method, areas covered, preparation steps and price before we begin.',
      },
      {
        icon: 'safety',
        cardTitle: 'Safety explained',
        cardBody:
          'We talk through the product, the re-entry time and what to keep away from treated areas.',
      },
      {
        icon: 'follow-up',
        cardTitle: 'A follow-up check',
        cardBody: 'Most jobs end with a review, so you know whether the treatment has worked.',
      },
    ],
  },
  {
    blockType: 'howItWorks',
    headline: 'How a visit works',
    steps: [
      {
        cardTitle: 'Tell us what you see',
        cardBody: 'Call, WhatsApp or request an inspection with the pest and property type.',
      },
      {
        cardTitle: 'Inspection',
        cardBody: 'A technician checks the property and confirms what is causing the problem.',
      },
      {
        cardTitle: 'Plan and quote',
        cardBody: 'You receive the method, areas, preparation and price in writing.',
      },
      {
        cardTitle: 'Treatment',
        cardBody: 'The team treats the agreed areas and explains safety and re-entry.',
      },
      {
        cardTitle: 'Follow-up',
        cardBody: 'We check the result and tell you what to watch for next.',
      },
    ],
  },
  {
    blockType: 'textBlocks',
    headline: 'How pricing works',
    paragraphs: [
      {
        paragraph:
          'Pest control is priced after inspection because the method and area change the job. You receive a written quote before work begins, and we do not add surprise charges on the day.',
      },
      {
        paragraph:
          'Product pages show sample prices for standard packs. Service pages show a starting price where one is available. Your final quote is confirmed on site.',
      },
    ],
  },
  {
    blockType: 'warrantyPromise',
    headline: 'A warranty you can actually read',
    shortParagraph:
      'The cover depends on the treatment and what we record during inspection. We put the exact terms on your quotation and keep the warranty page short enough to check.',
    highlights: [
      { highlight: 'Written terms with every quotation' },
      { highlight: 'Follow-up visits stated upfront' },
      { highlight: 'A clear claims route if activity returns' },
    ],
    link: { label: 'Read the warranty', kind: 'link', href: '/warranty' },
  },
  {
    blockType: 'whoWeServe',
    headline: 'Who we work with',
    items: [
      {
        title: 'Homes',
        cardBody: 'Kitchens, bedrooms, lawns and stores — planned around family routines and pets.',
        link: { label: 'Home pest control', kind: 'link', href: '/contact-us' },
      },
      {
        title: 'Builders',
        cardBody: 'Pre-construction termite treatment scheduled around foundation and backfill.',
        link: { label: 'Talk to us', kind: 'link', href: '/contact-us' },
      },
      {
        title: 'Restaurants and hotels',
        cardBody: 'Kitchen, store and service-area work planned around trading hours.',
        link: { label: 'Commercial visit', kind: 'link', href: '/contact-us' },
      },
      {
        title: 'Schools and clinics',
        cardBody: 'Documented surveys and treatment windows that avoid peak hours.',
        link: { label: 'Request a survey', kind: 'link', href: '/contact-us' },
      },
      {
        title: 'Offices',
        cardBody: 'Shared kitchens, stores and service shafts treated with building access agreed.',
        link: { label: 'Office pest control', kind: 'link', href: '/contact-us' },
      },
      {
        title: 'Shops and warehouses',
        cardBody: 'Rodent stations, monitoring records and loading-bay checks for stock areas.',
        link: { label: 'Warehouse visit', kind: 'link', href: '/contact-us' },
      },
    ],
  },
] as const;
