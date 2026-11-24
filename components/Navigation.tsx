'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState, type CSSProperties } from 'react';

/**
 * `.menu-toggle` has no rules in style.css, so the original styled it entirely
 * from JS. The same inline styles are kept here rather than adding CSS.
 */
const TOGGLE_STYLE: CSSProperties = {
  background: 'none',
  border: '1px solid rgba(255, 255, 255, 0.3)',
  color: 'white',
  padding: '10px 15px',
  borderRadius: '5px',
  cursor: 'pointer',
  fontSize: '18px',
};

const OPEN_MENU_STYLE: CSSProperties = {
  position: 'absolute',
  top: '100%',
  right: 0,
  background: 'rgba(44, 64, 73, 0.95)',
  flexDirection: 'column',
  padding: '20px',
  borderRadius: '8px',
  marginTop: '10px',
};

const MOBILE_BREAKPOINT = 640;

export default function Navigation() {
  const [activeId, setActiveId] = useState('home');
  const [isMobile, setIsMobile] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const checkWidth = () => {
      const mobile = window.innerWidth <= MOBILE_BREAKPOINT;
      setIsMobile(mobile);
      if (!mobile) setMenuOpen(false);
    };

    checkWidth();
    window.addEventListener('resize', checkWidth);
    return () => window.removeEventListener('resize', checkWidth);
  }, []);

  useEffect(() => {
    const onScroll = () => {
      const sections = document.querySelectorAll<HTMLElement>('section[id]');
      let current = '';

      sections.forEach((section) => {
        if (window.pageYOffset >= section.offsetTop - 200) {
          current = section.id;
        }
      });

      setActiveId(current);
    };

    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const closeMenu = () => setMenuOpen(false);

  // SUBSCRIBE scrolls to the section on the landing page and links to it from
  // the dashboard (plain anchor, so the browser lands on #subscribe).
  const subscribeHref = pathname === '/' ? '#subscribe' : '/#subscribe';

  return (
    <nav className="main-nav">
      <Link href="/" className="logo" onClick={closeMenu}>
        DATAVISION
      </Link>
      <div className="nav-links" style={isMobile && menuOpen ? OPEN_MENU_STYLE : undefined}>
        <Link
          href="/"
          className={`nav-link${pathname === '/' && activeId !== 'subscribe' ? ' active' : ''}`}
          onClick={closeMenu}
        >
          HOME
        </Link>
        <Link
          href="/dashboard"
          className={`nav-link${pathname === '/dashboard' ? ' active' : ''}`}
          onClick={closeMenu}
        >
          DASHBOARD
        </Link>
        <a
          href={subscribeHref}
          className={`nav-link${pathname === '/' && activeId === 'subscribe' ? ' active' : ''}`}
          onClick={closeMenu}
        >
          SUBSCRIBE
        </a>
      </div>
      {isMobile && (
        <button
          type="button"
          className="menu-toggle"
          style={TOGGLE_STYLE}
          aria-label="Toggle navigation"
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((open) => !open)}
        >
          <i className="fas fa-bars" />
        </button>
      )}
    </nav>
  );
}
