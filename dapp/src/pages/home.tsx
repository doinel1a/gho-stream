import React, { Suspense, useEffect, useMemo, useReducer, useState } from 'react';

import type IStreamedAsset from '@/interfaces/streamed-asset';
import type { IToken } from '@/interfaces/token';
import type { Eip1193Provider, TransactionResponse } from 'ethers';

import { format } from 'date-fns';
import { BrowserProvider, ethers, formatUnits } from 'ethers';
import { useAccount } from 'wagmi';

import Header from '@/components/header';
import { Skeleton } from '@/components/ui/skeleton';
import aaveContractDetails from '@/config/aave-contract-details';
import sablierContractDetails from '@/config/sablier-contract-details';
import tokensContractDetails from '@/config/tokens-contract-details';
import EReducerState from '@/constants/reducer-state';
import { roundDecimal } from '@/lib/utils';
import {
  streamedTransactionInitialState,
  streamedTransactionReducer
} from '@/reducers/streamed-transaction';
import {
  suppliedTransactionInitialState,
  suppliedTransactionReducer
} from '@/reducers/supplied-transaction';
import { walletAssetsInitialState, walletAssetsReducer } from '@/reducers/wallet-assets';

const SupplyAssetsSection = React.lazy(() => import('@/components/sections/supply-assets'));
const SuppliedAssetsSection = React.lazy(() => import('@/components/sections/supplied-assets'));
const AssetsToStreamSection = React.lazy(() => import('@/components/sections/assets-to-stream'));
const StreamedAssetsSection = React.lazy(() => import('@/components/sections/streamed-assets'));

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

  const [streamedTransactionState, dispatchStreamedTransaction] = useReducer(
    streamedTransactionReducer,
    streamedTransactionInitialState
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

  // eslint-disable-next-line sonarjs/cognitive-complexity
  const memorizedGetStreamedAssets = useMemo(() => {
    if (!ethersProvider) {
      return undefined;
    }

    return async function getStreamedAssets() {
      dispatchStreamedTransaction({
        state: EReducerState.start,
        payload: undefined
      });

      const streamedAssets: IStreamedAsset[] = [];

      const aaveContract = new ethers.Contract(
        aaveContractDetails.address,
        aaveContractDetails.artifacts.abi,
        ethersProvider
      );

      const streamIdsResponse: TransactionResponse = (await aaveContract.getBorrowerStreamIds(
        address
      )) as TransactionResponse;
      const streamIds = streamIdsResponse.valueOf() as bigint[];

      for (const streamId of streamIds) {
        const sablierContract = new ethers.Contract(
          sablierContractDetails.address,
          sablierContractDetails.artifacts.abi,
          ethersProvider
        );

        const depositAmount = (await sablierContract.getDepositedAmount(streamId)) as bigint;
        const startTime = (await sablierContract.getStartTime(streamId)) as bigint;
        const endTime = (await sablierContract.getEndTime(streamId)) as bigint;
        const recipient = (await sablierContract.getRecipient(streamId)) as string;
        const status = (await sablierContract.statusOf(streamId)) as bigint;
        const streamedAmount = (await sablierContract.streamedAmountOf(streamId)) as bigint;
        const withdrawnAmount = (await sablierContract.getWithdrawnAmount(streamId)) as bigint;
        const tokenUri = (await sablierContract.tokenURI(streamId)) as string;

        const mappedStatus =
          status === 0n
            ? 'Pending'
            : status === 1n
              ? 'Streaming'
              : status === 2n
                ? 'Settled'
                : status === 3n
                  ? 'Cancelled'
                  : 'Depleted';

        streamedAssets.push({
          id: streamId,
          // eslint-disable-next-line quotes
          startTime: format(new Date(Number(startTime) * 1000), "MMM d ''yy @ h:mm a"),
          // eslint-disable-next-line quotes
          endTime: format(new Date(Number(endTime) * 1000), "MMM d ''yy @ h:mm a"),
          recipient,
          status: mappedStatus,
          depositAmount: roundDecimal(Number(formatUnits(depositAmount, 18)), 2),
          streamedAmount: roundDecimal(Number(formatUnits(streamedAmount, 18)), 2),
          withdrawnAmount: roundDecimal(Number(formatUnits(withdrawnAmount, 18)), 2),
          tokenUri
        });
      }

      console.log('streamedAssets', streamedAssets);

      dispatchStreamedTransaction({
        state: EReducerState.success,
        payload: streamedAssets
      });
    };
  }, [ethersProvider, address]);

  useEffect(() => {
    if (typeof memorizedGetStreamedAssets === 'function') {
      memorizedGetStreamedAssets().catch((error: unknown) => {
        dispatchSuppliedTransaction({
          state: EReducerState.error,
          payload: undefined
        });

        console.error('Error fetching streamed assets', error);
      });
    }
  }, [memorizedGetStreamedAssets]);

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
      <Header />

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
                <StreamedAssetsSection
                  streamedTransactionState={streamedTransactionState}
                  className='w-full'
                  defaultExpanded
                />
              </Suspense>

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
