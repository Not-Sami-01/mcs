/** The remaining two seeded neighbourhoods. */
export const moreLocations = [
  {
    name: 'Johar Town',
    slug: 'johar-town',
    type: 'area',
    intro:
      'Household pest control in Johar Town for termites, mosquitoes, cockroaches and rodents.',
    localNotes:
      'Johar Town is a family neighbourhood with a mix of houses, schools, clinics and busy commercial blocks. Kitchens and stores in larger homes tend to attract cockroaches and ants, especially where bins and pet food are kept close to back doors. Blocked drains, roof tanks and water stored in drums are the usual mosquito sources after rain, and schools and shops add their own food waste and delivery traffic. Termite activity often shows up around older wooden door frames and garden boundaries rather than in the main structure. We start with a room-by-room inspection, then agree a treatment plan that fits school runs, working hours and pets in the home.',
    neighbourhoods: [
      { name: 'Johar Town Block G' },
      { name: 'Johar Town Block H' },
      { name: 'Expo Centre area' },
      { name: 'Maulana Shaukat Ali Road' },
    ],
    commonPests: [
      { pest: 'Cockroaches in kitchens and store rooms' },
      { pest: 'Mosquitoes from stored water and blocked drains' },
      { pest: 'Termites around door frames and garden boundaries' },
    ],
    faqs: [
      {
        question: 'Do you treat houses with children and pets?',
        answer:
          'Yes. We agree where bait and traps go, keep applications away from reach, and give you a re-entry time before the visit ends.',
      },
      {
        question: 'Can you inspect a school or clinic?',
        answer:
          'We can survey schools, clinics and offices in the area. Work is scheduled outside peak hours where possible, with a documented plan for the site.',
      },
      {
        question: 'Why do mosquitoes return every year?',
        answer:
          'Standing water and blocked drainage restart the breeding cycle each warm season. Treatment helps now; emptying and covering water sources keeps it down.',
      },
    ],
    seo: {
      metaTitle: 'Pest Control in Johar Town',
      metaDescription:
        'Household pest control in Johar Town: termites, mosquitoes, cockroaches and rodents.',
    },
  },
  {
    name: 'Model Town',
    slug: 'model-town',
    type: 'area',
    intro:
      'Pest control for older Model Town homes, including termite inspection and rodent exclusion.',
    localNotes:
      'Model Town’s older houses, mature trees and original woodwork create conditions that newer colonies rarely see. Roof timbers, cupboards and skirting that have been through decades of monsoon damp are prime termite territory, and cracked plinths or old drainage lines let rodents into stores and kitchens. Tree cover and shaded courtyards also give ants, lizards and mosquitoes reliable shelter. These homes often need a slower inspection: we look behind fixed furniture, in roof spaces and along boundary walls before recommending a method. The plan respects original finishes, keeps applications away from children and pets, and sets a clear follow-up so the result can be checked rather than assumed.',
    neighbourhoods: [
      { name: 'Model Town Link Road' },
      { name: 'Central Park' },
      { name: 'Block C' },
      { name: 'Block D' },
    ],
    commonPests: [
      { pest: 'Termites in roof timbers and old cupboards' },
      { pest: 'Rodents in cracked plinths and drainage lines' },
      { pest: 'Ants and lizards around shaded courtyards' },
    ],
    faqs: [
      {
        question: 'Why do older homes need a longer inspection?',
        answer:
          'Decades of repairs and extensions hide pipe routes, voids and previous treatments. A slower survey finds the actual entry and harbourage points.',
      },
      {
        question: 'Will treatment damage original woodwork?',
        answer:
          'The method is chosen for the finish and condition of the wood. We explain what will be applied and test in a small area where needed.',
      },
      {
        question: 'Can rodents be kept out without poison?',
        answer:
          'Exclusion — sealing gaps and repairing drains — is the lasting fix. Baiting and trapping reduce the current population while proofing is completed.',
      },
    ],
    seo: {
      metaTitle: 'Pest Control in Model Town Lahore',
      metaDescription:
        'Pest control for older Model Town homes, including termite inspection and rodent exclusion.',
    },
  },
] as const;
