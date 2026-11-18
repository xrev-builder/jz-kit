// Program details pulled from HYPE's LeagueApps pages on 18 Nov 2026.
// Fields listed in `todo` were not published anywhere; get them from Ali / program staff.
import type { SportId, LocationId } from './site';

export type Program = {
  slug: string;
  title: string;
  sport: SportId;
  location: LocationId;
  ages?: string;
  days?: string;
  time?: string;
  dates?: string;          // human label
  start?: string;          // ISO date
  end?: string;            // ISO date
  ongoing?: boolean;       // monthly / rolling enrollment
  fee?: string;            // "$100"
  feeNote?: string;        // "/month", "per player", ...
  blurb: string;
  url?: string;            // registration link
  spots?: number;          // spots left when scraped
  frontDesk?: boolean;     // register in person
  todo?: string[];         // missing details to collect
};

const DH = 'https://hypedearborn.leagueapps.com';
const W = 'https://hypewayne.leagueapps.com';

export const programs: Program[] = [
  // ---------------------------------------------------------------- Basketball · Dearborn Heights
  { slug: 'little-shooters-winter-2027', title: 'Little Shooters', sport: 'basketball', location: 'dearborn-heights',
    ages: 'Ages 3–6', days: 'Fridays', time: '5:00–6:00 PM', dates: 'Feb 5 – Mar 5, 2027', start: '2027-02-05', end: '2027-03-05',
    fee: '$100', spots: 44, url: `${DH}/camps/5184653-little-shooters-winter-2027`,
    blurb: 'A first taste of basketball. Fun, age-appropriate games and drills that teach the fundamentals, led by high school and college coaches.' },
  { slug: 'big-shooters-winter-2027', title: 'Big Shooters', sport: 'basketball', location: 'dearborn-heights',
    ages: 'Ages 7–9', days: 'Fridays', time: '6:15–7:15 PM', dates: 'Feb 5 – Mar 5, 2027', start: '2027-02-05', end: '2027-03-05',
    fee: '$100', url: `${DH}/camps/5184745-big-shooters-winter-2027`,
    blurb: 'The next step after Little Shooters: skill-building games and drills with experienced high school and college coaches.' },
  { slug: 'fundamental-basketball-clinic-winter-2027', title: 'Fundamental Basketball Clinic', sport: 'basketball', location: 'dearborn-heights',
    ages: 'Ages 10–13', days: 'Wednesdays', time: '5:15–6:30 PM', dates: 'Feb 3 – Mar 3, 2027', start: '2027-02-03', end: '2027-03-03',
    fee: '$60', spots: 40, url: `${DH}/camps/5184588-fundamental-basketball-clinic-winter-2027`,
    blurb: 'Sharpen dribbling, court vision, shooting form, passing and defense with experienced coaches.' },
  { slug: 'winter-break-basketball-camp-1', title: 'Winter Break Basketball Camp · Session 1', sport: 'basketball', location: 'dearborn-heights',
    ages: 'Ages 8–13', days: 'Mon – Wed', time: '8:45 AM – 2:00 PM', dates: 'Dec 21 – 23, 2026', start: '2026-12-21', end: '2026-12-23',
    fee: '$125', spots: 49, url: `${DH}/camps/5114207-winter-break-basketball-camp-session-1`,
    blurb: 'Three full days of drills, competition and games over winter break, with a lunch break each day.' },
  { slug: 'winter-break-basketball-camp-2', title: 'Winter Break Basketball Camp · Session 2', sport: 'basketball', location: 'dearborn-heights',
    ages: 'Ages 8–13', days: 'Mon – Wed', time: '8:45 AM – 2:00 PM', dates: 'Dec 28 – 30, 2026', start: '2026-12-28', end: '2026-12-30',
    fee: '$125', spots: 49, url: `${DH}/camps/5114213-winter-break-basketball-camp-session-2`,
    blurb: 'Session two of our winter break camp. Same full-day format, new week.' },
  { slug: 'premier-winter-league-2026-27', title: 'Premier Winter Basketball League', sport: 'basketball', location: 'dearborn-heights',
    ages: 'Boys grades 1–6 · Girls grades 2–8', days: 'Practices Mon–Thu · Games weekends', dates: 'Nov 16, 2026 – Jan 30, 2027', start: '2026-11-16', end: '2027-01-30',
    fee: '$225', url: `${DH}/leagues/basketball/5063232-premier-winter-basketball-league-2627`,
    blurb: 'Full uniform, 10 regular-season games, weekly team practices and a playoff run. Hundreds of young players every season.' },
  { slug: 'premier-winter-league-boys-varsity-2027', title: 'Premier Winter League · Boys Varsity', sport: 'basketball', location: 'dearborn-heights',
    ages: 'Boys grades 6–8', days: 'Tue & Thu', dates: 'Feb 2 – Mar 18, 2027', start: '2027-02-02', end: '2027-03-18',
    fee: '$225', spots: 96, url: `${DH}/leagues/basketball/5165234-premier-winter-basketball-league-2027-boys-varsity-6th-8th-grade`,
    blurb: 'A competitive varsity division for middle school boys.', todo: ['game times'] },
  { slug: 'premier-spring-hs-boys-league-2027', title: 'Premier Spring High School Boys League', sport: 'basketball', location: 'dearborn-heights',
    ages: 'Boys grades 9–12', days: 'Tue & Thu', dates: 'Apr 6 – May 13, 2027', start: '2027-04-06', end: '2027-05-13',
    fee: '$225', spots: 108, url: `${DH}/leagues/basketball/5230462-premier-spring-high-school-boys-basketball-league-2027`,
    blurb: 'Spring league play for high school boys.', todo: ['game times'] },

  // ---------------------------------------------------------------- Basketball · Wayne
  { slug: 'wayne-little-shooters', title: 'Little Shooters', sport: 'basketball', location: 'wayne',
    ages: 'Ages 4–7', days: 'Tuesdays', time: '5:30–6:30 PM', dates: 'Oct 20 – Nov 24, 2026', start: '2026-10-20', end: '2026-11-24',
    fee: '$60', url: `${W}/camps/5133236-little-shooters-october-session`,
    blurb: 'A beginner clinic for kids just starting out, with fun games that build basic skills.' },
  { slug: 'wayne-fall-break-camp', title: 'Fall Break Basketball Camp', sport: 'basketball', location: 'wayne',
    ages: 'Ages 8–14', days: 'Mon – Wed', time: '5:30–7:30 PM', dates: 'Nov 23 – 25, 2026', start: '2026-11-23', end: '2026-11-25',
    fee: '$30', url: `${W}/camps/5133282-fall-break-basketball-camp`,
    blurb: 'Three evenings of basketball over Thanksgiving break.' },
  { slug: 'wayne-hype-up-classic', title: 'HYPE Up Classic', sport: 'basketball', location: 'wayne',
    ages: 'Grades 7–9', days: 'Mon & Wed', time: '6:00–7:30 PM', dates: 'Dec 1 – 17, 2026', start: '2026-12-01', end: '2026-12-17',
    fee: '$80', url: `${W}/camps/5133329-hype-up-classic`,
    blurb: 'A preseason tune-up: instruction and skill work on Mondays, refereed live games on Wednesdays.' },
  { slug: 'wayne-elite-basketball-camp', title: 'HYPE Elite Basketball Camp', sport: 'basketball', location: 'wayne',
    days: 'Saturday', time: '10:00 AM – 2:30 PM', dates: 'Dec 5, 2026', start: '2026-12-05', end: '2026-12-05',
    fee: '$10', url: `${W}/camps/5207013-hype-elite-basketball-camp`,
    blurb: 'A one-day elite camp at HYPE Wayne.', todo: ['ages', 'description'] },
  { slug: 'wayne-winter-break-camp', title: 'Winter Break Basketball Camp', sport: 'basketball', location: 'wayne',
    ages: 'Ages 8–14', days: 'Mon – Wed', time: '3:00–5:00 PM', dates: 'Dec 21 – 23, 2026', start: '2026-12-21', end: '2026-12-23',
    fee: '$30', url: `${W}/camps/5133352-winter-break-basketball-camp`,
    blurb: 'Afternoon basketball camp over winter break.' },
  { slug: 'wayne-winter-league-2027', title: 'HYPE Wayne Basketball League', sport: 'basketball', location: 'wayne',
    ages: 'Boys grades 1–8', days: 'Practices Mon & Wed · Games Sundays', dates: 'Jan 4 – Mar 1, 2027', start: '2027-01-04', end: '2027-03-01',
    fee: '$175', feeNote: '$25 sibling discount', url: `${W}/leagues/basketball/5091042-winter-hype-basketball-league-2027`,
    blurb: 'NBA-style uniform, 8 regular-season games, team practices, playoffs and an All-Star Day with awards. Now in its 5th year.' },

  // ---------------------------------------------------------------- Soccer
  { slug: 'winter-indoor-soccer-clinic', title: 'Winter Indoor Soccer Clinic', sport: 'soccer', location: 'dearborn-heights',
    ages: 'Ages 4–7 · 8–12', days: 'Mondays', time: '5–6 PM (4–7) · 6–7 PM (8–12)', dates: 'Nov 30, 2026 – Mar 1, 2027', start: '2026-11-30', end: '2027-03-01',
    fee: '$160', url: `${DH}/camps/5174130-winter-indoor-soccer-clinic-2627`,
    blurb: 'Play faster and smarter in tight spaces on our indoor turf. No sessions Dec 21 or 28.' },
  { slug: 'friday-futsal-3-6', title: 'Friday Futsal', sport: 'soccer', location: 'dearborn-heights',
    ages: 'Ages 3–6', days: 'Fridays', time: '5:00–6:00 PM', dates: 'Nov 6 – Dec 18, 2026', start: '2026-11-06', end: '2026-12-18',
    fee: '$150', feeNote: '6 sessions · $30 drop-in', url: `${DH}/events/5187601-friday-futsal`,
    blurb: 'Fast, technical futsal-style soccer on the court. Lots of touches, quick thinking, small groups of 20.' },
  { slug: 'friday-futsal-7-13', title: 'Friday Futsal', sport: 'soccer', location: 'dearborn-heights',
    ages: 'Ages 7–13', days: 'Fridays', time: '6:00–7:00 PM', dates: 'Nov 6 – Dec 18, 2026', start: '2026-11-06', end: '2026-12-18',
    fee: '$150', feeNote: '6 sessions · $30 drop-in', url: `${DH}/events/5187743-friday-futsal-ages-7-9`,
    blurb: 'Ball touches, passing, 1v1s and playing in tight spaces. Max 20 players per session.' },
  { slug: 'saad-soccer-game-days', title: 'Saad Soccer Winter Game Days', sport: 'soccer', location: 'dearborn-heights',
    ages: 'Ages 5–7 · 8–10 · 11–13 · High school', days: 'Saturdays', time: 'Hourly by age group', dates: 'Nov 7 – Dec 26, 2026', start: '2026-11-07', end: '2026-12-26',
    fee: '$250', feeNote: 'winter pass · $40 drop-in', url: `${DH}/events/5187631-saad-soccer-winter-game-days-ages-5-7`,
    blurb: 'Let the kids play. Organized Saturday games in balanced open and competitive groups, max 24 players per hour.' },

  // ---------------------------------------------------------------- Volleyball
  { slug: 'level-up-spikers', title: 'Level-Up Spikers', sport: 'volleyball', location: 'dearborn-heights',
    ages: 'Co-ed, ages 6–10', days: 'Tuesdays', time: '5:30–6:45 PM', dates: 'Nov 17 – Dec 15, 2026', start: '2026-11-17', end: '2026-12-15',
    fee: '$100', url: `${DH}/camps/5141160-level-up-spikers---volleyball-november--coed-ages-6-10`,
    blurb: 'Volleyball basics for younger players: serving, passing and teamwork.' },
  { slug: 'fall-volleyball-clinic-girls', title: 'Fall Volleyball Clinic', sport: 'volleyball', location: 'dearborn-heights',
    ages: 'Girls, ages 11–13', days: 'Tuesdays', time: '7:00–8:30 PM', dates: 'Nov 17 – Dec 15, 2026', start: '2026-11-17', end: '2026-12-15',
    fee: '$100', url: `${DH}/camps/5114266-hype-fall-volleyball-clinic-girls-ages-11-13`,
    blurb: 'For girls who want to polish their skills before tryouts and the club season.' },
  { slug: 'winter-break-volleyball-clinic', title: 'Winter Break Volleyball Clinic', sport: 'volleyball', location: 'dearborn-heights',
    ages: 'Ages 8–13', days: 'Mon & Tue', time: '4:00–6:00 PM', dates: 'Dec 21 – 29, 2026', start: '2026-12-21', end: '2026-12-29',
    fee: '$100', spots: 31, url: `${DH}/camps/5095442-winter-break-volleyball-clinic`,
    blurb: 'Stay sharp over the holidays with focused skill work.' },

  // ---------------------------------------------------------------- Martial arts
  { slug: 'tae-kwon-do-youth-tue-thu', title: 'Tae Kwon Do', sport: 'martial-arts', location: 'dearborn-heights',
    ages: 'Ages 4–16', days: 'Tue & Thu', time: '4:50–6:05 PM', ongoing: true, fee: '$80', feeNote: '/month · uniform extra', frontDesk: true,
    url: `${DH}/events/4747069-tae-kwon-do-ages-4-16-tuesdays--thursdays`,
    blurb: 'Zriek’s Taekwondo with Grand Master Zriek. Confidence, focus and discipline through high-energy, positive training.' },
  { slug: 'tae-kwon-do-youth-mwf', title: 'Tae Kwon Do', sport: 'martial-arts', location: 'dearborn-heights',
    ages: 'Ages 4–16', days: 'Mon, Wed & Fri', time: '5:00–6:00 PM', ongoing: true, fee: '$80', feeNote: '/month · uniform extra', frontDesk: true,
    url: `${DH}/events/4747085-tae-kwon-do-ages-4-16-monday-wednesday--friday`,
    blurb: 'The same program on a Monday, Wednesday and Friday schedule.' },
  { slug: 'tae-kwon-do-adults', title: 'Tae Kwon Do', sport: 'martial-arts', location: 'dearborn-heights',
    ages: 'Ages 17+', days: 'Tue & Thu', time: '6:05–7:05 PM', ongoing: true, fee: '$80', feeNote: '/month', frontDesk: true,
    url: `${DH}/events/4747095-tae-kwon-do-ages-17-tuesday--thursday`,
    blurb: 'Teen and adult classes with Grand Master Zriek.' },
  { slug: 'wayne-karate', title: 'Karate', sport: 'martial-arts', location: 'wayne',
    ages: 'Ages 5–12', days: 'Tuesdays', time: '6:00 PM (5–7) · 6:30 PM (8–12)', ongoing: true, fee: '$45', feeNote: '/month · first 2 weeks free',
    url: `${W}/events/4747181-karate`,
    blurb: 'Step-by-step martial arts with rank advancement. New students get their first two weeks free.' },

  // ---------------------------------------------------------------- Boxing & wrestling
  { slug: 'youth-boxing', title: 'Youth Boxing', sport: 'boxing', location: 'dearborn-heights',
    ages: 'Ages 8–16', days: 'Mon, Wed & Fri', time: '6:00–7:30 PM', ongoing: true, fee: '$95', feeNote: '/month', frontDesk: true,
    url: `${DH}/events/4747111-boxing-fitness--training-ages-8-16-monday-wednesday--friday`,
    blurb: 'Dark Side Team Boxing with Coach Mohamed Hamood. Strength, confidence and grit in a high-energy, co-ed room.' },
  { slug: 'elite-wrestling-institute', title: 'Elite Wrestling Institute', sport: 'wrestling', location: 'dearborn-heights',
    days: 'Mon, Wed & Thu', time: '5:30–7:30 PM or 7:30–9:30 PM', ongoing: true, fee: '$135', feeNote: '/month',
    url: `${DH}/events/4747153-elite-wrestling-institute-monday-wednesday--thursday`,
    blurb: 'One-on-one coaching plus group training. Questions: (313) 782-3787.', todo: ['ages'] },
  { slug: 'elite-wrestling-drop-in', title: 'Elite Wrestling · Drop-in', sport: 'wrestling', location: 'dearborn-heights',
    days: 'Mon, Wed & Thu', time: '5:30–9:30 PM', ongoing: true, fee: '$20', feeNote: 'per visit',
    url: `${DH}/events/4747164-elite-wrestling-institute-drop-ins`,
    blurb: 'Try a session or train when your schedule allows.', todo: ['ages'] },

  // ---------------------------------------------------------------- Football & pickleball
  { slug: 'elite-football-training', title: 'HYPE Elite Football Training', sport: 'football', location: 'dearborn-heights',
    days: 'Sundays', time: '10:00–11:30 AM', ongoing: true, fee: '$160', feeNote: '/month · 4 sessions',
    url: `${DH}/events/4869503-hype-elite-football-training`,
    blurb: 'Position-specific training for defensive backs and wide receivers in small groups, with Coaches Anthony Frezzell and Baqer Sayed.', todo: ['ages'] },
  { slug: 'drop-in-pickleball', title: 'Drop-in Pickleball', sport: 'pickleball', location: 'dearborn-heights', frontDesk: true,
    blurb: 'Open play on our courts. Ask at the front desk for times.', todo: ['days', 'times', 'fee'] },

  // ---------------------------------------------------------------- Gymnastics
  { slug: 'wayne-gymnastics', title: 'Gymnastics with Michigan Academy', sport: 'gymnastics', location: 'wayne',
    ages: 'Ages 1.5 and up', days: 'Fridays', time: '4:30–8:00 PM', ongoing: true, fee: 'From $58', feeNote: '/month · $25 annual fee',
    url: 'https://www.michiganacademy.com/hype-athletics-center-wayne/',
    blurb: 'Parent & Tot, Kinder, Super Kinder, Girls Red and tumbling, coached by Michigan Academy of Gymnastics.' },

  // ---------------------------------------------------------------- Adult leagues
  { slug: 'mens-winter-basketball-league', title: 'Men’s Winter Basketball League', sport: 'adult-leagues', location: 'dearborn-heights',
    ages: 'Men 18–35', days: 'Thursdays', time: '7:00–10:00 PM', dates: 'Nov 5, 2026 – Feb 4, 2027', start: '2026-11-05', end: '2027-02-04',
    fee: '$155', feeNote: 'per player', url: `${DH}/leagues/basketball/5154881-mens-league-winter-basketball--wahidi`,
    blurb: '5v5 full court. 9 games, playoffs, custom jerseys, refs and game film. No team? Email arashid@hypeathletics.org.' },
  { slug: 'adult-coed-volleyball-league', title: 'Adult Co-ed Volleyball League', sport: 'adult-leagues', location: 'dearborn-heights',
    ages: '18+', days: 'Mondays', time: '7:30, 8:30 or 9:30 PM', dates: 'Nov 30, 2026 – Feb 1, 2027', start: '2026-11-30', end: '2027-02-01',
    fee: '$950', feeNote: 'per team', url: `${DH}/leagues/volleyball-(indoor)/5171125-hype-adult-co-ed-volleyball-league`,
    blurb: '7 regular-season games plus playoffs. Teams keep at least two women on the court.' },

  // ---------------------------------------------------------------- Training
  { slug: 'sports-performance-training', title: 'Sports Fitness & Performance Training', sport: 'speed-strength', location: 'dearborn-heights',
    ages: 'Ages 7–16', days: 'Tue & Thu', time: '5:00–6:00 PM', ongoing: true, fee: '$100', feeNote: 'per session block',
    url: 'https://hypedearborn.leagueapps.com/events/4747103-sports-fitness--performance-training',
    blurb: 'Agility, balance, core strength, speed mechanics and more with Coach Anthony. Limited to 15 athletes.', todo: ['current session dates'] },
  { slug: 'hype-skillz-jamey-petree', title: 'HYPE Skillz with Jamey Petree', sport: 'basketball-training', location: 'dearborn-heights',
    ages: 'Grade 3 – high school', ongoing: true, fee: '$360', feeNote: 'package · first session free',
    url: `${DH}/events/5052658-hype-skillz-training-with-jamey-petree`,
    blurb: 'Small-group training grouped by age, gender and level with a trainer who has developed players from youth to the pros.', todo: ['session times', 'what the package includes'] },
  { slug: 'fearless-small-group-4', title: 'Fearless Training · Small Group Starter', sport: 'basketball-training', location: 'wayne',
    ages: '2–5 athletes', ongoing: true, fee: '$200', feeNote: '4 sessions',
    url: `${W}/camps/4964999-fearless-training-w-joshua-dudley-small-group-training-2-5-athletes--starter-4-s`,
    blurb: 'Train with friends or teammates with Joshua Dudley. Pick your day and time: jdudley@hypeathletics.org.' },
  { slug: 'fearless-small-group-12', title: 'Fearless Training · Small Group Elite', sport: 'basketball-training', location: 'wayne',
    ages: '2–5 athletes', ongoing: true, fee: '$435', feeNote: '12 sessions',
    url: `${W}/camps/4965017-fearless-training-w-joshua-dudley-small-group-training-2-5-athletes-12-sessions`,
    blurb: 'For athletes ready to commit: maximum reps and detailed instruction.' },
  { slug: 'fearless-walk-in', title: 'Fearless Training · Big Group Walk-in', sport: 'basketball-training', location: 'wayne',
    days: 'Mon & Wed', time: '5:30–8:30 PM', ongoing: true,
    url: `${W}/camps/4966290-fearless-training-w-joshua-dudley-big-group-walk-in-training`,
    blurb: 'Drop into a group session with Joshua Dudley.', todo: ['ages', 'fee'] },
];

/* ------------------------------------------------------------------ helpers */

const today = new Date().toISOString().slice(0, 10);

export function isCurrent(p: Program) {
  return p.ongoing || !p.end || p.end >= today;
}

export type Status = { label: string; tone: 'open' | 'soon' | 'live' | 'info' };
export function status(p: Program): Status {
  if (p.ongoing) return { label: p.frontDesk ? 'Monthly · front desk' : 'Join anytime', tone: 'open' };
  if (!p.start) return { label: 'Details soon', tone: 'info' };
  if (p.start > today) {
    const d = new Date(p.start + 'T12:00:00');
    return { label: `Starts ${d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`, tone: 'soon' };
  }
  return { label: 'In progress', tone: 'live' };
}

export const currentPrograms = programs.filter(isCurrent);

/* Age buckets for the "find by age" filter. Grades are mapped to approximate ages (grade + 5). */
export const ageBuckets = [
  { id: 'tots', label: 'Ages 3–6', min: 0, max: 6 },
  { id: 'kids', label: 'Ages 7–9', min: 7, max: 9 },
  { id: 'tweens', label: 'Ages 10–13', min: 10, max: 13 },
  { id: 'teens', label: 'Teens', min: 14, max: 17 },
  { id: 'adults', label: 'Adults', min: 18, max: 99 },
] as const;

export function ageRange(p: Program): [number, number] | null {
  const a = p.ages ?? '';
  if (!a || /athletes/i.test(a)) return null;
  if (/^(18\+|adults?)$|men 18/i.test(a)) return [18, 99];
  const grade = /grade/i.test(a);
  let nums = [...a.matchAll(/(\d+(?:\.\d)?)/g)].map((m) => parseFloat(m[1]));
  if (grade) nums = nums.map((n) => n + 5);
  if (/high school/i.test(a)) nums.push(14, 17);
  if (!nums.length) return null;
  let lo = Math.min(...nums), hi = Math.max(...nums);
  if (/\d\s*\+/.test(a)) hi = 99;
  else if (/and up/i.test(a)) hi = 12;
  return [lo, hi];
}

export function bucketsFor(p: Program): string[] {
  const r = ageRange(p);
  if (!r) return []; // unknown ages: only listed under "All ages" until staff confirm
  return ageBuckets.filter((b) => r[0] <= b.max && r[1] >= b.min).map((b) => b.id);
}
