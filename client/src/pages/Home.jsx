import { Link } from 'react-router-dom';

export default function Home({ user }) {
  return (
    <div className="container">
      <section className="hero card">
        <div className="badge">Secure • Verified • Mobile-first</div>
        <h1>Find Your Perfect Life Partner with Jai Mala</h1>
        <p>
          Modern matrimonial platform with phone-verified profiles, advanced search, smart matchmaking, and private messaging. Join thousands who found their perfect match.
        </p>
        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link className="btn btn-primary" to={user ? '/search' : '/register'}>
            {user ? 'Start Searching' : 'Get Started Free'}
          </Link>
          <Link className="btn btn-secondary" to="/plans">
            View Plans
          </Link>
        </div>
      </section>

      <section className="section">
        <h2 className="section-title">Why Jai Mala?</h2>
        <div className="grid grid-3">
          {[
            { title: '100% Verified', text: 'Phone OTP verification keeps profiles genuine.' },
            { title: 'Advanced Filters', text: 'Search by religion, caste, education, location, and more.' },
            { title: 'Smart Matches', text: 'Compatibility scoring suggests the best partners for you.' },
            { title: 'Private Messaging', text: 'Secure chat to connect with your matches.' },
            { title: 'Mobile First', text: 'Fast, responsive experience across devices.' },
            { title: 'Safety First', text: 'Privacy controls and secure data handling.' }
          ].map((item) => (
            <div key={item.title} className="card">
              <h3>{item.title}</h3>
              <p className="subtle">{item.text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="section card">
        <h2 className="section-title">How it works</h2>
        <div className="grid grid-4" style={{ gap: '1rem' }}>
          {[
            'Create your phone-verified profile',
            'Set preferences and browse verified profiles',
            'Send interests and start conversations',
            'Upgrade to unlock unlimited access'
          ].map((text, idx) => (
            <div key={idx} className="card" style={{ boxShadow: 'none', background: '#fff7fc' }}>
              <div className="badge">Step {idx + 1}</div>
              <p>{text}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
