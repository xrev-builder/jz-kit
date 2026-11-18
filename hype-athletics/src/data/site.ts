// Single source of truth for site content.
// Everything here was taken from hypeathletics.org (crawled 18 Nov 2026).
// Lines marked VERIFY came from older posts or look inconsistent on the old site;
// confirm them with staff before launch.

export const org = {
  name: 'HYPE Athletics',
  expansion: 'Helping Youth Progress & Excel',
  founded: 2001,
  founder: 'Ali Sayed',
  email: 'info@hypeathletics.org',
  phone: '(313) 436-0043',
  phoneHref: '+13134360043',
  instagram: 'https://www.instagram.com/hypeathletics/',
  facebook: 'https://www.facebook.com/hypeathletics/',
  donateUrl: 'https://tms.ezfacility.com/OnlineRegistrations/Register.aspx?CompanyID=2870&GroupID=3888184',
  contactFormUrl: 'https://docs.google.com/forms/d/e/1FAIpQLSfLzPILShn3N33_h85DBs0cyku7yfurhZcp_wg7SWTTfGgsaw/viewform',
  volunteerFormUrl: 'https://docs.google.com/forms/d/e/1FAIpQLSd9OZ3EP3KUUEjKPrISrIRb5y6YOWwB6Lt33NK2VVnm2UM6Fw/viewform',
  incidentFormUrl: 'https://docs.google.com/forms/d/e/1FAIpQLScfpUdk7s62k3ANuKO5Ma9hYfUDGCmnRho9CnocX3gwboII_A/viewform',
  mission:
    'To create and strengthen infrastructures that support the positive development of Wayne County youth through athletic participation and competition, educational tutoring and literacy development, and social awareness including mentoring, counseling, life skills training and substance abuse education and prevention.',
};

export const hours = [
  { days: 'Monday – Friday', time: '6:00 AM – 11:00 PM' },
  { days: 'Saturday – Sunday', time: '8:00 AM – 8:00 PM' },
];

export type LocationId = 'dearborn-heights' | 'wayne' | 'belle-isle';

export const locations: Record<LocationId, {
  id: LocationId; name: string; fullName: string; short: string;
  street: string; city: string; region: string; zip: string;
  phone: string; phoneHref: string; mapsUrl: string;
  hours?: typeof hours; summary: string; highlights: string[];
}> = {
  'dearborn-heights': {
    id: 'dearborn-heights',
    name: 'Dearborn Heights',
    fullName: 'HYPE Recreation Center Dearborn Heights',
    short: 'Dearborn Hts',
    street: '23302 W. Warren Ave.',
    city: 'Dearborn Heights', region: 'MI', zip: '48127',
    phone: '(313) 436-0043', phoneHref: '+13134360043',
    mapsUrl: 'https://www.google.com/maps/search/?api=1&query=23302+W+Warren+Ave+Dearborn+Heights+MI+48127',
    hours,
    summary: 'Our flagship center: five basketball courts, an indoor track, an indoor soccer complex, a co-ed gym, a women-only gym and classroom space.',
    highlights: [
      'Five basketball courts and an indoor track',
      'Indoor turf soccer complex',
      'Co-ed gym and women-only gym',
      'Women-only group fitness',
      'Personal training and nutrition',
      'Men’s and women’s steam rooms and saunas',
      'Martial arts studio',
      'HYPE Hoops Café',
      'Child care for members',
    ],
  },
  wayne: {
    id: 'wayne',
    name: 'Wayne',
    fullName: 'HYPE Western Wayne Recreation Center',
    short: 'Wayne',
    street: '4635 Howe Rd.',
    city: 'Wayne', region: 'MI', zip: '48184',
    phone: '(734) 721-7400', phoneHref: '+17347217400',
    mapsUrl: 'https://www.google.com/maps/search/?api=1&query=4635+Howe+Rd+Wayne+MI+48184',
    hours,
    summary: 'Courts, a full fitness floor, an indoor track, gymnastics, and an event hall for 50 to 400 guests.',
    highlights: [
      'Basketball and volleyball courts',
      'Fitness floor and weight room',
      'Indoor track',
      'Gymnastics with Michigan Academy of Gymnastics',
      'Event hall for 50–400 guests, with kitchen and catering',
      'Child care for members',
    ],
  },
  'belle-isle': {
    id: 'belle-isle',
    name: 'Belle Isle',
    fullName: 'Belle Isle Athletic Complex',
    short: 'Belle Isle',
    street: '2402 Vista Dr.',
    city: 'Detroit', region: 'MI', zip: '48207',
    phone: '(734) 721-7400 ext. 240', phoneHref: '+17347217400,240',
    mapsUrl: 'https://www.google.com/maps/search/?api=1&query=2402+Vista+Dr+Detroit+MI+48207',
    summary: 'HYPE manages the 38-acre athletic complex on Belle Isle: ball diamonds, soccer fields, tennis, basketball, handball and a football field.',
    highlights: [
      '4 baseball/softball fields (2 fenced, 2 lit)',
      '9 tennis courts',
      '2 basketball courts',
      '6 soccer fields',
      '5 handball/racquetball courts',
      '1 football field',
    ],
  },
};

// ---------------------------------------------------------------- Programs

export type SportId =
  | 'basketball' | 'soccer' | 'volleyball' | 'martial-arts' | 'boxing' | 'wrestling'
  | 'football' | 'pickleball' | 'gymnastics' | 'adult-leagues' | 'speed-strength' | 'basketball-training';

export type Program = {
  title: string;
  sport: SportId;
  location: LocationId;
  ages?: string;      // only when stated by HYPE
  days?: string;
  url?: string;       // registration link
  note?: string;
};

const LA_DH = 'https://hypedearborn.leagueapps.com';
const LA_W = 'https://hypewayne.leagueapps.com';

export const programs: Program[] = [
  // Basketball · Dearborn Heights
  { title: 'Little Shooters Winter 2027', sport: 'basketball', location: 'dearborn-heights', url: `${LA_DH}/camps/5184653-little-shooters-winter-2027` },
  { title: 'Big Shooters Winter 2027', sport: 'basketball', location: 'dearborn-heights', url: `${LA_DH}/camps/5184745-big-shooters-winter-2027` },
  { title: 'Fundamental Basketball Clinic Winter 2027', sport: 'basketball', location: 'dearborn-heights', url: `${LA_DH}/camps/5184588-fundamental-basketball-clinic-winter-2027` },
  { title: 'Premier Winter Basketball League 2026/27', sport: 'basketball', location: 'dearborn-heights', url: `${LA_DH}/leagues/basketball/5063232-premier-winter-basketball-league-2627` },
  { title: 'Premier Winter Basketball League 2027 · Boys Varsity', sport: 'basketball', location: 'dearborn-heights', ages: 'Grades 6–8', url: `${LA_DH}/leagues/basketball/5165234-premier-winter-basketball-league-2027-boys-varsity-6th-8th-grade` },
  { title: 'Winter Break Basketball Camp · Session 1', sport: 'basketball', location: 'dearborn-heights', url: `${LA_DH}/camps/5114207-winter-break-basketball-camp-session-1` },
  { title: 'Winter Break Basketball Camp · Session 2', sport: 'basketball', location: 'dearborn-heights', url: `${LA_DH}/camps/5114213-winter-break-basketball-camp-session-2` },
  { title: 'Premier Spring High School Boys Basketball League 2027', sport: 'basketball', location: 'dearborn-heights', ages: 'High school boys', url: `${LA_DH}/leagues/basketball/5230462-premier-spring-high-school-boys-basketball-league-2027` },
  // Basketball · Wayne
  { title: 'Little Shooters', sport: 'basketball', location: 'wayne', url: `${LA_W}/camps/5133236-little-shooters-october-session` },
  { title: 'Big Shooters', sport: 'basketball', location: 'wayne', url: `${LA_W}/camps/5133266-big-shooters` },
  { title: 'HYPE Up Classic', sport: 'basketball', location: 'wayne', url: `${LA_W}/camps/5133329-hype-up-classic` },
  { title: 'Fall Break Basketball Camp', sport: 'basketball', location: 'wayne', url: `${LA_W}/camps/5133282-fall-break-basketball-camp` },
  { title: 'Winter Break Basketball Camp', sport: 'basketball', location: 'wayne', url: `${LA_W}/camps/5133352-winter-break-basketball-camp` },
  { title: 'HYPE Elite Basketball Camp', sport: 'basketball', location: 'wayne', url: `${LA_W}/camps/5207013-hype-elite-basketball-camp` },
  { title: 'HYPE Basketball League · Winter 2027', sport: 'basketball', location: 'wayne', url: `${LA_W}/leagues/basketball/5091042-winter-hype-basketball-league-2027` },

  // Soccer · Dearborn Heights
  { title: 'Friday Futsal', sport: 'soccer', location: 'dearborn-heights', ages: 'Ages 3–6', days: 'Fridays', url: `${LA_DH}/events/5187601-friday-futsal` },
  { title: 'Friday Futsal', sport: 'soccer', location: 'dearborn-heights', ages: 'Ages 7–13', days: 'Fridays', url: `${LA_DH}/events/5187743-friday-futsal-ages-7-9` },
  { title: 'Saad Soccer Winter Game Days', sport: 'soccer', location: 'dearborn-heights', ages: 'Ages 5–7', url: `${LA_DH}/events/5187631-saad-soccer-winter-game-days-ages-5-7` },
  { title: 'Saad Soccer Winter Game Days', sport: 'soccer', location: 'dearborn-heights', ages: 'Ages 8–10', url: `${LA_DH}/events/5187651-saad-soccer-winter-game-days-ages-8-10` },
  { title: 'Saad Soccer Winter Game Days', sport: 'soccer', location: 'dearborn-heights', ages: 'Ages 11–13', url: `${LA_DH}/events/5187661-saad-soccer-winter-game-days-ages-11-13` },
  { title: 'Saad Soccer Winter Game Days · Competitive', sport: 'soccer', location: 'dearborn-heights', ages: 'Ages 11–13', url: `${LA_DH}/events/5187671-saad-soccer-winter-game-days-ages-11-13-competitive` },
  { title: 'Winter Indoor Soccer Clinic 2026/27', sport: 'soccer', location: 'dearborn-heights', url: `${LA_DH}/camps/5174130-winter-indoor-soccer-clinic-2627` },

  // Volleyball
  { title: 'Level-Up Spikers', sport: 'volleyball', location: 'dearborn-heights', ages: 'Co-ed, ages 6–10', url: `${LA_DH}/camps/5141160-level-up-spikers---volleyball-november--coed-ages-6-10` },
  { title: 'HYPE Fall Volleyball Clinic', sport: 'volleyball', location: 'dearborn-heights', ages: 'Girls, ages 11–13', url: `${LA_DH}/camps/5114266-hype-fall-volleyball-clinic-girls-ages-11-13` },
  { title: 'Winter Break Volleyball Clinic', sport: 'volleyball', location: 'dearborn-heights', url: `${LA_DH}/camps/5095442-winter-break-volleyball-clinic` },
  { title: 'HYPE Wayne Volleyball Program', sport: 'volleyball', location: 'wayne', url: `${LA_W}/camps/4893153-hype-wayne-volleyball-program` },

  // Martial arts
  { title: 'Tae Kwon Do', sport: 'martial-arts', location: 'dearborn-heights', ages: 'Ages 4–16', days: 'Mon, Wed & Fri', url: `${LA_DH}/events/4747085-tae-kwon-do-ages-4-16-monday-wednesday--friday`, note: 'Register at the front desk' },
  { title: 'Tae Kwon Do', sport: 'martial-arts', location: 'dearborn-heights', ages: 'Ages 4–16', days: 'Tue & Thu', url: `${LA_DH}/events/4747069-tae-kwon-do-ages-4-16-tuesdays--thursdays`, note: 'Register at the front desk' },
  { title: 'Tae Kwon Do', sport: 'martial-arts', location: 'dearborn-heights', ages: 'Ages 17+', days: 'Tue & Thu', url: `${LA_DH}/events/4747095-tae-kwon-do-ages-17-tuesday--thursday`, note: 'Register at the front desk' },
  { title: 'Karate', sport: 'martial-arts', location: 'wayne', url: `${LA_W}/events/4747181-karate` },

  // Boxing
  { title: 'Boxing Fitness & Training', sport: 'boxing', location: 'dearborn-heights', ages: 'Ages 8–16', days: 'Mon, Wed & Fri', url: `${LA_DH}/events/4747111-boxing-fitness--training-ages-8-16-monday-wednesday--friday` },
  { title: 'Boxing Fitness & Training · Adult', sport: 'boxing', location: 'dearborn-heights', ages: 'Ages 17+', days: 'Tue & Thu', url: `${LA_DH}/events/4747121-boxing-fitness--training-adult-boxing-ages-17-tuesday--thursday` },

  // Wrestling
  { title: 'Elite Wrestling Institute', sport: 'wrestling', location: 'dearborn-heights', days: 'Mon, Wed & Thu', url: `${LA_DH}/events/4747153-elite-wrestling-institute-monday-wednesday--thursday` },
  { title: 'Elite Wrestling Institute · Drop-ins', sport: 'wrestling', location: 'dearborn-heights', url: `${LA_DH}/events/4747164-elite-wrestling-institute-drop-ins` },

  // Football
  { title: 'HYPE Elite Football Training', sport: 'football', location: 'dearborn-heights', url: `${LA_DH}/events/4869503-hype-elite-football-training` },

  // Pickleball
  { title: 'Drop-in Pickleball', sport: 'pickleball', location: 'dearborn-heights', note: 'Ask at the front desk for drop-in times' },

  // Gymnastics
  { title: 'Gymnastics with Michigan Academy of Gymnastics', sport: 'gymnastics', location: 'wayne', ages: 'Ages 1.5 and up', days: 'Fridays', url: 'https://www.michiganacademy.com/hype-athletics-center-wayne/' },

  // Adult leagues
  { title: 'Men’s Winter Basketball League', sport: 'adult-leagues', location: 'dearborn-heights', ages: 'Adults', url: `${LA_DH}/leagues/basketball/5154881-mens-league-winter-basketball--wahidi` },
  { title: 'HYPE Adult Co-ed Volleyball League', sport: 'adult-leagues', location: 'dearborn-heights', ages: 'Adults', url: `${LA_DH}/leagues/volleyball-(indoor)/5171125-hype-adult-co-ed-volleyball-league` },

  // Speed & strength
  { title: 'Sports Fitness & Performance Training', sport: 'speed-strength', location: 'dearborn-heights', url: 'https://hypedearborn.leagueapps.com/events/4747103-sports-fitness--performance-training' },
  { title: 'Sports Fitness · Speed & Agility', sport: 'speed-strength', location: 'wayne', url: `${LA_W}/camps/4837500-sports-fitness-speed--agility` },

  // Basketball training
  { title: 'HYPE Skillz Training with Jamey Petree', sport: 'basketball-training', location: 'dearborn-heights', ages: 'Grade 3 through high school', url: `${LA_DH}/events/5052658-hype-skillz-training-with-jamey-petree`, note: 'First session free' },
  { title: 'Fearless Training · Free Basketball Camp', sport: 'basketball-training', location: 'wayne', url: `${LA_W}/camps/5004405-fearless-training---free-basketball-camp` },
  { title: 'Fearless Training with Joshua Dudley · Big Group Walk-in', sport: 'basketball-training', location: 'wayne', url: `${LA_W}/camps/4966290-fearless-training-w-joshua-dudley-big-group-walk-in-training` },
  { title: 'Fearless Training with Joshua Dudley · Big Group, 8 Sessions', sport: 'basketball-training', location: 'wayne', url: `${LA_W}/camps/4964939-fearless-training-w-joshua-dudley-big-group---8-session-package` },
  { title: 'Fearless Training with Joshua Dudley · Big Group, 16 Sessions', sport: 'basketball-training', location: 'wayne', url: `${LA_W}/camps/4964961-fearless-training-w-joshua-dudley-big-group-unlimited-sessions-package--16-sessi` },
  { title: 'Fearless Training with Joshua Dudley · Small Group Starter, 4 Sessions', sport: 'basketball-training', location: 'wayne', ages: '2–5 athletes per group', url: `${LA_W}/camps/4964999-fearless-training-w-joshua-dudley-small-group-training-2-5-athletes--starter-4-s` },
  { title: 'Fearless Training with Joshua Dudley · Small Group, 12 Sessions', sport: 'basketball-training', location: 'wayne', ages: '2–5 athletes per group', url: `${LA_W}/camps/4965017-fearless-training-w-joshua-dudley-small-group-training-2-5-athletes-12-sessions` },
];

export type Sport = {
  id: SportId;
  name: string;
  nav: string;           // label in menus
  group: 'sports' | 'training' | 'adults';
  photo: string;         // key into photos map
  headline: string;
  intro: string;
  extra?: 'gymnastics' | 'skillz';
};

export const sports: Sport[] = [
  { id: 'basketball', name: 'Basketball', nav: 'Basketball', group: 'sports', photo: 'basketball-camp',
    headline: 'Build confidence through basketball',
    intro: 'Whether your child is picking up a ball for the first time or competing at elite levels, our camps, clinics and leagues combine skill development, competition and a love for the game.' },
  { id: 'soccer', name: 'Soccer', nav: 'Soccer', group: 'sports', photo: 'dh-turf',
    headline: 'Soccer on our indoor turf',
    intro: 'Players of all ages and skill levels develop fundamentals, teamwork and sportsmanship through structured training and game play, year-round on our indoor turf in Dearborn Heights.' },
  { id: 'volleyball', name: 'Volleyball', nav: 'Volleyball', group: 'sports', photo: 'volleyball',
    headline: 'Volleyball for every level',
    intro: 'Drills, scrimmages and competitive play build agility, communication and confidence on the court. New players and experienced athletes both improve here.' },
  { id: 'martial-arts', name: 'Martial Arts', nav: 'Martial Arts', group: 'sports', photo: 'martial-arts',
    headline: 'Confidence and discipline on the mat',
    intro: 'Structured training in self-defense, striking and form builds strength, balance, focus and respect. Classes for ages 4 through adult.' },
  { id: 'boxing', name: 'Boxing', nav: 'Boxing', group: 'sports', photo: 'boxing',
    headline: 'Boxing fitness and training',
    intro: 'Young, old, in shape or out of shape, with no experience or as a competitive athlete: start whenever you are ready. Youth and adult classes run every week.' },
  { id: 'wrestling', name: 'Wrestling', nav: 'Wrestling', group: 'sports', photo: 'wrestling',
    headline: 'Elite Wrestling Institute at HYPE',
    intro: 'One-on-one coaching and group training in a focused environment, with regular sessions three days a week and drop-ins.' },
  { id: 'football', name: 'Football', nav: 'Football', group: 'sports', photo: 'football',
    headline: 'Football fundamentals and leadership',
    intro: 'Athletes learn position-specific skills, game strategy and proper technique in a safe, structured and competitive environment.' },
  { id: 'pickleball', name: 'Pickleball', nav: 'Pickleball', group: 'sports', photo: 'pickleball',
    headline: 'Pickleball for all ages',
    intro: 'One of the fastest-growing sports, in a fun and social setting. Learn the rules, fundamentals and strategy through drills and match play.' },
  { id: 'gymnastics', name: 'Gymnastics', nav: 'Gymnastics', group: 'sports', photo: 'gymnastics', extra: 'gymnastics',
    headline: 'Gymnastics at Western Wayne',
    intro: 'Classes for kids of all ages through our partnership with Michigan Academy of Gymnastics, building strength, flexibility, balance and confidence.' },
  { id: 'adult-leagues', name: 'Adult Leagues', nav: 'Adult Leagues', group: 'adults', photo: 'team-huddle',
    headline: 'Adult sports leagues',
    intro: 'Organized, competitive leagues for adults of all skill levels. Stay active, compete with friends and meet new people.' },
  { id: 'speed-strength', name: 'Speed & Strength', nav: 'Speed & Strength', group: 'training', photo: 'dh-training',
    headline: 'Speed, agility and strength',
    intro: 'Science-based sports performance training: periodized strength work, speed and agility development, plyometrics, core development and injury prevention.' },
  { id: 'basketball-training', name: 'Basketball Training', nav: 'Basketball Training', group: 'training', photo: 'team-elite', extra: 'skillz',
    headline: 'Small-group basketball training',
    intro: 'Skill development with professional trainers, grouped by age and level, from 3rd grade through high school.' },
];

export const sportById = Object.fromEntries(sports.map((s) => [s.id, s])) as Record<SportId, Sport>;

export const gymnastics = {
  schedule: [
    { time: '4:30 – 5:15 PM', name: 'Kinder Gymnastics', ages: 'Ages 3–5' },
    { time: '5:15 – 6:00 PM', name: 'Super Kinder Gymnastics', ages: '' },
    { time: '6:00 – 6:45 PM', name: 'Parent & Tot', ages: 'Ages 1.5–3' },
    { time: '6:45 – 8:00 PM', name: 'Girls Red', ages: '' },
  ],
  pricing: [
    { name: 'Parent & Tot', price: '$58', per: 'month' },
    { name: 'Kinder / Super Kinder', price: '$72', per: 'month' },
    { name: 'Girls Red', price: '$98', per: 'month' },
    { name: 'Tumbling', price: '$80', per: 'month' },
    { name: 'Kids Playtime (ages 3–12, supervised)', price: '$5', per: 'visit' },
  ],
  fee: 'An annual registration fee of $25 applies to all students.',
};

// ---------------------------------------------------------------- Membership

export const membership = {
  signupUrl: 'https://signup.myiclubonline.com/iclub/signup/home.htm#plans?clubNumber=9554',
  trial: 'Try 7 days free',
  locations: [
    {
      id: 'dearborn-heights' as LocationId,
      access: 'Access to both HYPE facilities',
      tiers: [
        { name: 'Individual', eft: 40, card: 43 },
        { name: 'Adult Couple', eft: 69, card: 72 },
        { name: 'Family', eft: 109, card: 112 },
        { name: 'Senior (59+)', eft: 29, card: 32 },
        { name: 'Senior Couple', eft: 46, card: 49 },
      ],
    },
    {
      id: 'wayne' as LocationId,
      access: 'Access to the Wayne facility',
      tiers: [
        { name: 'Individual', eft: 25, card: 28 },
        { name: 'Adult Couple', eft: 45, card: 48 },
        { name: 'Family', eft: 79, card: 82 },
        { name: 'Senior (59+)', eft: 20, card: 23 },
        { name: 'Senior Couple', eft: 38, card: 38 }, // VERIFY: old site lists the same price for both
      ],
    },
  ],
  included: ['Free group fitness classes', 'Free child care', 'Free fitness assessment with a certified trainer', 'Free after-school Homework Club for kids on your membership'],
  insurance: ['SilverSneakers', 'Silver & Fit', 'Active & Fit', 'Active & Fit Enterprise', 'Renew Active', 'Prime', 'PeerFit', 'Gympass'],
  guestPass: '$10 per guest pass. Members get three guest passes a year; member and guest must both be 18+ with valid ID.',
};

// ---------------------------------------------------------------- Rentals

export const rentals = {
  'dearborn-heights': {
    contact: { name: 'Zeinab Saab', email: 'zsaab@hypeathletics.org', phone: '(313) 436-0043', phoneHref: '+13134360043' },
    formUrl: 'https://docs.google.com/forms/d/e/1FAIpQLSfAGWhxmEzl5xCf5RjG1g8Xguc2l2_1u27EFXzbWhQ32DJqRA/viewform',
    blurb: 'A premier gymnasium with five basketball courts for tournaments, leagues, camps, training sessions, volleyball, futsal, expos and parties.',
    idealFor: ['Tournaments', 'Leagues', 'Camps', 'Training sessions', 'Volleyball', 'Futsal', 'Expos', 'Parties (bounce houses through partners like Jokers)', 'Field trips (book 3 weeks ahead)'],
  },
  wayne: {
    contact: { name: 'Jamie Strange', email: 'jstrange@hypeathletics.org', phone: '(734) 721-7400 ext. 240', phoneHref: '+17347217400,240' },
    blurb: 'An event hall for 50 to 400 guests with complimentary table and chair setup, optional in-house catering and kitchen rental.',
    idealFor: ['Bridal and baby showers', 'Business meetings and seminars', 'Luncheons and dinners', 'Retirement parties', 'Sports banquets', 'Weddings and receptions'],
  },
  'belle-isle': {
    contact: { name: 'Jamie Strange', email: 'jstrange@hypeathletics.org', phone: '(734) 721-7400 ext. 240', phoneHref: '+17347217400,240' },
    blurb: 'Season permits for leagues (minimum four teams), practice permits, and one-time field rentals across 38 acres.',
    rates: [
      { item: 'Ballfield, fenced', hourly: '$40', daily: '$450' },
      { item: 'Ballfield', hourly: '$35', daily: '$400' },
      { item: 'Soccer field', hourly: '$40', daily: '' },
      { item: 'Basketball court', hourly: '$25', daily: '$500' },
      { item: 'Tennis court', hourly: '$15', daily: '' },
      { item: 'Sand volleyball, weekdays', hourly: '$25', daily: '$300' },
      { item: 'Sand volleyball, weekends', hourly: '$35', daily: '$500' },
    ],
    extras: [
      { item: 'Ballfield lining', price: '$45' },
      { item: 'Ballfield lights', price: '$45' },
      { item: 'Soccer field lining', price: '$275' },
      { item: 'Football field lining', price: '$400' },
      { item: 'Quidditch field lining', price: '$500' },
    ],
    rules: [
      'Leagues must submit their playing schedule before permits are issued.',
      'Plan for playoffs and rainouts within your league schedule.',
      'Allow up to 14 days to process a request after we receive your schedule.',
      'Requests must list field names and numbers, days, dates and times.',
      'Special events and large groups are priced separately. Contact us.',
    ],
  },
};

// ---------------------------------------------------------------- Events

export const events = [
  {
    title: 'HYPE 26th Anniversary Gala',
    date: '2027-04-08',
    dateLabel: 'Thursday, April 8, 2027',
    location: 'dearborn-heights' as LocationId,
    blurb: 'Our annual celebration of 26 years of youth programs in Wayne County. Sponsorship and ticket details will be announced soon.',
    contact: 'Sponsorship questions: Ali Faraj, afaraj@hypeathletics.org',
  },
  {
    title: 'Summer Discovery 2027 enrollment opens',
    date: '2027-03-01',
    dateLabel: 'Monday, March 1, 2027',
    blurb: 'Free five-week summer program for incoming grades 1–10 at 10 sites across Wayne County. Registration links go live on March 1.',
    href: '/summer-discovery/',
  },
];

export const closures2026 = {
  facility: [
    { label: 'Thanksgiving Day', date: '2026-11-26' },
    { label: 'Christmas Day', date: '2026-12-25' },
  ],
};

// ---------------------------------------------------------------- People

export const leadership = [
  { name: 'Ali Sayed', role: 'Founder & Chief Executive Officer', photo: 'ali-sayed' },
  { name: 'Bilal Amen', role: 'Chief Operating Officer', photo: 'bilal-amen' },
  { name: 'Maha Sabbagh', role: 'Chief Financial Officer', photo: 'maha-sabbagh' },
  { name: 'Ali Faraj', role: 'Chief Administrative Officer', photo: 'ali-faraj' },
];

export const trainers = {
  fitness: [
    { name: 'Anthony Frezzell', role: 'Head Personal Trainer', bio: 'Former college athlete with 8+ years in fitness. Certified in strength and conditioning, corrective exercise, nutrition and sports performance. Every client starts with a full assessment.' },
    { name: 'Nesrine Saad', role: 'Certified Personal Trainer · Women’s Wellness Coach', bio: 'ISSA-certified trainer focused on helping women build strength and confidence through sustainable, realistic routines: training, stretching, nutrition and rest.' },
    { name: 'Tiffany Meckel', role: 'Personal Trainer · Group Fitness Instructor', bio: 'High-energy, results-focused workouts targeting core, glutes and full body, from Zumba classes to one-on-one sessions.' },
    { name: 'Felicia Sparks', role: 'Personal Trainer · Toning & Strength', bio: 'Customized programs for toning, muscle building, fat loss and healthy bulking, in one-on-one and small-group sessions.' },
    { name: 'May Saab', role: 'Personal Trainer', bio: 'Certified personal trainer, corrective exercise specialist and sports nutrition coach with 5+ years of experience in strength, HIIT, plyometrics and bootcamp formats.' },
  ],
  basketball: [
    { name: 'Jamey Petree', role: 'Elite Basketball Trainer', bio: '20+ years developing players from youth to professionals. Many of his athletes have earned NCAA Division I and II scholarships. Runs HYPE Skillz.' },
    { name: 'Austin Molan', role: 'Basketball Trainer · Live Play Specialist', bio: 'Metro Detroit trainer with 5+ years developing youth through college players. His philosophy: train how you play.' },
    { name: 'Coach Swish', role: 'Basketball Trainer · Skill Specialist', bio: 'A long-time HYPE trainer specializing in dribbling and shooting, focused on building confidence and a lifelong love for the game.' },
    { name: 'Ameer Gaston-Rashid', role: 'Coach · Mentor', bio: 'Melvindale High varsity standout (Defensive Player of the Year, Downriver Dream Team, All-Metro West) who went on to play three years at Adrian College.' },
    { name: 'Bryan Ban', role: 'Basketball Coach', bio: '14+ years coaching. Runs group training for boys in K–8th grade and girls in 2nd–6th grade.' },
    { name: 'Jaylen Barnes', role: 'Basketball Coach', bio: '' },
  ],
};

export const sponsors = [
  { name: 'Al-Ameer Restaurant', file: 'al-ameer-rest.png' },
  { name: 'Arab American Chamber of Commerce', file: 'arab-american-chamber-of-com.png' },
  { name: 'Beaumont', file: 'beaumont.png' },
  { name: 'The Law Offices of Berry & Berri', file: 'berry-berri.png' },
  { name: 'Biomedical', file: 'biomedical.png' },
  { name: 'Clinical Biotech Lab', file: 'clinical-biotech-lab.png' },
  { name: 'Dearborn Heights Raiders', file: 'dearborn-hts-raiders.png' },
  { name: 'Fairlane Car Wash', file: 'fairlane-car-wash.png' },
  { name: 'Four Seasons', file: 'four-seasons.png' },
  { name: 'Fwaz Agency', file: 'fwaz-agency.png' },
  { name: 'Hammoud, Dakhlallah & Associates PLLC', file: 'hammoud-dakhlallah-associates-pllc.png' },
];

// ---------------------------------------------------------------- Summer Discovery

export const summerDiscovery = {
  status: 'Accepting applications January 2027 · Enrollment opens March 1, 2027',
  highlights: [
    { label: 'Cost', value: 'Free' },
    { label: 'Grades', value: 'Incoming 1–10' },
    { label: 'Length', value: '5 weeks' },
    { label: 'Daily', value: '3 hours of academics + enrichment' },
    { label: 'Meals', value: 'Breakfast & lunch daily' },
  ],
  sites: [
    'HYPE Dearborn Heights',
    'HYPE Wayne',
    'Riverside Middle School (Crestwood Schools, Dearborn Heights)',
    'WISE Academy (Dearborn Heights)',
    'Garden City Public Schools',
    'MAYA School (Dearborn)',
    'Allendale Elementary (MelNAP, Melvindale)',
    'Melvindale High School (MelNAP, Allen Park)',
    'Wayne Memorial High School (Wayne-Westland Schools)',
    'John Glenn High School (Wayne-Westland Schools, Westland)',
  ],
  hiringUrl: 'https://docs.google.com/forms/d/e/1FAIpQLSfNKD7GLawM4FHvmb12PYb5XTc_VvY-rjjEsTY1CSW0UW3wVw/viewform',
  campPhoneExt: '(313) 436-0043 ext. 125',
};
