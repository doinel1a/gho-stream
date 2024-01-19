import React, { Suspense } from 'react';

import { Skeleton } from './ui/skeleton';
import ThemeToggle from './ui/theme-toggle';

const WalletButton = React.lazy(() => import('./wallet-button'));

export default function Navbar() {
  return (
    <nav className='z-10 h-16 w-full border-b border-border px-5'>
      <div className='mx-auto flex h-full w-full max-w-7xl items-center justify-between'>
        <span className='text-lg font-black'>Template</span>

        <div className='flex gap-x-5'>
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
