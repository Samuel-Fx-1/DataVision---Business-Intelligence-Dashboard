'use client';

import { useEffect, useRef } from 'react';
import Counter from './Counter';
import type { HeroStat } from '@/lib/types';

interface HeroSectionProps {
  stats: HeroStat[];
}

export default function HeroSection({ stats }: HeroSectionProps) {
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onScroll = () => {
      const el = contentRef.current;
      if (!el) return;

      const scrolled = window.pageYOffset;
      el.style.transform = `translateY(${scrolled * 0.5}px)`;
      el.style.opacity = String(Math.max(0, 1 - scrolled / 600));
    };

    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <section className="hero-section" id="home">
      <div className="geometric-decoration">
        <div className="line-decoration line-1" />
        <div className="line-decoration line-2" />
        <div className="line-decoration line-3" />
        <div className="line-decoration line-4" />
      </div>

      <div className="hero-content" ref={contentRef}>
        <div className="hero-badge">[ REAL-TIME ANALYTICS ]</div>
        <h1 className="hero-title">
          <span className="title-line">
            DATA
            <span className="title-accent">·</span>
            DRIVEN
          </span>
          <span className="title-line title-emphasis">INSIGHTS</span>
        </h1>
        <p className="hero-subtitle">
          <span className="subtitle-bracket">[</span>
          FOR MODERN BUSINESS
          <span className="subtitle-bracket">]</span>
        </p>
        <div className="hero-tagline">
          <span className="tagline-number">01</span>
          <span className="tagline-divider">|</span>
          <span>Transform Numbers into Decisions</span>
        </div>

        <div className="hero-stats">
          {stats.map((stat) => (
            <div className="stat-item" key={stat.label}>
              <div className="stat-wrapper">
                {stat.prefix && <span className="stat-prefix">{stat.prefix}</span>}
                <Counter className="stat-number" target={stat.target} />
                {stat.suffix && <span className="stat-suffix">{stat.suffix}</span>}
              </div>
              <div className="stat-label">{stat.label}</div>
              <div className="stat-bar" />
            </div>
          ))}
        </div>
      </div>

      <div className="scroll-indicator">
        <span>SCROLL DOWN</span>
        <i className="fas fa-chevron-down" />
      </div>
    </section>
  );
}