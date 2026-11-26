/**
 * Site-wide globals for the demo content set (`content-plan.md`).
 *
 * Contact facts are obvious placeholders, not MCS's real numbers. Replace them
 * in Site Settings before launch. Keeping every value here (rather than in
 * components) follows the same rule as the rest of the site.
 */

export const siteSettings = {
  companyName: 'Malaysian Care System (MCS)',
  phones: [{ label: 'Office', number: '0300 0000000' }],
  whatsappNumber: '923000000000',
  email: 'hello@example.com',
  address: 'Sample office address — Lahore, Pakistan',
  workingHours: 'Mon–Sat, 9:00 am – 6:00 pm',
  timezone: 'Asia/Karachi',
  socialLinks: [],
};

export const navigation = {
  headerItems: [
    { label: 'Home', href: '/' },
    { label: 'About Us', href: '/about-us' },
    {
      label: 'Services',
      href: '/services',
      children: [
        { label: 'Termite Control', href: '/services/termite-control' },
        { label: 'Cockroach Control', href: '/services/cockroach-control' },
        { label: 'Bed Bug Control', href: '/services/bed-bug-control' },
        { label: 'Rodent Control', href: '/services/rodent-control' },
        { label: 'Mosquito Control', href: '/services/mosquito-control' },
        { label: 'Fumigation', href: '/services/fumigation' },
      ],
    },
    { label: 'Products', href: '/products' },
    { label: 'Locations', href: '/locations' },
    { label: 'Warranty', href: '/warranty' },
    { label: 'Pest Library', href: '/pest-library' },
    { label: 'Contact Us', href: '/contact-us' },
  ],
  headerButtons: [
    { label: 'Free Inspection', kind: 'inspection', href: '/free-inspection' },
    { label: 'Get a Quote', kind: 'link', href: '/get-a-quote' },
  ],
  footerColumns: [
    {
      title: 'Company',
      links: [
        { label: 'About Us', href: '/about-us' },
        { label: 'Our Services', href: '/services' },
        { label: 'Pest Library', href: '/pest-library' },
        { label: 'Contact Us', href: '/contact-us' },
      ],
    },
    {
      title: 'Services',
      links: [
        { label: 'Termite Control', href: '/services/termite-control' },
        { label: 'Cockroach Control', href: '/services/cockroach-control' },
        { label: 'Rodent Control', href: '/services/rodent-control' },
        { label: 'Mosquito Control', href: '/services/mosquito-control' },
        { label: 'Bed Bug Control', href: '/services/bed-bug-control' },
        { label: 'Fumigation', href: '/services/fumigation' },
      ],
    },
    {
      title: 'Areas',
      links: [
        { label: 'Lahore', href: '/locations/lahore' },
        { label: 'DHA Lahore', href: '/locations/lahore/dha-lahore' },
        { label: 'Gulberg', href: '/locations/lahore/gulberg' },
        { label: 'Johar Town', href: '/locations/lahore/johar-town' },
        { label: 'Model Town', href: '/locations/lahore/model-town' },
      ],
    },
    {
      title: 'Legal',
      links: [
        { label: 'Warranty', href: '/warranty' },
        { label: 'Terms and Conditions', href: '/terms-and-conditions' },
        { label: 'Privacy Policy', href: '/privacy-policy' },
      ],
    },
  ],
  legalLinks: [
    { label: 'Terms and Conditions', href: '/terms-and-conditions' },
    { label: 'Privacy Policy', href: '/privacy-policy' },
  ],
};
