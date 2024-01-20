/* eslint-disable indent */

import React, { Suspense, useReducer } from 'react';

import type { TMaxAmountToBorrowTransactionState } from '@/reducers/max-amount-to-borrow-transaction';
import type { BrowserProvider, TransactionResponse } from 'ethers';
import type { HTMLAttributes } from 'react';

import { ethers, parseUnits } from 'ethers';

import aaveContractDetails from '@/config/aave-contract-details';
import ghoTokenDetails from '@/config/gho-token-details';
import EReducerState from '@/constants/reducer-state';
import { cn } from '@/lib/utils';
import {
  streamTransactionInitialState,
  streamTransactionReducer
} from '@/reducers/stream-transaction';

import ExpandableSecion from '../expandable-section';
import Img from '../img';
import { Skeleton } from '../ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';

const StreamAssetsDialog = React.lazy(() => import('./widgets/stream-assets-dialog'));

const tableHeaders = ['Assets', 'Available to stream', ''];

interface IAssetsToStreamSection extends HTMLAttributes<HTMLDivElement> {
  ethersProvider: BrowserProvider;
  maxAmountToBorrowTransactionState: TMaxAmountToBorrowTransactionState;
  defaultExpanded?: boolean;
  onStreamDialogCloseButtonClick: () => void;
}

export default function AssetsToStreamSection({
  ethersProvider,
  maxAmountToBorrowTransactionState,
  defaultExpanded,
  className,
  onStreamDialogCloseButtonClick,
  ...properties
}: IAssetsToStreamSection) {
  const [streamTransactionState, dispatchStreamTransaction] = useReducer(
    streamTransactionReducer,
    streamTransactionInitialState
  );

  async function onStreamClick(amount: string, streamDuration: string, streamRecipient: string) {
    dispatchStreamTransaction({
      state: EReducerState.start,
      payload: undefined
    });

    const signer = await ethersProvider.getSigner();
    const aaveContract = new ethers.Contract(
      aaveContractDetails.address,
      aaveContractDetails.artifacts.abi,
      signer
    );

    try {
      const transactionResponse: TransactionResponse = (await aaveContract.borrowGhoThroughStream(
        parseUnits(amount, 18),
        streamDuration,
        streamRecipient
      )) as TransactionResponse;

      console.log('transactionResponse', transactionResponse);

      const transactionReceipt = await transactionResponse.wait();
      console.log('transactionReceipt', transactionReceipt);

      if (transactionReceipt) {
        dispatchStreamTransaction({
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
        dispatchStreamTransaction({
          state: EReducerState.error,
          payload: error.info.error.code
        });
      }

      console.error('Error deposit transaction', error);
    }
  }

  return (
    <ExpandableSecion
      title='Assets to stream'
      className={cn('flex w-full flex-col gap-y-2.5', className)}
      defaultExpanded={defaultExpanded}
      {...properties}
    >
      {maxAmountToBorrowTransactionState.isLoading ? (
        <Skeleton className='h-20 w-full' />
      ) : !maxAmountToBorrowTransactionState.maxAmount ||
        (maxAmountToBorrowTransactionState.isSuccess &&
          maxAmountToBorrowTransactionState.maxAmount === 0) ? (
        <div className=''>
          <p className='text-muted-foreground'>Supply assets as collateral in order to borrow</p>
        </div>
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
            <TableRow>
              <TableCell>
                <div className='flex items-center gap-x-2.5'>
                  <Img
                    src={ghoTokenDetails.icon}
                    alt={`${ghoTokenDetails.name}'s logo`}
                    width={36}
                    height={36}
                    className='h-9 w-9 rounded-full'
                  />
                  <span className='font-semibold'>{ghoTokenDetails.name}</span>
                </div>
              </TableCell>
              <TableCell>
                <span className='font-semibold'>{maxAmountToBorrowTransactionState.maxAmount}</span>
              </TableCell>
              <TableCell className='flex justify-end'>
                <Suspense fallback={<Skeleton className='h-10 w-16' />}>
                  <StreamAssetsDialog
                    maxAmountToStream={maxAmountToBorrowTransactionState.maxAmount}
                    streamTransactionState={streamTransactionState}
                    dispatchStreamTransaction={dispatchStreamTransaction}
                    onStreamClick={onStreamClick}
                    onCloseButtonClick={onStreamDialogCloseButtonClick}
                  />
                </Suspense>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      )}
    </ExpandableSecion>
  );
}
