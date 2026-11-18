// /llms.txt: plain-text facts for AI assistants and answer engines (GEO).
// Generated from the same data as the site, so it never drifts.
import type { APIRoute } from 'astro';
import { org, locations, hours, membership, sports, rentals, events } from '../data/site';
import { currentPrograms } from '../data/programs';

export const GET: APIRoute = () => {
  const L: string[] = [];
  L.push(`# ${org.name}`, '');
  L.push(`> ${org.name} (${org.expansion}) is a nonprofit recreation and youth-development organization in Wayne County, Michigan, founded in ${org.founded} by ${org.founder}. It runs recreation centers in Dearborn Heights and Wayne and manages the Belle Isle Athletic Complex in Detroit.`, '');
  L.push('## Locations');
  for (const l of Object.values(locations)) L.push(`- ${l.fullName}: ${l.street}, ${l.city}, ${l.region} ${l.zip}. Phone ${l.phone}. ${l.summary} https://hypeathletics.org/${l.id}/`);
  L.push('', '## Hours (Dearborn Heights and Wayne)');
  for (const h of hours) L.push(`- ${h.days}: ${h.time}`);
  L.push('', '## Membership (monthly; bank draft price, credit card +$3)', `Free day pass for first-time visitors (verify phone and email): https://hypeathletics.org/day-pass/. Includes ${membership.included.join(', ').toLowerCase()}. Join: https://hypeathletics.org/membership/`);
  for (const m of membership.locations) L.push(`- ${locations[m.id].name} (${m.access.toLowerCase()}): ` + m.tiers.map((t) => `${t.name} $${t.eft}`).join(', '));
  L.push(`- Insurance fitness programs accepted: ${membership.insurance.join(', ')}.`);
  L.push('', '## Programs currently listed', 'Register online via the program page or at the front desk. Full list: https://hypeathletics.org/programs/');
  for (const p of currentPrograms) {
    const bits = [p.ages, p.days, p.time, p.dates ?? (p.ongoing ? 'ongoing' : ''), p.fee && `${p.fee}${p.feeNote ? ' ' + p.feeNote : ''}`].filter(Boolean).join('; ');
    L.push(`- ${p.title} (${sports.find((s) => s.id === p.sport)!.name}, ${locations[p.location].name}): ${bits}. https://hypeathletics.org/programs/${p.slug}/`);
  }
  L.push('', '## Rentals', `- Dearborn Heights courts and gym: contact ${rentals['dearborn-heights'].contact.name}, ${rentals['dearborn-heights'].contact.email}, ${rentals['dearborn-heights'].contact.phone}.`);
  L.push(`- Wayne event hall (50-400 guests) and Belle Isle fields: contact ${rentals.wayne.contact.name}, ${rentals.wayne.contact.email}, ${rentals.wayne.contact.phone}.`);
  L.push('- Quote form: https://hypeathletics.org/rentals/');
  L.push('', '## Upcoming events');
  for (const e of events) L.push(`- ${e.title}: ${e.dateLabel}. ${e.blurb}`);
  L.push('', '## Community services', '- Free Summer Discovery program for incoming grades 1-10 at 10 Wayne County sites: https://hypeathletics.org/summer-discovery/', '- S.A.F.E. substance abuse prevention and support, academic assistance, vocational training, annual scholarship: https://hypeathletics.org/social-services/');
  L.push('', '## Contact', `- ${org.phone} · ${org.email} · https://hypeathletics.org/contact-us/`, '');
  return new Response(L.join('\n'), { headers: { 'content-type': 'text/plain; charset=utf-8' } });
};
