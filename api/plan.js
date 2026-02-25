const PRIORITY_RULES = [
  { keywords: ['onboard', 'signup', 'activation', 'funnel'], priority: 'Fix onboarding friction so new users can reach first value fast.' },
  { keywords: ['launch', 'ship', 'release', 'publish'], priority: 'Define and commit to a concrete launch scope you can ship this week.' },
  { keywords: ['landing', 'website', 'copy'], priority: 'Tighten the landing page headline + CTA for a clearer first impression.' },
  { keywords: ['social', 'twitter', 'x', 'content'], priority: 'Create one repeatable distribution post format instead of ad-hoc posting.' },
  { keywords: ['bug', 'error', 'crash', 'broken'], priority: 'Stabilize the highest-impact bug before adding new features.' },
  { keywords: ['procrastin', 'doomscroll', 'distract'], priority: 'Remove your top distraction and run one focused build block today.' },
  { keywords: ['api', 'backend', 'server'], priority: 'Lock down one reliable API path end-to-end and verify it with a test call.' }
];

const DEFAULT_PRIORITIES = [
  'Pick one small, demoable feature and finish it today.',
  'Write a visible definition of done before touching code.',
  'Publish one progress update to create accountability.'
];

const ROASTS = [
  'You don\'t need more motivation. You need to click “start” and survive 10 focused minutes.',
  'Your to-do list isn\'t the bottleneck. Avoidance is.',
  'You\'re one deploy away from momentum but acting like another tab will save you.',
  'You can doomscroll after you ship. In that order.',
  'Perfection is just procrastination wearing a startup hoodie.'
];

function scoreRule(text, rule) {
  return rule.keywords.reduce((score, kw) => score + (text.includes(kw) ? 1 : 0), 0);
}

function buildPlan(rawInput) {
  const input = (rawInput || '').toLowerCase();
  const scored = PRIORITY_RULES
    .map((rule) => ({ rule, score: scoreRule(input, rule) }))
    .filter((r) => r.score > 0)
    .sort((a, b) => b.score - a.score)
    .map((r) => r.rule.priority);

  const picked = [...new Set(scored)].slice(0, 3);
  while (picked.length < 3) {
    for (const fallback of DEFAULT_PRIORITIES) {
      if (picked.length < 3 && !picked.includes(fallback)) picked.push(fallback);
    }
  }

  const tenMinuteStep = (() => {
    if (input.includes('onboard')) return 'Open onboarding flow and write a 5-step happy path. Remove one step today.';
    if (input.includes('landing') || input.includes('website')) return 'Rewrite your hero headline + CTA in one sentence each, then publish.';
    if (input.includes('launch') || input.includes('ship')) return 'Create a launch checklist with exactly 5 items and complete item #1 now.';
    if (input.includes('doomscroll') || input.includes('distract')) return 'Put your phone in another room and start a 10-minute timer for one task.';
    return 'Pick one task from Priority #1 and do exactly 10 focused minutes right now.';
  })();

  const roast = ROASTS[Math.floor(Math.random() * ROASTS.length)];

  return {
    priorities: picked,
    tenMinuteStep,
    roast,
    confidence: scored.length > 0 ? 'contextual' : 'default'
  };
}

module.exports = (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { text } = req.body || {};
  if (!text || typeof text !== 'string' || text.trim().length < 8) {
    return res.status(400).json({ error: 'Please provide a longer thought (at least 8 chars).' });
  }

  return res.status(200).json(buildPlan(text));
};
