import type { Metadata } from 'next';
// The original stylesheet is imported as-is: css/style.css is byte-for-byte unchanged.
import '../css/style.css';

export const metadata: Metadata = {
  title: 'DataVision | Business Intelligence Platform',
  description: 'Data-Driven Insights for Modern Business',
};

const FONT_AWESOME =
  'https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css';

const GOOGLE_FONTS =
  'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Montserrat:wght@300;400;600;800;900&family=Poppins:wght@300;400;600;800;900&family=Roboto+Mono:wght@400;700&display=swap';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link rel="stylesheet" href={GOOGLE_FONTS} />
        <link rel="stylesheet" href={FONT_AWESOME} />
      </head>
      <body>{children}</body>
    </html>
  );
}