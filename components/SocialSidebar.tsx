const SOCIAL_LINKS = [
  { icon: 'fab fa-facebook-f', label: 'Facebook' },
  { icon: 'fab fa-twitter', label: 'Twitter' },
  { icon: 'fab fa-instagram', label: 'Instagram' },
  { icon: 'fab fa-linkedin-in', label: 'LinkedIn' },
];

export default function SocialSidebar() {
  return (
    <div className="social-sidebar">
      {SOCIAL_LINKS.map((link) => (
        <a key={link.label} href="#" className="social-link" aria-label={link.label}>
          <i className={link.icon} />
        </a>
      ))}
    </div>
  );
}