import React from "react";
import Link from "next/link";

export default function HomePage() {
  return (
    <div className="container">
      <main className="card">
        <div className="ai-logo">
          {/* SVG Icono de Inteligencia Artificial (Cerebro/Red neuronal) */}
          <svg viewBox="0 0 24 24">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/>
          </svg>
        </div>
        
        <h1>Conexión Terminal</h1>
        <p className="subtitle">
          El entorno web para interactuar de forma premium con tus modelos de lenguaje de inteligencia artificial está listo.
        </p>

        <Link href="/chat" className="btn-primary">
          <span>Iniciar Nueva Conversación</span>
          <svg style={{ width: "18px", height: "18px", fill: "currentColor" }} viewBox="0 0 24 24">
            <path d="M5 13h11.86l-5.43 5.43 1.42 1.42L21.14 12l-8.29-8.29-1.42 1.42L16.86 11H5v2z"/>
          </svg>
        </Link>
      </main>
    </div>
  );
}
