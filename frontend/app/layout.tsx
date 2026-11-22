import type { Metadata } from 'next';
import Script from 'next/script';
import './globals.css';

export const metadata: Metadata = {
  title: 'SunPower Solutions | Rooftop Solar Operations & Management',
  description:
    'End-to-end rooftop solar installation, quotation BOM engine, site survey, dispatch tracking, and 25-year warranty management platform.',
  openGraph: {
    title: 'SunPower Solutions | Rooftop Solar Operations & Management',
    description:
      'End-to-end rooftop solar installation, quotation BOM engine, site survey, dispatch tracking, and 25-year warranty management platform.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'SunPower Solutions | Rooftop Solar Operations & Management',
    description:
      'End-to-end rooftop solar installation, quotation BOM engine, site survey, dispatch tracking, and 25-year warranty management platform.',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="scroll-smooth">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=JetBrains+Mono:wght@400;500;600;700&family=Work+Sans:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased bg-[#faf9f6] text-[#1a1c1a]" suppressHydrationWarning>
        {children}
        <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />
      </body>
    </html>
  );
}
