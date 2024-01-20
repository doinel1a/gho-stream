import React from 'react';

import type { TNetWorthTransactionState } from '@/reducers/net-worth-transaction';

import { useAccount } from 'wagmi';

import Img from './img';
import { Skeleton } from './ui/skeleton';

interface IHeader {
  netWorthTransactionState: TNetWorthTransactionState;
}

export default function Header({ netWorthTransactionState }: IHeader) {
  const { isConnected } = useAccount();

  return (
    <header className='h-32 w-full'>
      <div className='flex flex-col gap-y-2.5'>
        <div className='flex items-center gap-x-2.5'>
          <div className='relative'>
            <Img
              src='https://staging.aave.com/icons/networks/ethereum.svg'
              alt="Ethereum's logo"
              width={9}
              height={9}
              className='h-9 w-9 rounded-full'
            />

            <span
              title='Sepolia'
              className='absolute -bottom-1 -right-1 flex h-4 w-4 cursor-pointer items-center justify-center rounded-full bg-blue-400 p-2 text-xs'
            >
              S
            </span>
          </div>

          <h1 className='text-3xl font-bold'>Ethereum Market</h1>
        </div>

        {isConnected &&
          (netWorthTransactionState.isLoading ? (
            <Skeleton className='h-12 w-24' />
          ) : (
            <div className='flex flex-col'>
              <p className='text-sm text-muted-foreground'>Net worth</p>

              <div className='flex items-center gap-x-1 text-xl'>
                {/* Dollar sign code */}
                <span className='font-bold text-muted-foreground'>&#36;</span>
                <span className='font-bold'>
                  {!netWorthTransactionState.netWorth || netWorthTransactionState.netWorth === 0
                    ? '0.00'
                    : netWorthTransactionState.netWorth}
                </span>
              </div>
            </div>
          ))}
      </div>
    </header>
  );
}
