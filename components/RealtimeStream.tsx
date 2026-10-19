'use client';

import { useEffect, useState } from 'react';
import type { StreamEvent } from '@/lib/types';

interface RealtimeStreamProps {
  initialEvents: StreamEvent[];
}

function formatAge(seconds: number): string {
  return seconds < 60 ? `${seconds}s ago` : `${Math.floor(seconds / 60)}m ago`;
}

export default function RealtimeStream({ initialEvents }: RealtimeStreamProps) {
  const [events, setEvents] = useState(initialEvents);

  useEffect(() => {
    const timer = setInterval(() => {
      setEvents((prev) => prev.map((event) => ({ ...event, seconds: event.seconds + 1 })));
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <section className="realtime-section">
      <div className="container">
        <div className="section-header">
          <h2 className="section-title">LIVE DATA STREAM</h2>
          <p className="section-subtitle">Real-time activity monitoring</p>
          <span className="live-pulse">
            <i className="fas fa-circle" /> LIVE
          </span>
        </div>

        <div className="data-stream">
          {events.map((event, index) => (
            <div className="stream-item" key={event.id} data-delay={index}>
              <div className="stream-icon">
                <i className={event.icon} />
              </div>
              <div className="stream-content">
                <div className="stream-title">{event.title}</div>
                <div className="stream-detail">{event.detail}</div>
              </div>
              <div className="stream-time">{formatAge(event.seconds)}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}