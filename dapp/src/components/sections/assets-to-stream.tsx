import React, { Suspense } from 'react';

import type { BrowserProvider } from 'ethers';
import type { HTMLAttributes } from 'react';

import { cn } from '@/lib/utils';

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
}

export default function AssetsToStreamSection({
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  ethersProvider,
  defaultExpanded,
  className,
  ...properties
}: IAssetsToStreamSection) {
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
                  <StreamAssetsDialog token={token} />
                </Suspense>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </ExpandableSecion>
  );
}
