/**
 * PROTOTYPE FIXTURE — hand-written, not derived.
 *
 * The posting is the employer's own text from
 * data/source/carrowmore-array-om-technician.md, set the way the Figma sets it.
 * Where the Figma's copy differs from the posting, the Figma wins, and the
 * difference is listed here rather than left to be found:
 *
 *   - "Wind Turbine Technician (Operations & Maintenance)" is split into a
 *     title and a discipline;
 *   - the pattern is shortened to "14 days on/14 days off, day shift";
 *   - "We do not need" reads "What we do not need".
 *
 * "What we are not" and "Pay and terms" are section headings in the posting.
 * The Figma leaves them as body text, so here they are set as the sections
 * they are.
 */

export type PostingBlock =
  | { type: 'h2' | 'h3' | 'p'; text: string }
  | { type: 'ul'; items: string[] };

interface Posting {
  employer: string;
  location: string;
  title: string;
  discipline: string;
  pattern: string;
  body: PostingBlock[];
}

export const posting: Posting = {
  employer: 'Carrowmore Array Offshore Wind Farm',
  location: 'Cnoc Operations Base',
  title: 'Wind Turbine Technician',
  discipline: 'Operations & Maintenance',
  pattern: '14 days on/14 days off, day shift',
  body: [
    {
      type: 'p',
      text: 'We are building the maintenance team for the Carrowmore Array from scratch and we would rather train good people than hire people with the right certificates and the wrong instincts. If you have spent a career keeping equipment running somewhere that nobody was coming to help you, we want to talk to you.',
    },
    { type: 'h2', text: 'What the job actually is' },
    {
      type: 'p',
      text: 'You will be part of a two- or three-person team working inside turbines. Most days are scheduled maintenance: service visits, filter and oil changes, torque and tension checks, blade inspections from inside the hub, lubrication, cleaning down, replacing worn components. The rest of the time something has failed and you are the person who has to work out what and why, often with a boat waiting and the weather closing in.',
    },
    { type: 'p', text: 'Specifically, across a year you would expect to:' },
    {
      type: 'ul',
      items: [
        'Diagnose faults on 690V and 33kV systems up to the point of isolation',
        'Change out pitch motors, yaw drives, pumps, fans and filters',
        'Work on the hydraulic pitch and brake systems',
        'Climb an 80m tower several times a day and work from the nacelle roof and inside the hub',
        'Rescue a colleague from the tower if it comes to it',
        'Transfer from a moving vessel to a fixed ladder in up to 1.5m significant wave height',
        'Write up what you did clearly enough that the next crew understands it',
      ],
    },
    { type: 'h2', text: 'What we need from you' },
    { type: 'h3', text: 'Essential' },
    {
      type: 'ul',
      items: [
        'A valid offshore safety and survival certificate covering sea survival, fire, first aid and working at height. We will pay for renewals but we cannot mobilise you without one.',
        'Comfortable working at height, in enclosed spaces, and on a small boat in a swell. This is not negotiable and it is the most common reason people do not last.',
        'Hands-on mechanical or electrical maintenance experience on plant you were responsible for. We do not mind what kind of plant.',
        'Offshore medical fitness.',
      ],
    },
    { type: 'h3', text: 'We would be delighted by' },
    {
      type: 'ul',
      items: [
        'Anyone who has maintained generating plant in a place where the nearest spare part was a boat ride away',
        'Fault-finding on electrical systems without a laptop telling you the answer',
        'Experience of working to a permit system',
        'People who have trained and looked after younger colleagues',
      ],
    },
    { type: 'h3', text: 'What we do not need' },
    {
      type: 'ul',
      items: [
        'A degree',
        'Prior wind experience. Genuinely. We have modelled our training around people who have never seen a turbine.',
      ],
    },
    { type: 'h2', text: 'What we are not' },
    {
      type: 'p',
      text: 'This is not a job for someone who wants to be ashore every night, and it is not a job for someone who dislikes heights. Please do not apply because the money is good if either of those is true of you. We would rather you told us now.',
    },
    { type: 'h2', text: 'Pay and terms' },
    {
      type: 'p',
      text: 'Band 4 to Band 6 depending on assessed capability at offer stage, plus offshore allowance. Progression to Senior Technician is by internal assessment, typically at 18 to 30 months.',
    },
  ],
};

/**
 * PROTOTYPE FIXTURE. The fit summary is the Figma's copy. No rule produces it
 * yet, and it is deliberately a sentence rather than a score.
 */
export const fitSummary = {
  title: 'Strong profile fit',
  body: 'Your experience is a strong match for this role. Some requirements are still outstanding.',
};
