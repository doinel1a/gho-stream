import React from 'react';

import type { TStreamedTransactionState } from '@/reducers/streamed-transaction';
import type { HTMLAttributes } from 'react';

import { cn, roundDecimal } from '@/lib/utils';

import ExpandableSecion from '../expandable-section';
import { Skeleton } from '../ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';

const tableHeaders = ['Status', 'To', 'Value', 'Timeline', 'Streamed'];

interface IStreamedAssetsSection extends HTMLAttributes<HTMLDivElement> {
  streamedTransactionState: TStreamedTransactionState;
  defaultExpanded?: boolean;
}

export default function StreamedAssetsSection({
  streamedTransactionState,
  defaultExpanded,
  className,
  ...properties
}: IStreamedAssetsSection) {
  return (
    <ExpandableSecion
      title='Your streams'
      className={cn('flex w-full flex-col gap-y-2.5', className)}
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
                <TableCell>{stream.depositAmount}</TableCell>
                <TableCell>{stream.endTime}</TableCell>
                <TableCell>
                  {roundDecimal((stream.streamedAmount / stream.depositAmount) * 100, 2)} %
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </ExpandableSecion>
  );
}
