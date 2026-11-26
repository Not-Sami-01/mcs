/** Quote, Free Inspection and the two legal pages. */
export const pageGroupB = [
  {
    title: 'Get a Quote',
    slug: 'get-a-quote',
    template: 'form',
    seo: {
      metaTitle: 'Get a Pest Control Quote',
      metaDescription:
        'Tell us about the property and the pest problem to receive a clear, itemised quote.',
    },
    layout: [
      {
        blockType: 'hero',
        eyebrow: 'Get a quote',
        headline: 'A clear quote, after we understand the job',
        subheadline:
          'Pest control is priced on the property and the confirmed pest. Start with an inspection so the quote matches the work.',
        primaryAction: {
          label: 'Book an inspection',
          kind: 'inspection',
          href: '/free-inspection',
        },
        secondaryActions: [{ label: 'Contact us', kind: 'link', href: '/contact-us' }],
      },
      {
        blockType: 'textBlocks',
        headline: 'What your quote includes',
        paragraphs: [
          {
            paragraph:
              'The written quote names the pest, the areas to be treated, the method, the number of visits and the price. It also states the preparation you need to do and the follow-up included.',
          },
          {
            paragraph:
              'If the inspection finds a different pest or a larger area, we revise the quote before treatment. You will not be asked to approve an open-ended charge.',
          },
        ],
      },
      {
        blockType: 'howItWorks',
        headline: 'From enquiry to quote',
        steps: [
          {
            cardTitle: 'Send the details',
            cardBody: 'Tell us the pest, property type and area, with photos if useful.',
          },
          {
            cardTitle: 'Book the inspection',
            cardBody: 'Choose a time that suits you. We confirm the visit and access needs.',
          },
          {
            cardTitle: 'On-site assessment',
            cardBody: 'The technician confirms the pest and the areas that need work.',
          },
          {
            cardTitle: 'Written quote',
            cardBody: 'You receive the scope, method, visits and price before deciding.',
          },
          {
            cardTitle: 'Book the work',
            cardBody: 'Approve the quote and we schedule treatment and follow-up.',
          },
        ],
      },
      {
        blockType: 'inspectionForm',
        headline: 'Start with the inspection',
        shortParagraph:
          'A free inspection gives us the information to quote accurately and gives you a chance to meet the team before committing.',
      },
      {
        blockType: 'cta',
        headline: 'Have a question before booking?',
        cardBody: 'Call or message us and we will help you choose the right next step.',
        buttons: [
          { label: 'Contact us', kind: 'link', href: '/contact-us' },
          { label: 'WhatsApp us', kind: 'whatsapp', href: '/contact-us' },
        ],
      },
    ],
  },
  {
    title: 'Free Inspection',
    slug: 'free-inspection',
    template: 'form',
    seo: {
      metaTitle: 'Free Pest Inspection in Lahore',
      metaDescription:
        'Request a free inspection so a technician can identify the pest and recommend the right treatment.',
    },
    layout: [
      {
        blockType: 'hero',
        eyebrow: 'Free inspection',
        headline: 'Find out what you are dealing with',
        subheadline:
          'A technician checks the property, confirms the pest and explains the treatment options. No obligation to book the work.',
        primaryAction: { label: 'Contact us', kind: 'link', href: '/contact-us' },
        secondaryActions: [{ label: 'WhatsApp us', kind: 'whatsapp', href: '/contact-us' }],
      },
      {
        blockType: 'textBlocks',
        headline: 'What the inspection covers',
        paragraphs: [
          {
            paragraph:
              'We look at the affected rooms and the routes around them: kitchens, stores, service shafts, roof spaces, boundary walls and drainage. For termites we check timber, moisture and construction details. For rodents we trace entry points and food sources.',
          },
          {
            paragraph:
              'You get a plain explanation of what we found, what needs treating and what can wait. If the problem is not pest related, we will say so rather than sell a treatment.',
          },
        ],
      },
      {
        blockType: 'inspectionForm',
        headline: 'Request your inspection',
        shortParagraph:
          'Send the property area, the pest you suspect and a time that works for you. We will confirm the appointment and any access requirements.',
      },
      {
        blockType: 'faq',
        headline: 'Inspection questions',
        items: [
          {
            question: 'Is the inspection free?',
            answer:
              'The site offers a free inspection for properties in our listed areas. Confirm the scope when booking; travel outside those areas may affect it.',
          },
          {
            question: 'How long does it take?',
            answer:
              'Most household inspections take 30 to 60 minutes. Larger commercial sites need more time, which we agree in advance.',
          },
          {
            question: 'Do I have to book treatment afterwards?',
            answer:
              'No. The inspection is to establish the facts. You can take the findings away and decide later.',
          },
        ],
      },
    ],
  },
  {
    title: 'Terms and Conditions',
    slug: 'terms-and-conditions',
    template: 'legal',
    isLegal: true,
    seo: {
      metaTitle: 'Terms and Conditions',
      metaDescription:
        'Terms covering inspections, quotations, treatment and payments for MCS services.',
    },
    layout: [
      {
        blockType: 'textBlocks',
        headline: 'Terms and Conditions',
        paragraphs: [
          {
            paragraph:
              'Sample terms for this demo site. These are not legal advice and must be replaced by the client’s lawyer-reviewed terms before launch.',
          },
          {
            paragraph:
              '1. Inspections and quotations. An inspection establishes the pest and the recommended treatment. A quotation is valid for the period stated on it. Work begins only after the customer approves the quotation.',
          },
          {
            paragraph:
              '2. Access and preparation. The customer provides safe access to the agreed areas and completes the preparation instructions. We may reschedule if conditions on site make the treatment unsafe or ineffective.',
          },
          {
            paragraph:
              '3. Payment and cancellation. Payment terms, deposits and cancellation notice are stated on the quotation. Missed appointments may attract a call-out charge where the quotation says so.',
          },
          {
            paragraph:
              '4. Safety and aftercare. Customers must follow re-entry times, storage instructions and aftercare guidance. We are not responsible for damage caused by untreated areas, structural defects or instructions that were not followed.',
          },
          {
            paragraph:
              '5. Liability and complaints. Liability is limited as set out in the final client-approved terms. Complaints should be raised through the contact details on this site so they can be assessed promptly.',
          },
        ],
      },
    ],
  },
  {
    title: 'Privacy Policy',
    slug: 'privacy-policy',
    template: 'legal',
    isLegal: true,
    seo: {
      metaTitle: 'Privacy Policy',
      metaDescription:
        'How Malaysian Care System collects, uses and protects enquiry and customer information.',
    },
    layout: [
      {
        blockType: 'textBlocks',
        headline: 'Privacy Policy',
        paragraphs: [
          {
            paragraph:
              'Sample policy for this demo site. It is not legal advice and must be replaced by the client’s lawyer-reviewed policy before launch.',
          },
          {
            paragraph:
              '1. Information we collect. When you contact us we may collect your name, phone number, email address, property area, the pest problem you describe and any photos you choose to send.',
          },
          {
            paragraph:
              '2. How we use it. We use the information to respond to your enquiry, arrange inspections, prepare quotations, carry out and follow up treatment, and keep service records.',
          },
          {
            paragraph:
              '3. Sharing. We do not sell personal information. Information is shared only with staff and service providers who need it to deliver the work, or where the law requires it.',
          },
          {
            paragraph:
              '4. Retention and security. Enquiry and customer records are kept only as long as needed for the service and legal obligations. Access is limited to authorised staff.',
          },
          {
            paragraph:
              '5. Cookies and analytics. This site may use essential cookies and, once configured, privacy-respecting analytics. You can control cookies in your browser settings.',
          },
          {
            paragraph:
              '6. Contact. Questions about this policy or a request to access or correct your information should go through the contact details on this site.',
          },
        ],
      },
    ],
  },
] as const;
