import React, { Suspense } from 'react';

import type { IToken } from '@/interfaces/token';
import type { BrowserProvider } from 'ethers';
import type { HTMLAttributes } from 'react';

import { cn } from '@/lib/utils';

import ExpandableSecion from '../expandable-section';
import Img from '../img';
import { Skeleton } from '../ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';

const SupplyWithdrawAssetsDialog = React.lazy(() => import('./supply-withdraw-assets-dialog'));

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
                  <Suspense fallback={<Skeleton className='h-10 w-20' />}>
                    <SupplyWithdrawAssetsDialog id='supplied-assets' token={token} isSupply />
                  </Suspense>

                  <Suspense fallback={<Skeleton className='h-10 w-20' />}>
                    <SupplyWithdrawAssetsDialog
                      id='withdraw-assets'
                      token={token}
                      isSupply={false}
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
