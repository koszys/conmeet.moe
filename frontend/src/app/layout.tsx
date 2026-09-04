import type { Metadata } from 'next';
import { Geist, Geist_Mono, RocknRoll_One } from 'next/font/google';
import { Providers } from './providers/providers';
import './globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

const rocknRollOne = RocknRoll_One({
  variable: '--font-display',
  subsets: ['latin'],
  weight: '400',
});

export const metadata: Metadata = {
  title: {
    default: 'conmeet.moe',
    template: 'conmeet.moe | %s',
  },
  description: 'Crowdsourced freebie tracker, meetups, and event schedules for convention goers.',
};

export default function RootLayout({ children }: LayoutProps<'/'>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} ${rocknRollOne.variable} h-full antialiased`}
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('conmeet-theme');var d=t==='dark'||(!t&&window.matchMedia('(prefers-color-scheme: dark)').matches);d&&document.documentElement.classList.add('dark')}catch(e){}})();`,
          }}
        />
      </head>
      <body className="flex min-h-full flex-col">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
