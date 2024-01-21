import React, { Suspense } from 'react';

import { Link } from 'react-router-dom';

import ghoStreamLogo from '@/assets/images/gho-stream-logo.png';

import Img from './img';
import { Skeleton } from './ui/skeleton';
import ThemeToggle from './ui/theme-toggle';

const WalletButton = React.lazy(() => import('./wallet-button'));

export default function Navbar() {
  return (
    <nav className='z-10 h-16 w-full border-b border-border px-5'>
      <div className='mx-auto flex h-full w-full max-w-7xl justify-between'>
        <div className='relative flex items-center gap-x-2.5'>
          <Link to='/' className='flex h-full items-center gap-x-2.5'>
            <Img
              src={ghoStreamLogo}
              alt="GhoStreams'logo"
              width={64}
              height={64}
              className='absolute left-0 top-1.5 h-16 w-16 rounded-full'
            />

            <span className='ml-[4.5rem] text-xl font-bold'>GhoStream</span>
          </Link>
        </div>

        <div className='flex h-full items-center gap-x-5'>
          <Suspense fallback={<Skeleton className='h-10 w-40' />}>
            <WalletButton className='w-40' />
          </Suspense>

          <Suspense fallback={<Skeleton className='h-10 w-10' />}>
            <ThemeToggle />
          </Suspense>
        </div>
      </div>
    </nav>
  );
}
