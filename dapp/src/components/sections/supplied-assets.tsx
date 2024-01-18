import React, { Suspense, useReducer } from 'react';

import type { IToken } from '@/interfaces/token';
import type { BrowserProvider, TransactionResponse } from 'ethers';
import type { HTMLAttributes } from 'react';

import { ethers, parseUnits } from 'ethers';
import { useAccount } from 'wagmi';

import aaveContractDetails from '@/config/aave-contract-details';
import tokensContractDetails from '@/config/tokens-contract-details';
import EReducerState from '@/constants/reducer-state';
import { cn } from '@/lib/utils';
import {
  approveTransactionInitialState,
  approveTransactionReducer
} from '@/reducers/approve-transaction';
import {
  supplyTransactionInitialState,
  supplyTransactionReducer
} from '@/reducers/supply-transaction';

import ExpandableSecion from '../expandable-section';
import Img from '../img';
import { Skeleton } from '../ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';

const SupplyAssetsDialog = React.lazy(() => import('./widgets/supply-assets-dialog'));
const WithdrawAssetsDialog = React.lazy(() => import('./widgets/withdraw-assets-dialog'));

const tableHeaders = ['Assets', 'Balance', ''];

interface ISuppliedAssetsSection extends HTMLAttributes<HTMLDivElement> {
  ethersProvider: BrowserProvider;
  defaultExpanded?: boolean;
}

export default function SuppliedAssetsSection({
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  ethersProvider,
  className,
  defaultExpanded,
  ...properties
}: ISuppliedAssetsSection) {
  const suppliedAssets: IToken[] = [
    {
      name: 'DAI',
      icon: 'https://staging.aave.com/icons/tokens/dai.svg',
      normalizedBalance: 10_000,
      weiBalance: 9_999_998_803_039_848_520_301n
    }
  ];
  const isLoading = false;
  const isSuccess = true;

  const { address } = useAccount();

  const [approveTransactionState, dispatchApproveTransaction] = useReducer(
    approveTransactionReducer,
    approveTransactionInitialState
  );

  const [supplyTransactionState, dispatchSupplyTransaction] = useReducer(
    supplyTransactionReducer,
    supplyTransactionInitialState
  );

  async function onApproveClick(contractName: string, amount: string) {
    dispatchApproveTransaction({
      state: EReducerState.start,
      payload: undefined
    });

    for (const contractDetails of tokensContractDetails) {
      if (contractName !== contractDetails.name) {
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
          address,
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
        aaveContractDetails.abi.abi,
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

  // eslint-disable-next-line unicorn/consistent-function-scoping
  async function onWithdrawClick() {
    console.log('WITHDRAW');
  }

  return (
    <ExpandableSecion
      title='Your supplies'
      className={cn('flex w-full flex-col gap-y-2.5', className)}
      defaultExpanded={defaultExpanded}
      {...properties}
    >
      {isLoading ? (
        <Skeleton className='h-[17rem] w-full' />
      ) : isSuccess && suppliedAssets?.length === 0 ? (
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
            {suppliedAssets.map((token, index) => (
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
                <TableCell className='flex justify-end gap-x-2.5'>
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

                  <Suspense fallback={<Skeleton className='h-10 w-20' />}>
                    <WithdrawAssetsDialog token={token} onWithdrawClick={onWithdrawClick} />
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
