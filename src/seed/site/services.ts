/** Eight core services for the demo site. Copy is original and claim-light. */
export const services = [
  {
    title: 'Termite Control',
    slug: 'termite-control',
    icon: 'termite',
    order: 1,
    shortDescription:
      'Inspection, pre-construction soil treatment and targeted control for termites in Lahore homes and buildings.',
    startingPrice: 15000,
    priceUnit: 'per treatment plan',
    signs: [
      { sign: 'Mud tubes along walls, skirting or foundations' },
      { sign: 'Hollow-sounding or bubbling paint on woodwork' },
      { sign: 'Flying insects with equal wings after rain' },
      { sign: 'Fine wood dust near furniture or door frames' },
      { sign: 'Doors and windows that suddenly stick' },
    ],
    treatmentSteps: [
      {
        title: 'Inspection and species check',
        body: 'We inspect active areas, woodwork, foundations and moisture points, then confirm whether termites — not damp or borers — are causing the damage.',
      },
      {
        title: 'Treatment plan and quote',
        body: 'You receive a written plan naming the treatment method, the areas covered, preparation steps and the price before any work starts.',
      },
      {
        title: 'Treatment',
        body: 'Depending on the finding, we use soil treatment, timber treatment or a targeted application. We explain the products and the safety precautions on site.',
      },
      {
        title: 'Follow-up',
        body: 'We agree a review point, check the treated areas and explain what to watch for. Structural repairs remain a separate job for a qualified contractor.',
      },
    ],
    faqs: [
      {
        question: 'Can termites be treated without moving out?',
        answer:
          'Most spot and timber treatments do not require you to leave. If a treatment needs vacating, we tell you before booking and explain the re-entry time in writing.',
      },
      {
        question: 'Do you treat new construction?',
        answer:
          'Yes. Pre-construction soil treatment is planned around the foundation and backfill stage. Share the drawings and site schedule so the visit lands at the right point.',
      },
      {
        question: 'Is the treatment guaranteed?',
        answer:
          'The warranty depends on the treatment and the conditions we record during inspection. The exact cover is written on your quotation and summarised on our warranty page.',
      },
    ],
    seo: {
      metaTitle: 'Termite Control in Lahore',
      metaDescription:
        'Pre- and post-construction termite treatment, inspection and prevention for Lahore properties.',
    },
  },
  {
    title: 'Cockroach Control',
    slug: 'cockroach-control',
    icon: 'cockroach',
    order: 2,
    shortDescription:
      'Gel bait, targeted spraying and entry-point sealing for cockroaches in kitchens, stores and service areas.',
    startingPrice: 6000,
    priceUnit: 'per visit',
    signs: [
      { sign: 'Droppings or smear marks in kitchen cupboards' },
      { sign: 'A musty smell in dark corners or under appliances' },
      { sign: 'Egg cases behind the fridge or under the sink' },
      { sign: 'Live insects after lights are switched on at night' },
    ],
    treatmentSteps: [
      {
        title: 'Source inspection',
        body: 'We check kitchens, drains, appliance gaps and shared walls to find harbourage and work out how the infestation is spreading.',
      },
      {
        title: 'Bait and targeted application',
        body: 'Gel bait is placed in cracks and hinges where cockroaches shelter. Targeted spray is limited to safe, non-food surfaces.',
      },
      {
        title: 'Entry and moisture advice',
        body: 'We point out gaps, damp areas and storage habits that let cockroaches return, and agree what your team should fix.',
      },
      {
        title: 'Review',
        body: 'A follow-up check confirms bait uptake and activity. Heavy infestations may need a second application, which we quote upfront.',
      },
    ],
    faqs: [
      {
        question: 'Do we need to empty the kitchen?',
        answer:
          'No. Clear food, utensils and worktops from the areas we name in advance. Cupboards can stay packed; we work around them.',
      },
      {
        question: 'Is gel bait safe around food?',
        answer:
          'Bait is applied in cracks and concealed spots, not on food-contact surfaces. We explain the precautions and keep the product label on site.',
      },
      {
        question: 'How soon will we see a difference?',
        answer:
          'Activity usually drops within days as bait is carried back to harbourage. A follow-up visit checks progress and tops up where needed.',
      },
    ],
    seo: {
      metaTitle: 'Cockroach Control in Lahore',
      metaDescription:
        'Kitchen-safe cockroach treatment using gel bait, targeted spraying and entry-point sealing.',
    },
  },
  {
    title: 'Bed Bug Control',
    slug: 'bed-bug-control',
    icon: 'bed-bug',
    order: 3,
    shortDescription:
      'Room-by-room bed bug treatment with preparation guidance, targeted application and a follow-up inspection.',
    startingPrice: 8000,
    priceUnit: 'per room',
    signs: [
      { sign: 'Small rust-coloured spots on mattress seams' },
      { sign: 'Bites in lines on arms, neck or legs' },
      { sign: 'Shed skins or live insects around the bed frame' },
      { sign: 'A sweet, musty smell in a heavily used bedroom' },
    ],
    treatmentSteps: [
      {
        title: 'Confirm the pest',
        body: 'We inspect seams, frames, headboards and nearby furniture. Bites alone are not proof, so we look for insects, eggs and faecal marks.',
      },
      {
        title: 'Preparation brief',
        body: 'You receive a short list: wash and bag bedding, clear floor space and leave treated rooms accessible. We do not ask you to move mattresses yourself.',
      },
      {
        title: 'Treatment',
        body: 'We treat seams, joints, frames and identified harbourage with the method suited to the room and furniture. Heat or steam may be used where appropriate.',
      },
      {
        title: 'Follow-up',
        body: 'A second inspection checks for survivors. Do not discard furniture before the follow-up; it can spread the problem and remove evidence.',
      },
    ],
    faqs: [
      {
        question: 'Do we have to throw away the mattress?',
        answer:
          'Usually not. Most mattresses and frames can be treated. We only advise disposal when the item is badly split or beyond treatment.',
      },
      {
        question: 'How many visits will it take?',
        answer:
          'Many rooms need one treatment and one follow-up. Heavy or multi-room cases may need a second application, which is priced before we start.',
      },
      {
        question: 'Can bed bugs come from hotels?',
        answer:
          'Yes. Luggage, clothing and second-hand furniture are common routes. Inspect hotel beds and wash travel clothes on a hot cycle as a precaution.',
      },
    ],
    seo: {
      metaTitle: 'Bed Bug Treatment in Lahore',
      metaDescription:
        'Mattress, frame and room treatment for bed bugs, with preparation guidance and a follow-up inspection.',
    },
  },
] as const;
