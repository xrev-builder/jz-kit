// Insurance & employer fitness benefits accepted at HYPE Athletics.
// Program list comes from HYPE's current website. Program descriptions are general and change by plan year.
//
// TODO (from HYPE staff): every field marked `hype` is a placeholder until confirmed:
//   - which centers accept each program
//   - what the benefit covers at HYPE (gym only? classes? child care?)
//   - any cost to the member at HYPE
//   - the exact activation steps at the front desk

export type ProgramId = 'silversneakers' | 'silverfit' | 'renewactive' | 'activefit' | 'activefit-enterprise' | 'prime' | 'peerfit' | 'wellhub';
export type Audience = 'medicare' | 'employer';

export type InsuranceProgram = {
  id: ProgramId;
  name: string;
  audience: Audience[];
  who: string;              // who usually has it (general)
  how: string;              // how to check eligibility (general)
  url?: string;             // official eligibility site
  hype: {                   // HYPE-specific details (placeholders until confirmed)
    centers?: string;       // e.g. 'Dearborn Heights & Wayne'
    covers?: string;        // e.g. 'Gym, cardio and group classes'
    cost?: string;          // e.g. '$0 with an eligible plan'
  };
};

export const insurancePrograms: InsuranceProgram[] = [
  {
    id: 'silversneakers', name: 'SilverSneakers', audience: ['medicare'],
    who: 'Included with many Medicare Advantage plans and some Medicare Supplement plans.',
    how: 'Enter your plan info on the SilverSneakers site to get your member ID.',
    url: 'https://tools.silversneakers.com/',
    hype: {},
  },
  {
    id: 'silverfit', name: 'Silver&Fit', audience: ['medicare'],
    who: 'Offered through some Medicare Advantage, Medicare Supplement and retiree plans.',
    how: 'Check eligibility on the Silver&Fit site or call the number on your insurance card.',
    url: 'https://www.silverandfit.com/',
    hype: {},
  },
  {
    id: 'renewactive', name: 'Renew Active', audience: ['medicare'],
    who: 'For UnitedHealthcare Medicare Advantage members, including AARP Medicare Advantage plans.',
    how: 'Get your confirmation code from your UnitedHealthcare member account.',
    hype: {},
  },
  {
    id: 'activefit', name: 'Active&Fit', audience: ['employer'],
    who: 'Offered through some employer and commercial health plans.',
    how: 'Check your health plan’s member site or the Active&Fit site.',
    url: 'https://www.activeandfit.com/',
    hype: {},
  },
  {
    id: 'activefit-enterprise', name: 'Active&Fit Enterprise', audience: ['employer'],
    who: 'An Active&Fit option offered through some employers and health plans.',
    how: 'Ask your HR team or check your benefits portal.',
    hype: {},
  },
  {
    id: 'prime', name: 'Prime Fitness', audience: ['employer'],
    who: 'A gym network offered through some employer and commercial health plans.',
    how: 'Check your health plan’s member site or ask your HR team.',
    hype: {},
  },
  {
    id: 'peerfit', name: 'Peerfit', audience: ['employer'],
    who: 'Fitness credits offered through some employers and health plans.',
    how: 'Log in to Peerfit through your employer or health plan.',
    hype: {},
  },
  {
    id: 'wellhub', name: 'Wellhub', audience: ['employer'],
    who: 'Formerly Gympass. An employer wellness benefit with gym access.',
    how: 'Download the Wellhub app through your employer and choose HYPE.',
    url: 'https://wellhub.com/',
    hype: {},
  },
];

// One-tap picker on /insurance/. Each pick gives an instant answer. Carrier pairings reflect common
// plans, not guarantees, so the answer is always phrased as "often/usually" and offers a staff check.
export type Pick = { id: string; label: string; sub?: string; programs: ProgramId[]; answer: string; known?: boolean };
export const picks: Pick[] = [
  { id: 'humana', label: 'Humana', sub: 'Medicare', programs: ['silversneakers'], answer: 'Many Humana Medicare plans include SilverSneakers, which HYPE accepts.' },
  { id: 'uhc', label: 'UnitedHealthcare', sub: 'incl. AARP Medicare', programs: ['renewactive'], answer: 'UnitedHealthcare Medicare Advantage plans usually include Renew Active, which HYPE accepts.' },
  { id: 'aetna', label: 'Aetna', sub: 'Medicare', programs: ['silversneakers'], answer: 'Many Aetna Medicare plans include SilverSneakers, which HYPE accepts.' },
  { id: 'bcbs', label: 'Blue Cross', sub: 'Blue Shield of Michigan', programs: ['silversneakers'], answer: 'Many Blue Cross Medicare plans include a fitness benefit like SilverSneakers, which HYPE accepts.' },
  { id: 'silversneakers', label: 'SilverSneakers', sub: 'I have it', programs: ['silversneakers'], answer: 'HYPE accepts SilverSneakers.', known: true },
  { id: 'silverfit', label: 'Silver&Fit', sub: 'I have it', programs: ['silverfit'], answer: 'HYPE accepts Silver&Fit.', known: true },
  { id: 'renewactive', label: 'Renew Active', sub: 'I have it', programs: ['renewactive'], answer: 'HYPE accepts Renew Active.', known: true },
  { id: 'employer', label: 'Through my job', sub: 'Active&Fit, Wellhub, Peerfit…', programs: ['activefit', 'activefit-enterprise', 'prime', 'peerfit', 'wellhub'], answer: 'HYPE accepts Active&Fit, Prime Fitness, Peerfit and Wellhub through employers. Check your benefits portal or ask HR which one you have.' },
  { id: 'other', label: 'Other / not sure', sub: 'We’ll check for you', programs: [], answer: 'No problem. Leave your number and we’ll find out what your plan covers.' },
];

// Carrier → program shortcuts (legacy finder; kept for reference). These reflect common pairings, not guarantees;
// plans change every year, so the finder always tells people to confirm (or lets HYPE check).
export const carriers: { id: string; name: string; likely: ProgramId[]; note?: string }[] = [
  { id: 'humana', name: 'Humana', likely: ['silversneakers'] },
  { id: 'uhc', name: 'UnitedHealthcare / AARP', likely: ['renewactive'] },
  { id: 'aetna', name: 'Aetna', likely: ['silversneakers'] },
  { id: 'bcbsm', name: 'Blue Cross Blue Shield of Michigan', likely: ['silversneakers'], note: 'Many Blue Cross Medicare plans include a fitness benefit. Confirm yours on your member card or account.' },
  { id: 'other', name: 'Another company (HAP, Priority Health, Wellcare, Cigna…)', likely: ['silversneakers', 'silverfit'], note: 'Several Michigan Medicare plans include SilverSneakers or Silver&Fit. We’re happy to check yours.' },
];
