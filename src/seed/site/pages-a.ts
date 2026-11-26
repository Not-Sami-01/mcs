/** About, Warranty and Contact pages. */
export const pageGroupA = [
  {
    title: 'About Us',
    slug: 'about-us',
    template: 'standard',
    seo: {
      metaTitle: 'About Us | Lahore Pest Control',
      metaDescription:
        'Meet the team behind MCS, how we approach pest problems and the standards we hold ourselves to on every visit.',
    },
    layout: [
      {
        blockType: 'hero',
        eyebrow: 'About us',
        headline: 'A pest control team that explains its work',
        subheadline:
          'Malaysian Care System works across Lahore on termites, cockroaches, rodents, mosquitoes, bed bugs and general pest problems.',
        primaryAction: {
          label: 'Book a free inspection',
          kind: 'inspection',
          href: '/free-inspection',
        },
        secondaryActions: [{ label: 'Contact us', kind: 'link', href: '/contact-us' }],
      },
      {
        blockType: 'textBlocks',
        headline: 'How we work',
        paragraphs: [
          {
            paragraph:
              'We start with the pest, not the product. A technician inspects the property, confirms what is causing the problem and explains what needs treating. You get the plan, the preparation steps and the price before work begins.',
          },
          {
            paragraph:
              'On site we keep the work area contained, explain the safety precautions and confirm when the space can be used again. After treatment, we agree what to check and when. If something is not clear, you can ask — a good visit should leave you knowing what was done and why.',
          },
          {
            paragraph:
              'We do not claim to be everything to everyone. We focus on the pests listed on this site and on the Lahore neighbourhoods we can serve properly. When a job needs a different specialist, we say so instead of stretching our scope.',
          },
        ],
      },
      {
        blockType: 'whyChoose',
        headline: 'What you can expect',
        items: [
          {
            icon: 'honest',
            cardTitle: 'Straight answers',
            cardBody:
              'If treatment is not needed yet, we will say that and explain what to monitor.',
          },
          {
            icon: 'scope',
            cardTitle: 'A clear scope',
            cardBody: 'The quotation names the areas, method and number of visits included.',
          },
          {
            icon: 'safety',
            cardTitle: 'Safety on site',
            cardBody:
              'Products are applied by label, and we brief you on re-entry and storage precautions.',
          },
          {
            icon: 'records',
            cardTitle: 'Records that help',
            cardBody:
              'Commercial visits can be documented for your own safety and facilities files.',
          },
        ],
      },
      {
        blockType: 'cta',
        headline: 'Have a pest problem to discuss?',
        cardBody: 'Tell us what you have seen and we will explain the next useful step.',
        buttons: [
          { label: 'Contact us', kind: 'link', href: '/contact-us' },
          { label: 'Free inspection', kind: 'inspection', href: '/free-inspection' },
        ],
      },
    ],
  },
  {
    title: 'Warranty',
    slug: 'warranty',
    template: 'standard',
    seo: {
      metaTitle: 'Pest Control Warranty',
      metaDescription:
        'How our service warranty works, what it covers and how to raise a claim after treatment.',
    },
    layout: [
      {
        blockType: 'hero',
        eyebrow: 'Warranty',
        headline: 'Our service warranty, in plain language',
        subheadline:
          'Cover depends on the treatment and the conditions recorded during inspection. These are sample terms for this demo site and must be replaced with the client-approved warranty.',
        primaryAction: { label: 'Contact us', kind: 'link', href: '/contact-us' },
      },
      {
        blockType: 'textBlocks',
        headline: 'What the warranty covers',
        paragraphs: [
          {
            paragraph:
              'Sample term: the warranty covers a return of the target pest in the treated areas within the period written on your quotation. It does not cover a new infestation, a different pest, or areas that were not treated.',
          },
          {
            paragraph:
              'Sample term: the customer must follow the preparation and aftercare instructions, allow the agreed follow-up visit, and report renewed activity promptly. Structural repairs, replacement of damaged timber and unrelated cleaning are not included.',
          },
          {
            paragraph:
              'Sample term: to make a claim, contact us with the quotation number, the treatment date and a description of what you have seen. We will arrange an assessment. This page is a placeholder and is not a legal warranty until the client supplies the final terms.',
          },
        ],
      },
      {
        blockType: 'faq',
        headline: 'Warranty questions',
        items: [
          {
            question: 'Is every treatment covered?',
            answer:
              'No. One-off treatments, proofing work and some commercial jobs may carry different or no cover. The quotation states exactly what applies.',
          },
          {
            question: 'What voids the warranty?',
            answer:
              'Missed follow-up visits, untreated areas, new construction or renovation, and instructions that were not followed can affect cover. The final terms will list the exclusions.',
          },
          {
            question: 'How do I make a claim?',
            answer:
              'Contact us with your quotation number, treatment date and what you have seen. We will arrange an inspection before agreeing any retreatment.',
          },
          {
            question: 'How long does the cover last?',
            answer:
              'The period depends on the treatment. It is written on your quotation — check it before approving the work.',
          },
        ],
      },
      {
        blockType: 'cta',
        headline: 'Need to discuss a treatment?',
        cardBody: 'Send us the details and we will tell you what the next step is.',
        buttons: [{ label: 'Contact us', kind: 'link', href: '/contact-us' }],
      },
    ],
  },
  {
    title: 'Contact Us',
    slug: 'contact-us',
    template: 'standard',
    seo: {
      metaTitle: 'Contact MCS Lahore',
      metaDescription:
        'Call, WhatsApp or email Malaysian Care System to ask about a pest problem or book a visit.',
    },
    layout: [
      {
        blockType: 'hero',
        eyebrow: 'Contact',
        headline: 'Talk to us about the pest problem',
        subheadline:
          'Tell us what you have seen, where the property is and whether it is a home or commercial site. We will explain the next useful step.',
        primaryAction: { label: 'WhatsApp us', kind: 'whatsapp', href: '/contact-us' },
        secondaryActions: [
          { label: 'Book an inspection', kind: 'inspection', href: '/free-inspection' },
        ],
      },
      {
        blockType: 'contactDetails',
        headline: 'Contact details',
      },
      {
        blockType: 'textBlocks',
        headline: 'What to include in your message',
        paragraphs: [
          {
            paragraph:
              'Tell us the pest you are seeing, how long it has been there, the property type and the area of Lahore. Photos help if the pest or damage is visible, but do not put yourself at risk to take them.',
          },
          {
            paragraph:
              'For commercial sites, include the access constraints and the hours that suit you. For a termite enquiry, mention whether the building is under construction or occupied.',
          },
        ],
      },
      {
        blockType: 'faq',
        headline: 'Before you call',
        items: [
          {
            question: 'Can I get a price over the phone?',
            answer:
              'We can give a starting range for common jobs, but the confirmed price follows inspection because the method and area change the work.',
          },
          {
            question: 'Do you handle emergencies?',
            answer:
              'Urgent commercial situations are assessed case by case. Call us and we will tell you honestly whether we can attend at short notice.',
          },
          {
            question: 'Is the inspection really free?',
            answer:
              'The site lists a free inspection offer. Confirm the scope when you book — travel outside our listed areas may affect it.',
          },
        ],
      },
      {
        blockType: 'cta',
        headline: 'Prefer to book online?',
        cardBody: 'Use the inspection page to send the details we need to arrange a visit.',
        buttons: [{ label: 'Free inspection', kind: 'inspection', href: '/free-inspection' }],
      },
    ],
  },
] as const;
