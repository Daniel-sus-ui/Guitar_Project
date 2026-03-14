import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

export default function LessonPage(){
  const { token } = useParams();
  const [lesson, setLesson] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch(`http://localhost:5000/api/lesson/${token}`).then(r => r.json()).then(data => {
      if (data.ok) setLesson(data.lesson);
      else setError(data.error || 'Unable to load');
    }).catch(err => setError('server_error'));
  }, [token]);

  if (error) return <div style={{ padding: '2rem' }}>Access denied or error: {error}</div>;
  if (!lesson) return <div style={{ padding: '2rem' }}>Loading lesson...</div>;

  return (
    <div style={{ padding: '2rem' }}>
      <h2>{lesson.title}</h2>
      <p>{lesson.description}</p>
      <div style={{ display: 'grid', gap: '1rem' }}>
        {lesson.topics.map(t => (
          <div key={t.id} style={{ border: '2px solid #3498db', padding: '1rem', borderRadius: 8, background: 'linear-gradient(135deg, #f5f7fa, #b7d1ff, #6e82a3)' }}>
            <h4>{t.title}</h4>
            <p>{t.description}</p>
            <video controls width="700" height="340" preload="metadata" style={{ maxWidth: '100%', height: 'auto' }}>
              <source src={t.streamUrl} type="video/mp4" />
              Your browser does not support the video tag.
            </video>
          </div>
        ))}
      </div>
    </div>
  );
}
