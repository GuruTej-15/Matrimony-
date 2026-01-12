import { useEffect, useState } from "react";
import { api } from "../lib/api";

export default function Payments() {
  const [list, setList] = useState([]);

  useEffect(() => {
    api.get("/api/payments").then(res => setList(res.data.payments));
  }, []);

  return (
    <div className="container">
      <h2>Payment History</h2>
      {list.map((p, i) => (
        <div key={i} className="card">
          <p>Plan: {p.plan}</p>
          <p>Payment ID: {p.paymentId}</p>
        </div>
      ))}
    </div>
  );
}
