import React from 'react';

import Footer from './footer';
import Navbar from './navbar';

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Navbar />

      <main className='flex h-full w-full flex-col justify-start overflow-y-auto'>
        <div className='mx-auto w-full max-w-7xl p-10'>{children}</div>
      </main>

      <Footer />
    </>
  );
}
