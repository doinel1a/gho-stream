import React, { Suspense, useEffect, useMemo, useReducer } from 'react';

import type { IToken } from '@/interfaces/token';
import type { BrowserProvider, TransactionResponse } from 'ethers';
import type { HTMLAttributes } from 'react';

import { ethers, formatUnits, parseUnits } from 'ethers';
import { useAccount } from 'wagmi';

import ExternalAnchor from '@/components/external-anchor';
import InfoBanner from '@/components/info-banner';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import aaveContractDetails from '@/config/aave-contract-details';
import tokensContractDetails from '@/config/tokens-contract-details';
import EReducerState from '@/constants/reducer-state';
import { cn, roundDecimal } from '@/lib/utils';
import {
  approveTransactionInitialState,
  approveTransactionReducer
} from '@/reducers/approve-transaction';
import {
  supplyTransactionInitialState,
  supplyTransactionReducer
} from '@/reducers/supply-transaction';
import { walletAssetsInitialState, walletAssetsReducer } from '@/reducers/wallet-assets';

import ExpandableSecion from '../expandable-section';
import Img from '../img';
import { Skeleton } from '../ui/skeleton';

const SupplyAssetsDialog = React.lazy(() => import('./widgets/supply-assets-dialog'));

const tableHeaders = ['Assets', 'Wallet balance', ''];

interface ISupplyAssetsSection extends HTMLAttributes<HTMLDivElement> {
  ethersProvider: BrowserProvider;
  defaultExpanded?: boolean;
}

export default function SupplyAssetsSection({
  ethersProvider,
  className,
  defaultExpanded,
  ...properties
}: ISupplyAssetsSection) {
  const { address } = useAccount();

  const [walletAssetsState, dispatchWalletAssets] = useReducer(
    walletAssetsReducer,
    walletAssetsInitialState
  );

  const [approveTransactionState, dispatchApproveTransaction] = useReducer(
    approveTransactionReducer,
    approveTransactionInitialState
  );

  const [supplyTransactionState, dispatchSupplyTransaction] = useReducer(
    supplyTransactionReducer,
    supplyTransactionInitialState
  );

  const memoizedGetWalletAssets = useMemo(() => {
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
        console.log('weiTokenBalance', weiTokenBalance);

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
    memoizedGetWalletAssets().catch((error: unknown) => {
      dispatchWalletAssets({
        state: EReducerState.error,
        payload: undefined
      });

      console.error('Error fetching token balance', error);
    });
  }, [memoizedGetWalletAssets]);

  async function onApproveClick(tokenName: string, amount: string) {
    dispatchApproveTransaction({
      state: EReducerState.start,
      payload: undefined
    });

    for (const contractDetails of tokensContractDetails) {
      if (tokenName !== contractDetails.name) {
        continue;
      }

      const signer = await ethersProvider.getSigner();
      const tokenContract = new ethers.Contract(
        contractDetails.address,
        contractDetails.abi,
        signer
      );

      try {
        const transactionResponse: TransactionResponse = (await tokenContract.approve(
          aaveContractDetails.address,
          parseUnits(amount, contractDetails.decimals)
        )) as TransactionResponse;

        console.log('transactionResponse', transactionResponse);

        const transactionReceipt = await transactionResponse.wait();
        console.log('transactionReceipt', transactionReceipt);

        if (transactionReceipt) {
          dispatchApproveTransaction({
            state: EReducerState.success,
            payload: undefined
          });
        }
      } catch (error: unknown) {
        // Ethers error object
        if (
          error &&
          typeof error === 'object' &&
          'info' in error &&
          error.info &&
          typeof error.info === 'object' &&
          'error' in error.info &&
          error.info.error &&
          typeof error.info.error === 'object' &&
          'code' in error.info.error &&
          typeof error.info.error.code === 'number'
        ) {
          dispatchApproveTransaction({
            state: EReducerState.error,
            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
            payload: error.info.error.code
          });
        }

        console.error('Error approve transaction', error);
      }
    }
  }

  async function onSupplyClick(tokenName: string, amount: string) {
    dispatchSupplyTransaction({
      state: EReducerState.start,
      payload: undefined
    });

    for (const contractDetails of tokensContractDetails) {
      if (tokenName !== contractDetails.name) {
        continue;
      }

      const signer = await ethersProvider.getSigner();
      const aaveContract = new ethers.Contract(
        aaveContractDetails.address,
        aaveContractDetails.artifacts.abi,
        signer
      );

      try {
        const transactionResponse: TransactionResponse = (await aaveContract.deposit(
          contractDetails.address,
          parseUnits(amount, contractDetails.decimals)
        )) as TransactionResponse;

        console.log('transactionResponse', transactionResponse);

        const transactionReceipt = await transactionResponse.wait();
        console.log('transactionReceipt', transactionReceipt);

        if (transactionReceipt) {
          dispatchSupplyTransaction({
            state: EReducerState.success,
            payload: undefined
          });
        }
      } catch (error: unknown) {
        // Ethers error object
        if (
          error &&
          typeof error === 'object' &&
          'info' in error &&
          error.info &&
          typeof error.info === 'object' &&
          'error' in error.info &&
          error.info.error &&
          typeof error.info.error === 'object' &&
          'code' in error.info.error &&
          typeof error.info.error.code === 'number'
        ) {
          dispatchSupplyTransaction({
            state: EReducerState.error,
            payload: error.info.error.code
          });
        }

        console.error('Error deposit transaction', error);
      }
    }
  }

  return (
    <ExpandableSecion
      title='Assets to supply'
      className={cn('flex w-full flex-col gap-y-2.5', className)}
      defaultExpanded={defaultExpanded}
      {...properties}
    >
      {walletAssetsState.isLoading ? (
        <Skeleton className='h-[17rem] w-full' />
      ) : walletAssetsState.isSuccess && walletAssetsState.tokens?.length === 0 ? (
        <InfoBanner>
          <div>
            Your Ethereum Sepolia wallet is empty. Get free test assets at{' '}
            <Button
              variant='link'
              className='px-0 text-xs text-secondary-foreground underline'
              asChild
            >
              <ExternalAnchor href='https://staging.aave.com/faucet/'>
                Ethereum Sepolia Faucet
              </ExternalAnchor>
            </Button>
          </div>
        </InfoBanner>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              {tableHeaders.map((tableHeader) => (
                <TableHead key={tableHeader} className='w-[100px]'>
                  {tableHeader}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {walletAssetsState.tokens?.map((token, index) => (
              <TableRow key={`${token.name}-${index}`}>
                <TableCell>
                  <div className='flex items-center gap-x-2.5'>
                    <Img
                      src={token.icon}
                      alt={`${token.name}'s logo`}
                      width={36}
                      height={36}
                      className='h-9 w-9 rounded-full'
                    />
                    <span className='font-semibold'>{token.name}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <span className='font-semibold'>{token.normalizedBalance}</span>
                </TableCell>
                <TableCell className='flex justify-end'>
                  <Suspense fallback={<Skeleton className='h-10 w-16' />}>
                    <SupplyAssetsDialog
                      token={token}
                      approveTransactionState={approveTransactionState}
                      supplyTransactionState={supplyTransactionState}
                      onApproveClick={onApproveClick}
                      onSupplyClick={onSupplyClick}
                      dispatchApproveTransaction={dispatchApproveTransaction}
                      dispatchSupplyTransaction={dispatchSupplyTransaction}
                    />
                  </Suspense>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </ExpandableSecion>
  );
}
