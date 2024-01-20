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
  maxAmountToBorrowTransactionInitialState,
  maxAmountToBorrowTransactionReducer
} from '@/reducers/max-amount-to-borrow-transaction';
import {
  netWorthTransactionInitialState,
  netWorthTransactionReducer
} from '@/reducers/net-worth-transaction';
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

  const [netWorthTransactionState, dispatchNetWorthTransaction] = useReducer(
    netWorthTransactionReducer,
    netWorthTransactionInitialState
  );

  const [maxAmountToBorrowTransactionState, dispatchMaxAmountToBorrowTransaction] = useReducer(
    maxAmountToBorrowTransactionReducer,
    maxAmountToBorrowTransactionInitialState
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

  const memorizedGetNetWorth = useMemo(() => {
    if (!ethersProvider) {
      return undefined;
    }

    return async function getNetWorth() {
      dispatchNetWorthTransaction({
        state: EReducerState.start,
        payload: undefined
      });

      const aaveContract = new ethers.Contract(
        aaveContractDetails.address,
        aaveContractDetails.artifacts.abi,
        ethersProvider
      );

      const netWorthResponse = (await aaveContract.getNetWorth(address)) as bigint;

      if (netWorthResponse) {
        dispatchNetWorthTransaction({
          state: EReducerState.success,
          payload: roundDecimal(Number(formatUnits(netWorthResponse, 18)), 2)
        });
      }

      console.log('netWorthResponse', formatUnits(netWorthResponse, 18));
    };
  }, [ethersProvider, address]);

  useEffect(() => {
    if (typeof memorizedGetNetWorth === 'function') {
      memorizedGetNetWorth().catch((error: unknown) => {
        dispatchNetWorthTransaction({
          state: EReducerState.error,
          payload: undefined
        });

        // eslint-disable-next-line sonarjs/no-duplicate-string
        console.error('Error fetching net worth', error);
      });
    }
  }, [memorizedGetNetWorth]);

  const memorizedGetMaxAmountToBorrow = useMemo(() => {
    if (!ethersProvider) {
      return undefined;
    }

    return async function getMaxAmountToBorrow() {
      dispatchMaxAmountToBorrowTransaction({
        state: EReducerState.start,
        payload: undefined
      });

      const aaveContract = new ethers.Contract(
        aaveContractDetails.address,
        aaveContractDetails.artifacts.abi,
        ethersProvider
      );

      const maxAmountToBorrowResponse = (await aaveContract.getMaxBorrowAmount(address)) as bigint;

      if (maxAmountToBorrowResponse) {
        dispatchMaxAmountToBorrowTransaction({
          state: EReducerState.success,
          payload: roundDecimal(Number(formatUnits(maxAmountToBorrowResponse, 18)), 2)
        });
      }

      console.log('maxAmountToBorrowResponse', formatUnits(maxAmountToBorrowResponse, 18));
    };
  }, [ethersProvider, address]);

  useEffect(() => {
    if (typeof memorizedGetMaxAmountToBorrow === 'function') {
      memorizedGetMaxAmountToBorrow().catch((error: unknown) => {
        dispatchMaxAmountToBorrowTransaction({
          state: EReducerState.error,
          payload: undefined
        });

        // eslint-disable-next-line sonarjs/no-duplicate-string
        console.error('Error fetching max amount to borrow', error);
      });
    }
  }, [memorizedGetMaxAmountToBorrow]);

  async function onSupplyOrWithdrawDialogClose() {
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

    if (typeof memorizedGetNetWorth === 'function') {
      memorizedGetNetWorth().catch((error: unknown) => {
        dispatchSuppliedTransaction({
          state: EReducerState.error,
          payload: undefined
        });

        console.error('Error fetching net worth', error);
      });
    }

    if (typeof memorizedGetMaxAmountToBorrow === 'function') {
      memorizedGetMaxAmountToBorrow().catch((error: unknown) => {
        dispatchSuppliedTransaction({
          state: EReducerState.error,
          payload: undefined
        });

        console.error('Error fetching max amount to borrow', error);
      });
    }
  }

  async function onStreamDialogClose() {
    if (typeof memorizedGetStreamedAssets === 'function') {
      memorizedGetStreamedAssets().catch((error: unknown) => {
        dispatchSuppliedTransaction({
          state: EReducerState.error,
          payload: undefined
        });

        console.error('Error fetching streamed assets', error);
      });
    }

    if (typeof memorizedGetMaxAmountToBorrow === 'function') {
      memorizedGetMaxAmountToBorrow().catch((error: unknown) => {
        dispatchSuppliedTransaction({
          state: EReducerState.error,
          payload: undefined
        });

        console.error('Error fetching max amount to borrow', error);
      });
    }

    if (typeof memorizedGetNetWorth === 'function') {
      memorizedGetNetWorth().catch((error: unknown) => {
        dispatchSuppliedTransaction({
          state: EReducerState.error,
          payload: undefined
        });

        console.error('Error fetching net worth', error);
      });
    }
  }

  return (
    <>
      <Header netWorthTransactionState={netWorthTransactionState} />

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
                  onSupplyOrWithdrawDialogClose={onSupplyOrWithdrawDialogClose}
                />
              </Suspense>

              <Suspense fallback={<Skeleton className='h-52 w-full' />}>
                <SupplyAssetsSection
                  ethersProvider={ethersProvider}
                  walletAssetsState={walletAssetsState}
                  className='w-full'
                  defaultExpanded
                  onSupplyDialogClose={onSupplyOrWithdrawDialogClose}
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
                  maxAmountToBorrowTransactionState={maxAmountToBorrowTransactionState}
                  className='w-full'
                  defaultExpanded
                  onStreamDialogClose={onStreamDialogClose}
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
