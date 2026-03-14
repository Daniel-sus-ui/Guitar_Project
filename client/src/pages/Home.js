import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import photo1 from "../assets/photo1.png";
import photo2 from "../assets/photo2.jpg";
import photo3 from "../assets/photo3.jpg";
import video1 from "../assets/video1.mp4";


function useScrollAnimation() {
  const ref = useRef();
  useEffect(() => {
    const elements = ref.current ? Array.from(ref.current.querySelectorAll('.panel')) : [];
    const obs = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) e.target.classList.add('visible');
      });
    }, { threshold: 0.2 });
    elements.forEach(el => obs.observe(el));
    return () => obs.disconnect();
  }, []);
  return ref;
}

export default function Home() {
  const containerRef = useScrollAnimation();
  return (
    <div>
      <section className="hero">
        <div className="hero-inner">
          <div>
            <h1 style={{ textShadow: '2px 2px 0 #ddd, 4px 4px 0 #bbb, 6px 6px 15px rgba(0,0,0,0.4)' }}>John Smith — Guitar Lessons</h1>
            <p style={{ textShadow: '1px 1px 0 rgba(0,0,0,0.2)' }}>Learn songs with clear, structured video lessons for acoustic and electric guitar.</p>
            <Link className="nav-btn" to="/lessons">View Lessons</Link>
          </div>
          <div className="hero-image" style={{ backgroundImage: `url(${photo1})` }} aria-hidden></div>
        </div>
      </section>

      <section style={{ padding: '2rem' }} ref={containerRef}>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ flex: 1, padding: '2rem', fontSize: '1.2em' }}>
            <h2 style={{ textShadow: '2px 2px 0 #ddd, 4px 4px 0 #bbb, 6px 6px 15px rgba(0,0,0,0.4)' }}>About John</h2>
            <p style={{ textShadow: '1px 1px 0 rgba(0,0,0,0.2)' }}>I'm a professional guitarist and guitar teacher with a passion for helping people learn music in a clear and enjoyable way. With over 15 years of experience performing, recording, and teaching, I focus on making complex techniques simple and accessible for every student. My lessons are designed to help you understand not only how to play a song, but also the techniques and musical ideas behind it. Whether you're learning your first riffs or improving your timing and technique, the goal is to help you progress with confidence and enjoy the process of playing guitar.</p>
          </div>
        </div>

        <div style={{ marginTop: '2rem', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          {/* Block 1: Text left, Photo right */}
          <div className="panel slide-left bg-1" style={{ padding: '2rem', borderRadius: 8, display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '2rem' }}>
            <div style={{fontSize: '22px', flex: 1 }}>
              <h3 style={{ textShadow: '2px 2px 0 #ddd, 3px 3px 0 #aaa, 5px 5px 12px rgba(0,0,0,0.3)' }}>Experience</h3>
              <p style={{ textShadow: '1px 1px 0 rgba(0,0,0,0.15)' }}>Over 15 years of experience performing live, recording in studios, and teaching guitar to students of different levels. My approach combines real musical practice with clear explanations that help students progress faster.</p>
            </div>
            <div style={{ width: "500px", height: "250px", overflow: "hidden", borderRadius: "8px" }}>
              <img src={photo2} alt="photo" style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: "8px" }} />
            </div>
          </div>
          {/* Block 2: Photo left, Text right */}
          <div className="panel slide-right bg-2" style={{ padding: '2rem', borderRadius: 8, display: 'flex', flexDirection: 'row-reverse', alignItems: 'center', gap: '2rem' }}>
            <div style={{fontSize: '22px', flex: 1 }}>
              <h3 style={{ textShadow: '2px 2px 0 #ddd, 3px 3px 0 #aaa, 5px 5px 12px rgba(0,0,0,0.3)' }}>Method</h3>
              <p style={{ textShadow: '1px 1px 0 rgba(0,0,0,0.15)' }}>Each lesson is structured into simple and repeatable steps. I break down every technique slowly and clearly, providing demonstrations, tabs, and practical exercises so you can easily follow and practice on your own.</p>
            </div>
            <div style={{ width: "400px", height: "250px", overflow: "hidden", borderRadius: "8px" }}>
              <img src={photo3} alt="photo" style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: "8px" }} />
            </div>          
            </div>
          {/* Block 3: Text left, Video right */}
          <div className="panel slide-left bg-3" style={{ padding: '2rem', borderRadius: 8, display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '2rem' }}>
            <div style={{fontSize: '22px', flex: 1 }}>
              <h3 style={{ textShadow: '2px 2px 0 #ddd, 3px 3px 0 #aaa, 5px 5px 12px rgba(0,0,0,0.3)' }}>Benefits</h3>
              <p style={{ textShadow: '1px 1px 0 rgba(0,0,0,0.15)' }}>Learn the songs you love while improving your rhythm, technique, and musical understanding. These lessons are designed to help you play with confidence and enjoy real progress from the very first sessions.</p>
            </div>
            <video controls style={{width: '500px', height: '250px', objectFit: 'cover', borderRadius: '8px', flexShrink: 0 }}><source src={video1} type="video/mp4" /></video>
          </div>
        </div>
      </section>
    </div>
  );
}
