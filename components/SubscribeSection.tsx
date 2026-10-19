'use client';

import { useState, type CSSProperties } from 'react';

const FEATURES = [
  { icon: 'fas fa-chart-pie', label: 'Weekly Reports' },
  { icon: 'fas fa-lock', label: 'Secure & Private' },
  { icon: 'fas fa-envelope', label: 'No Spam' },
];

type Status = { kind: 'success' | 'error'; message: string } | null;

/**
 * style.css has no rules for a status line, so it is styled inline to match the
 * existing design tokens rather than adding new CSS.
 */
const STATUS_STYLE: CSSProperties = {
  marginTop: '20px',
  marginBottom: '0',
  fontFamily: "'Roboto Mono', monospace",
  fontSize: '12px',
  letterSpacing: '1px',
  minHeight: '16px',
};

export default function SubscribeSection() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<Status>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting) return;

    setSubmitting(true);
    setStatus(null);

    try {
      const res = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();

      if (!res.ok) {
        setStatus({ kind: 'error', message: data.message ?? 'Something went wrong. Please try again.' });
        return;
      }

      setEmail('');
      setStatus({ kind: 'success', message: data.message ?? 'Thank you for subscribing!' });

      const button = event.currentTarget.querySelector<HTMLButtonElement>('.subscribe-button');
      if (button) {
        const original = button.textContent;
        button.textContent = 'SUBSCRIBED!';
        button.style.background = 'linear-gradient(135deg, #00FFA3, #00D9FF)';
        setTimeout(() => {
          button.textContent = original;
          button.style.background = 'linear-gradient(135deg, var(--tech-blue), var(--data-green))';
        }, 3000);
      }
    } catch {
      setStatus({ kind: 'error', message: 'Network error. Please try again.' });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="subscribe-section" id="subscribe">
      <div className="container">
        <div className="subscribe-content">
          <div className="geometric-decoration-small">
            <div className="line-decoration line-1" />
            <div className="line-decoration line-2" />
          </div>

          <h2 className="subscribe-title">GET INSIGHTS DELIVERED</h2>
          <p className="subscribe-subtitle">
            Subscribe to receive weekly business intelligence reports
          </p>

          <form className="subscribe-form" onSubmit={handleSubmit} noValidate={false}>
            <input
              type="email"
              className="subscribe-input"
              placeholder="Enter your email address"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />
            <button type="submit" className="subscribe-button">
              SUBSCRIBE NOW
            </button>
          </form>

          {status && (
            <p
              role="status"
              aria-live="polite"
              style={{ ...STATUS_STYLE, color: status.kind === 'success' ? '#00FFA3' : '#FF6B35' }}
            >
              {status.message}
            </p>
          )}

          <div className="subscribe-features">
            {FEATURES.map((feature) => (
              <div className="feature-item" key={feature.label}>
                <i className={feature.icon} />
                <span>{feature.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}