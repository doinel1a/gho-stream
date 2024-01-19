import React, { Suspense, useReducer } from 'react';

import type { BrowserProvider, TransactionResponse } from 'ethers';
import type { HTMLAttributes } from 'react';

import { ethers, parseUnits } from 'ethers';

import aaveContractDetails from '@/config/aave-contract-details';
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

export type TAssetToStream = {
  name: string;
  icon: string;
  available: number;
};

const assetsToStream: TAssetToStream[] = [
  {
    name: 'GHO',
    icon: 'https://staging.aave.com/icons/tokens/gho.svg',
    available: 350.69
  }
];

interface IAssetsToStreamSection extends HTMLAttributes<HTMLDivElement> {
  ethersProvider: BrowserProvider;
  defaultExpanded?: boolean;
  onStreamDialogCloseButtonClick: () => void;
}

export default function AssetsToStreamSection({
  ethersProvider,
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
          {assetsToStream.map((token, index) => (
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
                <span className='font-semibold'>{token.available}</span>
              </TableCell>
              <TableCell className='flex justify-end'>
                <Suspense fallback={<Skeleton className='h-10 w-16' />}>
                  <StreamAssetsDialog
                    token={token}
                    streamTransactionState={streamTransactionState}
                    dispatchStreamTransaction={dispatchStreamTransaction}
                    onStreamClick={onStreamClick}
                    onCloseButtonClick={onStreamDialogCloseButtonClick}
                  />
                </Suspense>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </ExpandableSecion>
  );
}
