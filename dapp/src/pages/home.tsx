import React, { Suspense, useEffect, useState } from 'react';

import type { Eip1193Provider } from 'ethers';

import { BrowserProvider } from 'ethers';
import { useAccount } from 'wagmi';

import { Skeleton } from '@/components/ui/skeleton';

const SupplyAssetsSection = React.lazy(() => import('@/components/sections/supply-assets'));
const SuppliedAssetsSection = React.lazy(() => import('@/components/sections/supplied-assets'));

export default function HomePage() {
  const { isConnected } = useAccount();

  const [ethersProvider, setEthersProvider] = useState<BrowserProvider | undefined>(undefined);

  useEffect(() => {
    if (window.ethereum) {
      const provider = new BrowserProvider(window.ethereum as Eip1193Provider);
      setEthersProvider(provider);
    }
  }, []);

  return (
    <>
      {ethersProvider ? (
        isConnected ? (
          <div className='flex w-full items-start gap-5'>
            <Suspense fallback={<Skeleton className='h-52 w-1/2' />}>
              <SupplyAssetsSection
                ethersProvider={ethersProvider}
                className='w-1/2'
                defaultExpanded
              />
            </Suspense>

            <Suspense fallback={<Skeleton className='h-52 w-1/2' />}>
              <SuppliedAssetsSection
                ethersProvider={ethersProvider}
                className='w-1/2'
                defaultExpanded
              />
            </Suspense>
          </div>
        ) : (
          <div>
            <h1 className='text-2xl'>Connect your wallet!</h1>
          </div>
        )
      ) : (
        <div>
          <h1 className='text-2xl'>install a wallet!</h1>
        </div>
      )}
    </>
  );
}
