import React, { Suspense, useReducer } from 'react';

import type { TSuppliedTransactionState } from '@/reducers/supplied-transaction';
import type { BrowserProvider, TransactionResponse } from 'ethers';
import type { HTMLAttributes } from 'react';

import { ethers, parseUnits } from 'ethers';

import aaveContractDetails from '@/config/aave-contract-details';
import tokensContractDetails from '@/config/tokens-contract-details';
import EReducerState from '@/constants/reducer-state';
import { cn } from '@/lib/utils';
import {
  withdrawTransactionInitialState,
  withdrawTransactionReducer
} from '@/reducers/withdraw-transaction';

import ExpandableSecion from '../expandable-section';
import Img from '../img';
import { Skeleton } from '../ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';

const WithdrawAssetsDialog = React.lazy(() => import('./widgets/withdraw-assets-dialog'));

const tableHeaders = ['Assets', 'Balance', ''];

interface ISuppliedAssetsSection extends HTMLAttributes<HTMLDivElement> {
  ethersProvider: BrowserProvider;
  suppliedTransactionState: TSuppliedTransactionState;
  defaultExpanded?: boolean;
  onSupplyOrWithdrawDialogClose: () => void;
}

export default function SuppliedAssetsSection({
  ethersProvider,
  suppliedTransactionState,
  defaultExpanded,
  onSupplyOrWithdrawDialogClose,
  className,
  ...properties
}: ISuppliedAssetsSection) {
  const [withdrawTransactionState, dispatchWithdrawTransaction] = useReducer(
    withdrawTransactionReducer,
    withdrawTransactionInitialState
  );

  async function onWithdrawClick(tokenName: string, amount: string) {
    dispatchWithdrawTransaction({
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
        const transactionResponse: TransactionResponse = (await aaveContract.withdraw(
          contractDetails.address,
          parseUnits(amount, contractDetails.decimals)
        )) as TransactionResponse;

        console.log('transactionResponse', transactionResponse);

        const transactionReceipt = await transactionResponse.wait();
        console.log('transactionReceipt', transactionReceipt);

        if (transactionReceipt) {
          dispatchWithdrawTransaction({
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
          dispatchWithdrawTransaction({
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
      title='Your supplies'
      className={cn('flex w-full flex-col gap-y-2.5', className)}
      defaultExpanded={defaultExpanded}
      {...properties}
    >
      {suppliedTransactionState.isLoading ? (
        <Skeleton className='h-[17rem] w-full' />
      ) : suppliedTransactionState.isSuccess && suppliedTransactionState.tokens?.length === 0 ? (
        <div className=''>
          <p className='text-muted-foreground'>Nothing supplied yet</p>
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
            {suppliedTransactionState.tokens?.map((token, index) => (
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
                  <Suspense fallback={<Skeleton className='h-10 w-20' />}>
                    <WithdrawAssetsDialog
                      token={token}
                      withdrawTransactionState={withdrawTransactionState}
                      onWithdrawClick={onWithdrawClick}
                      onWithdrawDialogClose={onSupplyOrWithdrawDialogClose}
                      dispatchWithdrawTransaction={dispatchWithdrawTransaction}
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
