/** Lahore city plus the first two seeded neighbourhoods. */
export const locations = [
  {
    name: 'Lahore',
    slug: 'lahore',
    type: 'city',
    intro: 'City-wide pest control for homes, shops, offices and construction sites across Lahore.',
    localNotes:
      'Lahore mixes dense older neighbourhoods with fast-growing housing schemes and commercial corridors, and each brings a different pest problem. In older houses, damp woodwork and mature trees make termite and rodent inspections a routine need. Newer builds often call us for pre-construction termite treatment before the foundation is backfilled. During the humid months, blocked drains and stored water around rooftops and courtyards create mosquito breeding, while shared walls and service shafts help cockroaches move between units. Our teams work across the city and plan each visit around the property type, access, and the pest confirmed during inspection. We explain the treatment, the safety precautions and the follow-up before work begins.',
    neighbourhoods: [
      { name: 'DHA Lahore' },
      { name: 'Gulberg' },
      { name: 'Johar Town' },
      { name: 'Model Town' },
      { name: 'Allama Iqbal Town' },
    ],
    commonPests: [
      { pest: 'Subterranean termites in older woodwork' },
      { pest: 'Dengue and Culex mosquitoes after rain' },
      { pest: 'Rats and mice around stores and drains' },
      { pest: 'Cockroaches in shared kitchens and shafts' },
    ],
    faqs: [
      {
        question: 'Do you cover all of Lahore?',
        answer:
          'We cover Lahore city and the neighbourhoods listed on this site. Share the area and property type when you enquire so we can confirm access and timing.',
      },
      {
        question: 'How quickly can a technician visit?',
        answer:
          'Timing depends on the pest and the route. Inspection requests are usually scheduled within a few working days; urgent commercial work is discussed case by case.',
      },
      {
        question: 'Do you work with builders?',
        answer:
          'Yes. Pre-construction termite treatment is planned around the foundation and backfill stage, so share the site schedule early.',
      },
    ],
    seo: {
      metaTitle: 'Pest Control in Lahore',
      metaDescription:
        'City-wide pest control coverage, common Lahore pests and the neighbourhoods our teams serve.',
    },
  },
  {
    name: 'DHA Lahore',
    slug: 'dha-lahore',
    type: 'area',
    intro:
      'Termite, mosquito and rodent treatment for houses and construction sites in DHA Lahore.',
    localNotes:
      'DHA Lahore covers large residential plots, new construction and wide landscaped streets. On newer builds, the main termite risk arrives before anyone moves in: soil that is not treated at foundation stage can leave concealed galleries under floors and boundary walls. Mature gardens and irrigated lawns also hold moisture that termites and rodents like. After monsoon rain, low corners, planters and unused fountains collect water and become mosquito breeding sites, while boundary walls and garage stores give rats sheltered routes. We inspect the plot as a whole rather than only the rooms in use, then agree a treatment and follow-up plan that fits occupied family homes and ongoing construction work.',
    neighbourhoods: [
      { name: 'DHA Phase 5' },
      { name: 'DHA Phase 6' },
      { name: 'DHA Phase 8' },
      { name: 'Y Block commercial area' },
    ],
    commonPests: [
      { pest: 'Termites in new-build floors and boundary walls' },
      { pest: 'Mosquitoes breeding in planters and drains' },
      { pest: 'Rodents in garage stores and boundary walls' },
    ],
    faqs: [
      {
        question: 'Can you treat a house that is still under construction?',
        answer:
          'Yes. Pre-construction soil treatment is most effective at the foundation and backfill stage. Share the drawings and site schedule before booking.',
      },
      {
        question: 'Do you treat lawns and planters?',
        answer:
          'We inspect irrigation and standing water around lawns and planters. Treatment is limited to safe, labelled applications and drainage advice.',
      },
      {
        question: 'Is a termite inspection needed on a new house?',
        answer:
          'A new build is not automatically protected. An inspection and the treatment record from the contractor are the only way to know what was applied.',
      },
    ],
    seo: {
      metaTitle: 'Pest Control in DHA Lahore',
      metaDescription:
        'Termite, rodent and mosquito treatment for DHA Lahore homes, with local notes and booking details.',
    },
  },
  {
    name: 'Gulberg',
    slug: 'gulberg',
    type: 'area',
    intro:
      'Pest control for Gulberg apartments, offices and restaurants, including cockroach and rodent work.',
    localNotes:
      'Gulberg is a busy mix of apartments, offices, clinics, restaurants and older residential streets. Shared buildings create shared pest problems: cockroaches move through service shafts, drainage and delivery areas, and a single untreated kitchen can keep re-seeding the floors above. Restaurants and food stores bring rodent pressure into loading bays and bin areas, while older trees and wall cavities give lizards and ants shelter. Because many premises cannot close for long, visits are planned around trading hours and quiet periods. We document the areas treated and the follow-up date so building managers and restaurant teams can act on the recommendations.',
    neighbourhoods: [
      { name: 'Main Boulevard' },
      { name: 'MM Alam Road' },
      { name: 'Liberty Market' },
      { name: 'Gulberg III' },
    ],
    commonPests: [
      { pest: 'Cockroaches in shared kitchens and service shafts' },
      { pest: 'Rodents around loading bays and waste storage' },
      { pest: 'Ants in offices and ground-floor units' },
    ],
    faqs: [
      {
        question: 'Can you treat a restaurant without closing it?',
        answer:
          'Usually yes. Work is scheduled around trading hours, with kitchen areas cleared for the agreed window and a re-entry time confirmed on site.',
      },
      {
        question: 'Who coordinates with the building manager?',
        answer:
          'For shared buildings we ask for one point of contact. Access to shafts and common areas needs the manager’s approval before the visit.',
      },
      {
        question: 'Do you provide treatment records for inspections?',
        answer:
          'Yes. Commercial visits can be documented with the areas treated, products used and follow-up recommendations for your records.',
      },
    ],
    seo: {
      metaTitle: 'Pest Control in Gulberg Lahore',
      metaDescription:
        'Pest control for Gulberg homes, offices and restaurants, including cockroach and rodent treatment.',
    },
  },
] as const;
