import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Video Editor',
  description: 'Professional browser-based video editor',
};

export const viewport: Viewport = {
  themeColor: '#18191c',
  colorScheme: 'dark',
};

export default function RootLayout({ children }: LayoutProps<'/'>) {
  return (
    <html lang='en' className='dark'>
      <body>{children}</body>
    </html>
  );
}
