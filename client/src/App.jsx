import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import Layout from './components/Layout.jsx';
import Home from './pages/Home.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import Search from './pages/Search.jsx';
import Profile from './pages/Profile.jsx';
import Matches from './pages/Matches.jsx';
import Chat from './pages/Chat.jsx';
import Plans from './pages/Plans.jsx';
import { subscribeAuth, signOutUser } from './lib/firebase.js';

export default function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsub = subscribeAuth((fbUser) => {
      if (fbUser) {
        setUser({ uid: fbUser.uid, phone: fbUser.phoneNumber });
      } else {
        setUser(null);
      }
    });
    return () => unsub();
  }, []);

  const handleLogout = () => {
    signOutUser();
    setUser(null);
  };

  return (
    <Router>
      <Layout user={user} onLogout={handleLogout}>
        <Routes>
          <Route path="/" element={<Home user={user} />} />
          <Route path="/login" element={user ? <Navigate to="/search" replace /> : <Login />} />
          <Route path="/register" element={user ? <Navigate to="/profile" replace /> : <Register />} />
          <Route path="/search" element={user ? <Search user={user} /> : <Navigate to="/login" replace />} />
          <Route path="/matches" element={user ? <Matches /> : <Navigate to="/login" replace />} />
          <Route path="/chat" element={user ? <Chat user={user} /> : <Navigate to="/login" replace />} />
          <Route path="/profile" element={user ? <Profile /> : <Navigate to="/login" replace />} />
          <Route path="/plans" element={<Plans />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Layout>
    </Router>
  );
}
