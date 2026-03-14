import React from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import './App.css';
import Home from './pages/Home';
import Lessons from './pages/Lessons';
import CheckoutSuccess from './pages/CheckoutSuccess';
import LessonPage from './pages/LessonPage';

function App() {
  return (
    <BrowserRouter>
      <div className="App">
        <header style={{ padding: '1rem 2rem', borderBottom: '1px solid #eee' }}>
          <nav style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <div className="nav-container">
              <Link className="nav-btn" to="/">Home</Link>
              <Link className="nav-btn" to="/lessons">Lessons</Link>
            </div>
          </nav>
        </header>
        <main>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/lessons" element={<Lessons />} />
            <Route path="/checkout-success" element={<CheckoutSuccess />} />
            <Route path="/lesson/:token" element={<LessonPage />} />
          </Routes>
        </main>
        <footer className="footer">© {new Date().getFullYear()} Guitar Teacher — Contact: teacher@example.com</footer>
      </div>
    </BrowserRouter>
  );
}

export default App;
