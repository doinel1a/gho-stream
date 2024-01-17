import React, { Suspense, useEffect, useState } from 'react';

import type { Eip1193Provider } from 'ethers';

import { BrowserProvider } from 'ethers';
import { useAccount } from 'wagmi';

import { Skeleton } from '@/components/ui/skeleton';

const SupplyAssetsFunction = React.lazy(() => import('../components/sections/supply-assets'));

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
          <>
            <Suspense fallback={<Skeleton className='h-52 w-1/2' />}>
              <SupplyAssetsFunction
                ethersProvider={ethersProvider}
                className='w-1/2'
                defaultExpanded
              />
            </Suspense>
          </>
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
