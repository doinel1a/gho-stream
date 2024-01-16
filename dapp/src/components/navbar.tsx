import React, { Suspense } from 'react';

import { Skeleton } from './ui/skeleton';
import ThemeToggle from './ui/theme-toggle';

const WalletButton = React.lazy(() => import('./wallet-button'));

export default function Navbar() {
  return (
    <header className='flex h-16 w-full items-center justify-between border-b border-border px-5'>
      <span className='text-lg font-black'>Template</span>

      <div className='flex gap-x-5'>
        <Suspense fallback={<Skeleton className='h-10 w-40' />}>
          <WalletButton className='w-40' />
        </Suspense>

        <Suspense fallback={<Skeleton className='h-10 w-10' />}>
          <ThemeToggle />
        </Suspense>
      </div>
    </header>
  );
}
