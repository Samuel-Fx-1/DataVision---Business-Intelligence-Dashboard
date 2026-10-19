const FOOTER_LINKS = ['Privacy Policy', 'Terms of Service', 'Contact'];

export default function SiteFooter() {
  return (
    <footer className="main-footer">
      <div className="container">
        <div className="footer-content">
          <div className="footer-logo">DATAVISION</div>
          <div className="footer-text">Data-Driven Insights for Modern Business</div>
          <div className="footer-links">
            {FOOTER_LINKS.map((label) => (
              <a key={label} href="#">
                {label}
              </a>
            ))}
          </div>
          <div className="footer-copyright">© 2024 DataVision. All rights reserved.</div>
        </div>
      </div>
    </footer>
  );
}