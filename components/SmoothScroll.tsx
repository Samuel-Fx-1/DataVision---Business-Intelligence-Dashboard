'use client';

import { useEffect } from 'react';

/**
 * Global smooth-scroll handler for every `a[href^="#"]` link.
 * Port of the anchor listener from `js/main.js`.
 *
 * The original called `document.querySelector('#')` for placeholder links
 * (footer / social), which throws on an invalid selector — so those are
 * treated as no-ops here.
 */
export default function SmoothScroll() {
  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      const anchor = (event.target as HTMLElement | null)?.closest?.('a[href^="#"]') as
        | HTMLAnchorElement
        | null;
      if (!anchor) return;

      const href = anchor.getAttribute('href');
      if (!href || href === '#') return;

      event.preventDefault();

      let target: Element | null = null;
      try {
        target = document.querySelector(href);
      } catch {
        return;
      }

      target?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    };

    document.addEventListener('click', onClick);
    return () => document.removeEventListener('click', onClick);
  }, []);

  return null;
}