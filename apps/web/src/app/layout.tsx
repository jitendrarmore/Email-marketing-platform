import React from 'react';
import './globals.css';
import { AuthProvider } from '@/lib/auth-context';

export const metadata = {
  title: 'OmniSend PRO — Mass Email Marketing & Delivery Platform',
  description: 'Multi-tenant high-throughput email marketing platform with pluggable SES, Azure, SMTP providers & RBAC.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className="bg-background text-slate-100 antialiased font-sans">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
