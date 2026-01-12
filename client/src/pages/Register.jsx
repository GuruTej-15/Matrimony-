import { useState } from 'react';
import { Link } from 'react-router-dom';
import { sendOtp } from '../lib/firebase.js';
import { verifyPhone } from '../lib/api.js';

export default function Register() {
  const [phone, setPhone] = useState('');
  const [name, setName] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [confirmation, setConfirmation] = useState(null);
  const [step, setStep] = useState('send');

  const sendCode = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const result = await sendOtp(phone);
      setConfirmation(result);
      setStep('verify');
    } catch (err) {
      setError(err?.message || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  const verifyCode = async (e) => {
    e.preventDefault();
    if (!confirmation) return;
    setError('');
    setLoading(true);
    try {
      const cred = await confirmation.confirm(otp);
      const idToken = await cred.user.getIdToken();
      await verifyPhone({ idToken, phone: cred.user.phoneNumber, name });
      setStep('done');
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || 'Invalid OTP');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container" style={{ maxWidth: 520 }}>
      <div id="recaptcha-container"></div>
      <div className="card">
        <h2 className="section-title">Create Your Account</h2>
        <p className="subtle">Verify your phone to create a secure, trusted profile.</p>

        {step === 'send' && (
          <form onSubmit={sendCode} className="grid" style={{ gap: '1rem' }}>
            <div>
              <label className="label">Full Name</label>
              <input className="input" value={name} onChange={(e) => setName(e.target.value)} required />
            </div>
            <div>
              <label className="label">Phone Number</label>
              <input className="input" placeholder="+91XXXXXXXXXX" value={phone} onChange={(e) => setPhone(e.target.value)} required />
            </div>
            {error && <div className="badge" style={{ background: '#ffe6e6', color: '#b00020' }}>{error}</div>}
            <button className="btn btn-primary" type="submit" disabled={loading}>
              {loading ? 'Sending...' : 'Send OTP'}
            </button>
          </form>
        )}

        {step === 'verify' && (
          <form onSubmit={verifyCode} className="grid" style={{ gap: '1rem' }}>
            <div>
              <label className="label">Enter OTP</label>
              <input className="input" value={otp} onChange={(e) => setOtp(e.target.value)} required />
            </div>
            {error && <div className="badge" style={{ background: '#ffe6e6', color: '#b00020' }}>{error}</div>}
            <button className="btn btn-primary" type="submit" disabled={loading}>
              {loading ? 'Verifying...' : 'Verify & Create'}
            </button>
          </form>
        )}

        {step === 'done' && <div className="badge">Account created and logged in</div>}

        <p className="subtle" style={{ marginTop: '1rem' }}>
          Already have an account? <Link to="/login">Login</Link>
        </p>
      </div>
    </div>
  );
}
