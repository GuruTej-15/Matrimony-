import { useEffect, useState } from 'react';
import { searchProfiles } from '../lib/api.js';

export default function Search({ user }) {
  const [filters, setFilters] = useState({ location: '', religion: '', education: '' });
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(false);

  const load = async () => {
    setLoading(true);
    const data = await searchProfiles(filters);
    setProfiles(data?.results || []);
    setLoading(false);
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const updateFilter = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <div className="container">
      <div className="card">
        <h2 className="section-title">Search Profiles</h2>
        <p className="subtle">Use filters to find matches faster. Data is demo-only and resets on server restart.</p>
        <div className="grid grid-3" style={{ gap: '1rem', marginTop: '1rem' }}>
          <div>
            <label className="label">Location</label>
            <input className="input" value={filters.location} onChange={(e) => updateFilter('location', e.target.value)} placeholder="e.g. Mumbai" />
          </div>
          <div>
            <label className="label">Religion</label>
            <input className="input" value={filters.religion} onChange={(e) => updateFilter('religion', e.target.value)} placeholder="e.g. Hindu" />
          </div>
          <div>
            <label className="label">Education</label>
            <input className="input" value={filters.education} onChange={(e) => updateFilter('education', e.target.value)} placeholder="e.g. MBA" />
          </div>
        </div>
        <div style={{ marginTop: '1rem', display: 'flex', gap: '0.5rem' }}>
          <button className="btn btn-primary" onClick={load} disabled={loading}>
            {loading ? 'Searching...' : 'Search'}
          </button>
          <button className="btn btn-secondary" onClick={() => { setFilters({ location: '', religion: '', education: '' }); load(); }}>
            Reset
          </button>
        </div>
      </div>

      <div className="section grid grid-3" style={{ gap: '1rem' }}>
        {profiles.map((profile) => (
          <div key={profile.id} className="card">
            <div className="badge">{profile.religion} · {profile.location}</div>
            <h3>{profile.name}, {profile.age}</h3>
            <p className="subtle">{profile.education} | {profile.profession}</p>
            <p style={{ marginTop: '0.5rem' }}>{profile.bio}</p>
            {user ? <button className="btn btn-primary" style={{ marginTop: '0.75rem' }}>Send Interest</button> : <div className="subtle" style={{ marginTop: '0.75rem' }}>Login to send interest</div>}
          </div>
        ))}
        {!profiles.length && !loading && <div className="card">No profiles found. Try different filters.</div>}
      </div>
    </div>
  );
}
