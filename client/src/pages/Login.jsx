import { useState } from 'react';
import { Link } from 'react-router-dom';
import { sendOtp } from '../lib/firebase.js';
import { verifyPhone } from '../lib/api.js';

export default function Login() {
  const [phone, setPhone] = useState('');
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
      await verifyPhone({ idToken, phone: cred.user.phoneNumber });
      setStep('done');
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || 'Invalid OTP');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container" style={{ maxWidth: 480 }}>
      <div id="recaptcha-container"></div>
      <div className="card">
        <h2 className="section-title">Login with Phone</h2>
        <p className="subtle">Enter your phone number, get OTP, verify, and you are in.</p>

        {step === 'send' && (
          <form onSubmit={sendCode} className="grid" style={{ gap: '1rem' }}>
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
              {loading ? 'Verifying...' : 'Verify & Login'}
            </button>
          </form>
        )}

        {step === 'done' && <div className="badge">Logged in successfully</div>}

        <p className="subtle" style={{ marginTop: '1rem' }}>
          New here? <Link to="/register">Create an account</Link>
        </p>
      </div>
    </div>
  );
}
