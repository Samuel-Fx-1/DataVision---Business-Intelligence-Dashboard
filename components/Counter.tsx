'use client';

import { useEffect, useRef, useState } from 'react';

interface CounterProps {
  target: number;
  /** Text shown before the counter starts ticking. */
  initial?: string;
  className?: string;
  duration?: number;
}

function formatValue(current: number, target: number): string {
  if (target % 1 !== 0) return current.toFixed(1);
  if (target > 1000) return Math.floor(current).toLocaleString();
  return String(Math.floor(current));
}

/**
 * Number that counts up to `target` the first time it scrolls into view.
 * Port of `animateCounter()` + the IntersectionObserver setup from `js/main.js`.
 */
export default function Counter({ target, initial = '0', className, duration = 2000 }: CounterProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [value, setValue] = useState(initial);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    let frame = 0;
    let done = false;

    const run = () => {
      if (done) return;
      const increment = target / (duration / 16);
      let current = 0;

      const step = () => {
        current += increment;
        if (current < target) {
          setValue(formatValue(current, target));
          frame = requestAnimationFrame(step);
        } else {
          setValue(formatValue(target, target));
        }
      };

      step();
    };

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !done) {
            done = true;
            observer.unobserve(entry.target);
            run();
          }
        });
      },
      { threshold: 0.2, rootMargin: '0px 0px -100px 0px' },
    );

    observer.observe(node);

    return () => {
      done = true;
      observer.disconnect();
      cancelAnimationFrame(frame);
    };
  }, [target, duration]);

  return (
    <div ref={ref} className={className} data-target={target}>
      {value}
    </div>
  );
}