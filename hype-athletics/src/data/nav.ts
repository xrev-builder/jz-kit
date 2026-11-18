// Order follows the revenue model: memberships first, then programs, facilities (which sell both), rentals.
export type NavLink = { label: string; href: string; desc?: string };
export type NavGroup = { title: string; links: NavLink[] };
export type NavItem = { label: string; href: string; groups?: NavGroup[] };

export const nav: NavItem[] = [
  {
    label: 'Membership',
    href: '/membership/',
    groups: [
      {
        title: 'Join HYPE',
        links: [
          { label: 'Plans & pricing', href: '/membership/', desc: 'Individual, couple, family, senior' },
          { label: 'Free day pass', href: '/day-pass/', desc: 'Try us before you join' },
          { label: 'Use your insurance', href: '/insurance/', desc: 'SilverSneakers, Renew Active & more' },
          { label: 'Facility tour', href: '/facilities/' },
        ],
      },
    ],
  },
  {
    label: 'Programs',
    href: '/programs/',
    groups: [
      {
        title: 'Youth sports',
        links: [
          { label: 'Basketball', href: '/basketball/' },
          { label: 'Soccer', href: '/soccer/' },
          { label: 'Volleyball', href: '/volleyball/' },
          { label: 'Martial Arts', href: '/martial-arts/' },
          { label: 'Boxing', href: '/boxing/' },
          { label: 'Wrestling', href: '/wrestling/' },
          { label: 'Football', href: '/football/' },
          { label: 'Gymnastics', href: '/gymnastics/' },
          { label: 'Pickleball', href: '/pickleball/' },
        ],
      },
      {
        title: 'Teams, camps & adults',
        links: [
          { label: 'All programs', href: '/programs/', desc: 'Filter by age, sport and location' },
          { label: 'Travel Basketball (AAU)', href: '/travel-basketball-aau/' },
          { label: 'HYPE Wolves Soccer', href: '/hype-wolves-soccer/' },
          { label: 'Summer Discovery', href: '/summer-discovery/', desc: 'Free summer camp' },
          { label: 'Adult Leagues', href: '/adult-leagues/' },
        ],
      },
      {
        title: 'Training',
        links: [
          { label: 'Personal Training', href: '/personal-group-fitness/' },
          { label: 'Basketball Training', href: '/basketball-training/' },
          { label: 'Speed & Strength', href: '/speed-strength/' },
          { label: 'Meal Plans', href: '/personalized-meal-plans/' },
        ],
      },
    ],
  },
  { label: 'Facilities', href: '/facilities/' },
  { label: 'Rentals', href: '/rentals/' },
  {
    label: 'Locations',
    href: '/dearborn-heights/',
    groups: [
      {
        title: 'Our centers',
        links: [
          { label: 'Dearborn Heights', href: '/dearborn-heights/', desc: '23302 W. Warren Ave.' },
          { label: 'Wayne', href: '/wayne/', desc: '4635 Howe Rd.' },
          { label: 'Belle Isle', href: '/belle-isle/', desc: 'Athletic complex, Detroit' },
          { label: 'Hours & closures', href: '/facility-updates/' },
        ],
      },
    ],
  },
  {
    label: 'About',
    href: '/about-us/',
    groups: [
      {
        title: 'HYPE',
        links: [
          { label: 'Our story', href: '/about-us/' },
          { label: 'Events', href: '/events/' },
          { label: 'Community services', href: '/social-services/' },
          { label: 'Leadership', href: '/meet-the-team/' },
          { label: 'Trainers & coaches', href: '/our-trainers/' },
        ],
      },
      {
        title: 'Get involved',
        links: [
          { label: 'Donate', href: '/donate/' },
          { label: 'Volunteer', href: '/volunteer/' },
          { label: 'Careers', href: '/careers/' },
          { label: 'FAQ', href: '/faq/' },
          { label: 'Contact', href: '/contact-us/' },
        ],
      },
    ],
  },
];
