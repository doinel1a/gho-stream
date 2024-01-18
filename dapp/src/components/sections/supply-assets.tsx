import React, { Suspense, useEffect, useMemo, useReducer } from 'react';

import type { IToken } from '@/interfaces/token';
import type { BrowserProvider } from 'ethers';
import type { HTMLAttributes } from 'react';

import { ethers, formatUnits } from 'ethers';
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
import tokensContractDetails from '@/config/contracts';
import EReducerState from '@/constants/reducer-state';
import { cn, roundDecimal } from '@/lib/utils';
import { walletAssetsInitialState, walletAssetsReducer } from '@/reducers/wallet-assets';

import ExpandableSecion from '../expandable-section';
import Img from '../img';
import { Skeleton } from '../ui/skeleton';

const SupplyWithdrawAssetsDialog = React.lazy(() => import('./supply-withdraw-assets-dialog'));

const tableHeaders = ['Assets', 'Wallet balance', ''];

interface ISupplyAssetsFunction extends HTMLAttributes<HTMLDivElement> {
  ethersProvider: BrowserProvider;
  defaultExpanded?: boolean;
}

export function SupplyAssetsFunction({
  ethersProvider,
  className,
  defaultExpanded,
  ...properties
}: ISupplyAssetsFunction) {
  const { address } = useAccount();

  const [walletAssetsState, dispatchWalletAssets] = useReducer(
    walletAssetsReducer,
    walletAssetsInitialState
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
                  <Suspense fallback={<Skeleton className='h-10 w-20' />}>
                    <SupplyWithdrawAssetsDialog token={token} />
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
