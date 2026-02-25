import { useMemo, useState } from 'react';

const API_BASE = import.meta.env.VITE_API_BASE || '';

export default function App() {
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [plan, setPlan] = useState(null);
  const [done, setDone] = useState(false);

  const canSubmit = useMemo(() => text.trim().length >= 8 && !loading, [text, loading]);

  async function generatePlan() {
    setLoading(true);
    setError('');
    setDone(false);

    try {
      const res = await fetch(`${API_BASE}/plan`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
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

  return (
    <div className="page">
      <div className="card">
        <h1>Founder Slap</h1>
        <p className="subtitle">Messy thought in. Action plan out. Plus one respectful roast.</p>

        <label htmlFor="idea" className="label">Drop your brain dump</label>
        <textarea
          id="idea"
          rows={6}
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="I need to launch this week, fix onboarding, and stop doomscrolling..."
        />

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
