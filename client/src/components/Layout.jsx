import { Link, useLocation } from 'react-router-dom';

export default function Layout({ children, user, onLogout }) {
  const location = useLocation();
  const isActive = (path) => location.pathname === path;

  return (
    <div className="app-shell">
      <header className="navbar">
        <div className="navbar-inner">
          <Link to="/" className="nav-link" style={{ paddingLeft: 0 }}>
            Jai Mala
          </Link>
          <nav className="nav-links">
            <Link className={`nav-link ${isActive('/') ? 'active' : ''}`} to="/">Home</Link>
            <Link className={`nav-link ${isActive('/search') ? 'active' : ''}`} to="/search">Search</Link>
            <Link className={`nav-link ${isActive('/matches') ? 'active' : ''}`} to="/matches">Matches</Link>
            <Link className={`nav-link ${isActive('/plans') ? 'active' : ''}`} to="/plans">Plans</Link>
            {user ? (
              <>
                <Link className={`nav-link ${isActive('/chat') ? 'active' : ''}`} to="/chat">Chat</Link>
                <Link className={`nav-link ${isActive('/profile') ? 'active' : ''}`} to="/profile">Profile</Link>
                <button className="btn btn-secondary" onClick={onLogout}>Logout</button>
              </>
            ) : (
              <>
                <Link className="btn btn-secondary" to="/login">Login</Link>
                <Link className="btn btn-primary" to="/register">Register</Link>
              </>
            )}
          </nav>
        </div>
      </header>
      <main className="content">{children}</main>
      <footer className="footer">
        <div className="footer-inner">
          <div>Jai Mala © 2026</div>
          <div className="subtle">Secure | Verified | Made for India</div>
        </div>
      </footer>
    </div>
  );
}
