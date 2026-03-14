import React, { useEffect, useState } from 'react';

export default function Lessons() {
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('http://localhost:5000/api/lessons').then(r => r.json()).then(data => {
      if (data.ok) setLessons(data.lessons);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  async function buy(lessonId) {
    try {
      const res = await fetch('http://localhost:5000/api/create-checkout-session', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ lessonId }) });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        const msg = data && (data.error || data.message) ? (data.error || data.message) : JSON.stringify(data);
        alert('Could not create checkout session: ' + msg);
      }
    } catch (err) { console.error(err); alert('Error creating checkout'); }
  }

  if (loading) return <div style={{ padding: '2rem' }}>Loading...</div>;

  return (
    <section style={{ padding: '2rem' }}>
      <h2>Lessons</h2>
      <div className="lessons-grid">
        {lessons.map(l => (
          <div className="lesson-card" key={l.id}>
            <h3 style={{ textAlign: 'center', margin: '0 0 0.5rem 0' }}>{l.title}</h3>
            <div className="lesson-description">
              <p style={{ textAlign: 'center', margin: '0' }}>{l.description}</p>
            </div>
            <p style={{ fontWeight: 'bold', textAlign: 'center', margin: '0.5rem 0' }}>${(l.price || 0).toFixed(2)}</p>
            {/* preview video - use previewVideo field if exists */}
            {l.previewVideo && (
              <video width="100%" height="300" controls preload="metadata">
                <source src={`/previews/${l.previewVideo}`} type="video/mp4" />
                Your browser does not support the video tag.
              </video>
            )}
            <div style={{ marginTop: '.5rem', textAlign: 'center' }}>
              <button className="buy-btn" onClick={() => buy(l.id)}>Buy Lesson</button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
