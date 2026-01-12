import { useEffect, useState } from 'react';
import { fetchPlans } from '../lib/api.js';

const payNow = (plan) => {
  const options = {
    key: import.meta.env.VITE_RAZORPAY_KEY,
    amount: plan === 'gold' ? 99900 : 199900, // paise me
    currency: "INR",
    name: "Jai Mala",
    description: plan === 'gold' ? "Gold Plan" : "Platinum Plan",
    handler: function (response) {
      alert("Payment successful 🎉\nPayment ID: " + response.razorpay_payment_id);
    },
    theme: {
      color: "#e11d48"
    }
  };

  const rzp = new window.Razorpay(options);
  rzp.open();
};


export default function Plans() {
  const [plans, setPlans] = useState([]);

  useEffect(() => {
    const load = async () => {
      const data = await fetchPlans();
      setPlans(data?.plans || []);
    };
    load();
  }, []);

  return (
    <div className="container">
      <h2 className="section-title">Membership Plans</h2>
      <p className="subtle">Upgrade for unlimited views, interests, and premium placement.</p>
      <div className="grid grid-3" style={{ gap: '1rem' }}>
        {plans.map((plan) => (
          <div key={plan.id} className="card" style={plan.popular ? { border: '2px solid #c44569' } : {}}>
            <div className="badge">{plan.name}</div>
            <h3 style={{ marginTop: '0.5rem' }}>{plan.price}</h3>
            <p className="subtle">{plan.description}</p>
            <ul className="list" style={{ marginTop: '0.75rem' }}>
              {plan.features.map((f) => (
                <li key={f}>• {f}</li>
              ))}
            </ul>
            <button onClick={() => payNow('gold')}>
                  Buy Gold
                </button>

                <button onClick={() => payNow('platinum')}>
                Buy Platinum
            </button>
          </div>
        ))}
        {!plans.length && <div className="card">Plans will load shortly.</div>}
      </div>
    </div>
  );
}
