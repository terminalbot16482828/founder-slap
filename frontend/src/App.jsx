import { useMemo, useState } from 'react';

const API_BASE = import.meta.env.VITE_API_BASE || '/api';

const DEMO_PROMPTS = [
  'I need to launch this week, fix onboarding, and stop doomscrolling.',
  'I keep shipping tiny tasks but avoiding the core feature and launch post.',
  'My landing page is weak, my API is flaky, and I am stuck in planning mode.'
];

export default function App() {
  const [text, setText] = useState('');
  const [roastLevel, setRoastLevel] = useState('light');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [plan, setPlan] = useState(null);
  const [done, setDone] = useState(false);
  const [copied, setCopied] = useState(false);

  const canSubmit = useMemo(() => text.trim().length >= 8 && !loading, [text, loading]);

  async function generatePlan() {
    setLoading(true);
    setError('');
    setDone(false);
    setCopied(false);

    try {
      const res = await fetch(`${API_BASE}/plan`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, roastLevel }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to generate plan');
      setPlan(data);
    } catch (err) {
      setError(err.message || 'Something went wrong');
      setPlan(null);
    } finally {
      setLoading(false);
    }
  }

  async function copyPlan() {
    if (!plan) return;
    const payload = [
      'Founder Slap Plan',
      '',
      'Top 3 Priorities:',
      ...plan.priorities.map((p, i) => `${i + 1}. ${p}`),
      '',
      `10-Minute Step: ${plan.tenMinuteStep}`,
      `Roast (${roastLevel}): ${plan.roast}`,
    ].join('\n');

    await navigator.clipboard.writeText(payload);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  }

  return (
    <div className="page">
      <div className="card">
        <h1>Founder Slap</h1>
        <p className="subtitle">Messy thought in. Action plan out. Plus one respectful roast.</p>

        <div className="chips">
          {DEMO_PROMPTS.map((prompt) => (
            <button key={prompt} className="chip" onClick={() => setText(prompt)}>
              Demo prompt
            </button>
          ))}
        </div>

        <label htmlFor="idea" className="label">Drop your brain dump</label>
        <textarea
          id="idea"
          rows={6}
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="I need to launch this week, fix onboarding, and stop doomscrolling..."
        />

        <div className="controls">
          <label className="label inline">Roast intensity:</label>
          <select value={roastLevel} onChange={(e) => setRoastLevel(e.target.value)}>
            <option value="light">Light</option>
            <option value="savage">Savage</option>
          </select>
        </div>

        <button disabled={!canSubmit} onClick={generatePlan}>
          {loading ? 'Generating...' : 'Generate Plan'}
        </button>

        {error && <p className="error">⚠️ {error}</p>}

        {plan && (
          <div className="results">
            <section>
              <h2>Top 3 Priorities</h2>
              <ol>
                {plan.priorities.map((p) => <li key={p}>{p}</li>)}
              </ol>
            </section>

            <section>
              <h2>Do This in 10 Minutes</h2>
              <p>{plan.tenMinuteStep}</p>
            </section>

            <section>
              <h2>Roast of the Day</h2>
              <p>🔥 {plan.roast}</p>
            </section>

            <div className="actions">
              <button className="secondary" onClick={copyPlan}>Copy result</button>
              {copied && <span className="copied">Copied</span>}
            </div>

            <label className="done">
              <input type="checkbox" checked={done} onChange={(e) => setDone(e.target.checked)} />
              I did the first step
            </label>

            {done && <p className="celebrate">🎉 Momentum unlocked. Keep shipping.</p>}
          </div>
        )}
      </div>
    </div>
  );
}
