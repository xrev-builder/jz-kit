export type NavLink = { label: string; href: string; desc?: string };
export type NavGroup = { title: string; links: NavLink[] };
export type NavItem = { label: string; href: string; groups?: NavGroup[] };

export const nav: NavItem[] = [
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
          { label: 'Pickleball', href: '/pickleball/' },
          { label: 'Gymnastics', href: '/gymnastics/' },
        ],
      },
      {
        title: 'Teams & training',
        links: [
          { label: 'Travel Basketball (AAU)', href: '/travel-basketball-aau/' },
          { label: 'HYPE Wolves Soccer', href: '/hype-wolves-soccer/' },
          { label: 'Basketball Training', href: '/basketball-training/' },
          { label: 'Speed & Strength', href: '/speed-strength/' },
          { label: 'Adult Leagues', href: '/adult-leagues/' },
          { label: 'Summer Discovery (free camp)', href: '/summer-discovery/' },
        ],
      },
      {
        title: 'Fitness',
        links: [
          { label: 'Personal & Group Training', href: '/personal-group-fitness/' },
          { label: 'Insurance-Paid Memberships', href: '/silver-fitness-training/' },
          { label: 'Personalized Meal Plans', href: '/personalized-meal-plans/' },
        ],
      },
    ],
  },
  { label: 'Events', href: '/events/' },
  { label: 'Membership', href: '/membership/' },
  {
    label: 'Locations',
    href: '/dearborn-heights/',
    groups: [
      {
        title: 'Our centers',
        links: [
          { label: 'Dearborn Heights', href: '/dearborn-heights/', desc: '23302 W. Warren Ave.' },
          { label: 'Wayne', href: '/wayne/', desc: '4635 Howe Rd.' },
          { label: 'Belle Isle Athletic Complex', href: '/belle-isle/', desc: '2402 Vista Dr., Detroit' },
        ],
      },
      {
        title: 'Visiting',
        links: [
          { label: 'Amenities', href: '/amenities/' },
          { label: 'Facility Updates & Closures', href: '/facility-updates/' },
          { label: 'Policies', href: '/policies-2/' },
        ],
      },
    ],
  },
  {
    label: 'Community',
    href: '/social-services/',
    groups: [
      {
        title: 'Community services',
        links: [
          { label: 'Overview', href: '/social-services/' },
          { label: 'S.A.F.E. Wellness', href: '/s-a-f-e/', desc: 'Substance Abuse Free Environment' },
          { label: 'Academic Assistance', href: '/academic-assistance/' },
          { label: 'Vocational Training', href: '/vocational-training/' },
          { label: 'Scholarship', href: '/scholarship/' },
        ],
      },
    ],
  },
  { label: 'Rentals', href: '/rentals/' },
  {
    label: 'About',
    href: '/about-us/',
    groups: [
      {
        title: 'HYPE Athletics',
        links: [
          { label: 'Our Story', href: '/about-us/' },
          { label: 'Leadership', href: '/meet-the-team/' },
          { label: 'Trainers & Coaches', href: '/our-trainers/' },
          { label: 'Careers', href: '/careers/' },
        ],
      },
      {
        title: 'Get involved',
        links: [
          { label: 'Donate', href: '/donate/' },
          { label: 'Volunteer', href: '/volunteer/' },
          { label: 'FAQ', href: '/faq/' },
          { label: 'Contact', href: '/contact-us/' },
        ],
      },
    ],
  },
];
