import { useEffect, useState } from 'react';
import { fetchMessages, sendMessage, fetchMatches } from '../lib/api.js';

export default function Chat({ user }) {
  const [partnerId, setPartnerId] = useState('u2');
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [options, setOptions] = useState([]);

  useEffect(() => {
    const load = async () => {
      const data = await fetchMessages(partnerId);
      setMessages(data?.messages || []);
    };
    load();
  }, [partnerId]);

  useEffect(() => {
    const loadMatches = async () => {
      const data = await fetchMatches();
      setOptions(data?.results || []);
    };
    loadMatches();
  }, []);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    await sendMessage(partnerId, text.trim());
    setText('');
    const data = await fetchMessages(partnerId);
    setMessages(data?.messages || []);
  };

  return (
    <div className="container" style={{ maxWidth: 820 }}>
      <div className="card">
        <h2 className="section-title">Chat</h2>
        <p className="subtle">Messages are stored in memory for this demo.</p>
        <div style={{ marginBottom: '1rem' }}>
          <label className="label">Select a match</label>
          <select className="input" value={partnerId} onChange={(e) => setPartnerId(e.target.value)}>
            {options.map((opt) => (
              <option key={opt.id} value={opt.id}>{opt.name}</option>
            ))}
          </select>
        </div>
        <div className="card" style={{ background: '#fff7fc', maxHeight: 260, overflowY: 'auto' }}>
          {messages.map((m, idx) => (
            <div key={idx} style={{ marginBottom: '0.75rem' }}>
              <div className="badge" style={{ marginBottom: '0.25rem' }}>{m.from === 'me' ? 'You' : m.from}</div>
              <div>{m.body}</div>
            </div>
          ))}
          {!messages.length && <div className="subtle">No messages yet. Say hello!</div>}
        </div>
        <form onSubmit={handleSend} style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
          <input className="input" value={text} onChange={(e) => setText(e.target.value)} placeholder="Type a message" />
          <button className="btn btn-primary" type="submit">Send</button>
        </form>
      </div>
    </div>
  );
}
