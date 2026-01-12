import { useEffect, useState } from 'react';
import { fetchProfile, updateProfile } from '../lib/api.js';

const initial = {
  name: '',
  age: 28,
  location: '',
  religion: '',
  education: '',
  profession: '',
  bio: ''
};

export default function Profile() {
  const [profile, setProfile] = useState(initial);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const load = async () => {
    setLoading(true);
    const data = await fetchProfile();
    setProfile(data);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const handleChange = (key, value) => {
    setProfile((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    await updateProfile(profile);
    setMessage('Profile saved');
    setLoading(false);
    setTimeout(() => setMessage(''), 1500);
  };

  return (
    <div className="container" style={{ maxWidth: 720 }}>
      <div className="card">
        <h2 className="section-title">My Profile</h2>
        <p className="subtle">Update your details. Data is stored in-memory for this demo.</p>
        <form className="grid grid-2" style={{ gap: '1rem' }} onSubmit={handleSubmit}>
          <div>
            <label className="label">Full Name</label>
            <input className="input" value={profile.name} onChange={(e) => handleChange('name', e.target.value)} required />
          </div>
          <div>
            <label className="label">Age</label>
            <input className="input" type="number" value={profile.age} onChange={(e) => handleChange('age', Number(e.target.value))} required />
          </div>
          <div>
            <label className="label">Location</label>
            <input className="input" value={profile.location} onChange={(e) => handleChange('location', e.target.value)} />
          </div>
          <div>
            <label className="label">Religion</label>
            <input className="input" value={profile.religion} onChange={(e) => handleChange('religion', e.target.value)} />
          </div>
          <div>
            <label className="label">Education</label>
            <input className="input" value={profile.education} onChange={(e) => handleChange('education', e.target.value)} />
          </div>
          <div>
            <label className="label">Profession</label>
            <input className="input" value={profile.profession} onChange={(e) => handleChange('profession', e.target.value)} />
          </div>
          <div style={{ gridColumn: '1 / -1' }}>
            <label className="label">Bio</label>
            <textarea className="input" style={{ minHeight: 120, resize: 'vertical' }} value={profile.bio} onChange={(e) => handleChange('bio', e.target.value)} />
          </div>
          <div style={{ gridColumn: '1 / -1', display: 'flex', gap: '0.5rem' }}>
            <button className="btn btn-primary" type="submit" disabled={loading}>{loading ? 'Saving...' : 'Save Profile'}</button>
            {message && <div className="badge">{message}</div>}
          </div>
        </form>
      </div>
    </div>
  );
}
