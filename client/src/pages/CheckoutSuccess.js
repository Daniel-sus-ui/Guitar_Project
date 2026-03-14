import React, { useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';

export default function CheckoutSuccess(){
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    const session_id = searchParams.get('session_id');
    if (!session_id) return;
    // Exchange session_id for a secure lesson token
    fetch('http://localhost:5000/api/verify-session', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ sessionId: session_id }) })
      .then(r => r.json()).then(data => {
        if (data.ok && data.token) {
          // Redirect to lesson
          navigate(`/lesson/${data.token}`);
        } else {
          alert('Payment verified but could not obtain lesson link.');
        }
      }).catch(err => { console.error(err); alert('Error verifying payment'); });
  }, [searchParams, navigate]);

  return <div style={{ padding: '2rem' }}>Verifying payment and preparing your lesson...</div>;
}
