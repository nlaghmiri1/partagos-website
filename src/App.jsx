import React from 'react';
import { Boxes } from 'lucide-react';

export default function App() {
  return (
    <div style={{ fontFamily: 'Arial', padding: 40 }}>
      <h1>Partagos</h1>
      <p>AI-gedreven SaaS platform voor auto-onderdelen.</p>
      <div style={{ marginTop: 20, display: 'flex', gap: 10, alignItems: 'center' }}>
        <Boxes /> Live demo placeholder
      </div>
      <p style={{ marginTop: 30, opacity: 0.7 }}>
        Deze website is live terwijl we verder bouwen.
      </p>
    </div>
  );
}
