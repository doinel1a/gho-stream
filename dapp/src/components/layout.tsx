import React from 'react';

import Footer from './footer';
import Navbar from './navbar';

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Navbar />

      <main className='flex h-full w-full max-w-7xl flex-col items-center justify-center p-10'>
        {children}
      </main>

      <Footer />
    </>
  );
}
