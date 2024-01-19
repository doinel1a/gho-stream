import React, { Suspense, useEffect, useMemo, useReducer, useState } from 'react';

import type { IToken } from '@/interfaces/token';
import type { Eip1193Provider } from 'ethers';

import { BrowserProvider, ethers, formatUnits } from 'ethers';
import { useAccount } from 'wagmi';

import { Skeleton } from '@/components/ui/skeleton';
import tokensContractDetails from '@/config/tokens-contract-details';
import EReducerState from '@/constants/reducer-state';
import { roundDecimal } from '@/lib/utils';
import {
  suppliedTransactionInitialState,
  suppliedTransactionReducer
} from '@/reducers/supplied-transaction';
import { walletAssetsInitialState, walletAssetsReducer } from '@/reducers/wallet-assets';

const SupplyAssetsSection = React.lazy(() => import('@/components/sections/supply-assets'));
const SuppliedAssetsSection = React.lazy(() => import('@/components/sections/supplied-assets'));
const AssetsToStreamSection = React.lazy(() => import('@/components/sections/assets-to-stream'));

export default function HomePage() {
  const { isConnected, address } = useAccount();

  const [ethersProvider, setEthersProvider] = useState<BrowserProvider | undefined>(undefined);

  const [walletAssetsState, dispatchWalletAssets] = useReducer(
    walletAssetsReducer,
    walletAssetsInitialState
  );

  const [suppliedTransactionState, dispatchSuppliedTransaction] = useReducer(
    suppliedTransactionReducer,
    suppliedTransactionInitialState
  );

  useEffect(() => {
    if (window.ethereum) {
      const provider = new BrowserProvider(window.ethereum as Eip1193Provider);
      setEthersProvider(provider);
    }
  }, []);

  const memoizedGetWalletAssets = useMemo(() => {
    if (!ethersProvider) {
      return undefined;
    }

    return async function getWalletAssets() {
      dispatchWalletAssets({
        state: EReducerState.start,
        payload: undefined
      });

      const walletAssets: IToken[] = [];

      for (const contractDetails of tokensContractDetails) {
        const tokenContract = new ethers.Contract(
          contractDetails.address,
          contractDetails.abi,
          ethersProvider
        );
        const weiTokenBalance = (await tokenContract.balanceOf(address)) as bigint;
        console.log(
          `weiTokenBalance | ${contractDetails.name}`,
          roundDecimal(Number(formatUnits(weiTokenBalance, contractDetails.decimals)), 2)
        );

        if (weiTokenBalance !== 0n) {
          walletAssets.push({
            name: contractDetails.name,
            icon: contractDetails.icon,
            weiBalance: weiTokenBalance,
            normalizedBalance: roundDecimal(
              Number(formatUnits(weiTokenBalance, contractDetails.decimals)),
              2
            )
          });
        }
      }

      console.log('walletAssets', walletAssets);

      dispatchWalletAssets({
        state: EReducerState.success,
        payload: walletAssets
      });
    };
  }, [ethersProvider, address]);

  useEffect(() => {
    if (typeof memoizedGetWalletAssets === 'function') {
      memoizedGetWalletAssets().catch((error: unknown) => {
        dispatchWalletAssets({
          state: EReducerState.error,
          payload: undefined
        });

        console.error('Error fetching wallet tokens balance', error);
      });
    }
  }, [memoizedGetWalletAssets]);

  const memorizedGetSuppliedAssets = useMemo(() => {
    if (!ethersProvider) {
      return undefined;
    }

    return async function getSuppliedAssets() {
      dispatchSuppliedTransaction({
        state: EReducerState.start,
        payload: undefined
      });

      const suppliedAssets: IToken[] = [];

      for (const contractDetails of tokensContractDetails) {
        const tokenContract = new ethers.Contract(
          contractDetails.aAddress,
          contractDetails.abi,
          ethersProvider
        );

        const weiTokenBalance = (await tokenContract.balanceOf(address)) as bigint;
        console.log(
          `weiTokenBalance | ${contractDetails.name}`,
          roundDecimal(Number(formatUnits(weiTokenBalance, contractDetails.decimals)), 2)
        );

        if (weiTokenBalance !== 0n) {
          suppliedAssets.push({
            name: contractDetails.name,
            icon: contractDetails.icon,
            weiBalance: weiTokenBalance,
            normalizedBalance: roundDecimal(
              Number(formatUnits(weiTokenBalance, contractDetails.decimals)),
              2
            )
          });
        }
      }

      console.log('suppliedAssets', suppliedAssets);

      dispatchSuppliedTransaction({
        state: EReducerState.success,
        payload: suppliedAssets
      });
    };
  }, [ethersProvider, address]);

  useEffect(() => {
    if (typeof memorizedGetSuppliedAssets === 'function') {
      memorizedGetSuppliedAssets().catch((error: unknown) => {
        dispatchSuppliedTransaction({
          state: EReducerState.error,
          payload: undefined
        });

        console.error('Error fetching supplied tokens', error);
      });
    }
  }, [memorizedGetSuppliedAssets]);

  async function onCloseButtonClick() {
    if (typeof memoizedGetWalletAssets === 'function') {
      memoizedGetWalletAssets().catch((error: unknown) => {
        dispatchWalletAssets({
          state: EReducerState.error,
          payload: undefined
        });

        console.error('Error fetching wallet tokens balance', error);
      });
    }

    if (typeof memorizedGetSuppliedAssets === 'function') {
      memorizedGetSuppliedAssets().catch((error: unknown) => {
        dispatchSuppliedTransaction({
          state: EReducerState.error,
          payload: undefined
        });

        console.error('Error fetching supplied tokens', error);
      });
    }
  }

  return (
    <>
      {ethersProvider ? (
        isConnected ? (
          <div className='flex w-full items-start gap-5'>
            <div className='flex w-1/2 flex-col gap-5'>
              <Suspense fallback={<Skeleton className='h-52 w-full' />}>
                <SuppliedAssetsSection
                  ethersProvider={ethersProvider}
                  suppliedTransactionState={suppliedTransactionState}
                  className='w-full'
                  defaultExpanded
                  onCloseClick={onCloseButtonClick}
                />
              </Suspense>

              <Suspense fallback={<Skeleton className='h-52 w-full' />}>
                <SupplyAssetsSection
                  ethersProvider={ethersProvider}
                  walletAssetsState={walletAssetsState}
                  className='w-full'
                  defaultExpanded
                  onCloseClick={onCloseButtonClick}
                />
              </Suspense>
            </div>

            <div className='flex w-1/2 flex-col gap-5'>
              <Suspense fallback={<Skeleton className='h-52 w-full' />}>
                <AssetsToStreamSection
                  ethersProvider={ethersProvider}
                  className='w-full'
                  defaultExpanded
                />
              </Suspense>
            </div>
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
