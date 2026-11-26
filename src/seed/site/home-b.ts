/** Home page blocks, part 2 (areas through the final call to action). */
export const homeBottom = [
  {
    blockType: 'textBlocks',
    headline: 'Serving Lahore neighbourhoods',
    paragraphs: [
      {
        paragraph:
          'We work across Lahore city, with local pages for DHA, Gulberg, Johar Town and Model Town. Each page carries the pests we see there and the services available, rather than a city name pasted into a template.',
      },
    ],
  },
  {
    blockType: 'cta',
    headline: 'Find pest control for your area',
    cardBody: 'Check local pest notes, the services available and the questions people ask nearby.',
    buttons: [{ label: 'View areas', kind: 'link', href: '/locations' }],
  },
  {
    blockType: 'inspectionForm',
    headline: 'Start with a free inspection',
    shortParagraph:
      'Tell us what you are seeing. A technician will check the property, confirm the pest and explain the options before you commit to treatment.',
  },
  {
    blockType: 'faq',
    headline: 'Questions we hear most',
    items: [
      {
        question: 'Do I need to leave the house during treatment?',
        answer:
          'Most treatments do not require you to leave. If a product or method needs the area vacated, we tell you before booking and confirm the re-entry time in writing.',
      },
      {
        question: 'How should I prepare for a visit?',
        answer:
          'Clear access to the affected rooms, store food away and keep children and pets out of the work area. For bed bugs or fumigation we send a short preparation list.',
      },
      {
        question: 'How long does a treatment take?',
        answer:
          'A standard household visit is usually a couple of hours. The inspection result and property size determine the exact time, which we confirm when booking.',
      },
      {
        question: 'What happens if the pest comes back?',
        answer:
          'Your quotation states the follow-up and warranty terms. If activity returns within that cover, contact us with the date and what you have seen so we can assess it.',
      },
      {
        question: 'Do you treat commercial premises?',
        answer:
          'Yes. Restaurants, offices, schools, clinics, shops and warehouses can be surveyed, with visits scheduled around operating hours where possible.',
      },
      {
        question: 'Are the products safe for children and pets?',
        answer:
          'Products are applied according to their labels, with bait and stations kept out of reach. We explain the precautions and re-entry time for every treatment.',
      },
    ],
  },
  {
    blockType: 'cta',
    headline: 'Ready to deal with the pest?',
    cardBody: 'Book a free inspection or send us a message with what you have seen.',
    buttons: [
      { label: 'Free inspection', kind: 'inspection', href: '/free-inspection' },
      { label: 'WhatsApp us', kind: 'whatsapp', href: '/contact-us' },
    ],
  },
] as const;
