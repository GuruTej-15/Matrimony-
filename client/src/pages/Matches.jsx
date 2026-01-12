import { useEffect, useState } from 'react';
import { fetchMatches } from '../lib/api.js';

export default function Matches() {
  const [matches, setMatches] = useState([]);

  useEffect(() => {
    const load = async () => {
      const data = await fetchMatches();
      setMatches(data?.results || []);
    };
    load();
  }, []);

  return (
    <div className="container">
      <h2 className="section-title">Suggested Matches</h2>
      <p className="subtle">Compatibility scores are demo-only.</p>
      <div className="grid grid-3" style={{ gap: '1rem' }}>
        {matches.map((match) => (
          <div key={match.id} className="card">
            <div className="badge">Compatibility {match.score}%</div>
            <h3>{match.name}</h3>
            <p className="subtle">{match.location} · {match.education}</p>
            <p style={{ marginTop: '0.5rem' }}>{match.bio}</p>
          </div>
        ))}
        {!matches.length && <div className="card">No matches found yet.</div>}
      </div>
    </div>
  );
}
