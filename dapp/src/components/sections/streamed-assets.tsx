import React, { Suspense } from 'react';

import type { TStreamedTransactionState } from '@/reducers/streamed-transaction';
import type { HTMLAttributes } from 'react';

import { cn, roundDecimal } from '@/lib/utils';

import ExpandableSecion from '../expandable-section';
import { Skeleton } from '../ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';

const StreamDetailsDialog = React.lazy(() => import('./widgets/stream-details-dialog'));

const tableHeaders = ['Status', 'To', 'Streamed', 'Timeline', ''];

interface IStreamedAssetsSection extends HTMLAttributes<HTMLDivElement> {
  streamedTransactionState: TStreamedTransactionState;
  streamedBalance: number;
  defaultExpanded?: boolean;
}

export default function StreamedAssetsSection({
  streamedTransactionState,
  streamedBalance,
  defaultExpanded,
  className,
  ...properties
}: IStreamedAssetsSection) {
  return (
    <ExpandableSecion
      title='Your streams'
      className={cn('flex w-full flex-col gap-y-2.5', className)}
      balance={streamedBalance}
      defaultExpanded={defaultExpanded}
      {...properties}
    >
      {streamedTransactionState.isLoading ? (
        <Skeleton className='h-[17rem] w-full' />
      ) : streamedTransactionState.isSuccess && streamedTransactionState.streams?.length === 0 ? (
        <div className=''>
          <p className='text-muted-foreground'>Nothing streamed yet</p>
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              {tableHeaders.map((tableHeader) => (
                <TableHead key={tableHeader}>{tableHeader}</TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {streamedTransactionState.streams?.map((stream) => (
              <TableRow key={stream.id}>
                <TableCell>{stream.status}</TableCell>
                <TableCell>
                  {stream.recipient.slice(0, 5) + '...' + stream.recipient.slice(-3)}
                </TableCell>
                <TableCell>
                  {roundDecimal(
                    stream.depositAmount * (stream.streamedAmount / stream.depositAmount),
                    2
                  )}
                </TableCell>
                <TableCell>{stream.endTime}</TableCell>
                <TableCell>
                  <Suspense fallback={<Skeleton className='h-7 w-7' />}>
                    <StreamDetailsDialog stream={stream} />
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
