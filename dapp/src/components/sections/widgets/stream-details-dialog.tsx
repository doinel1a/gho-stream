import React, { useState } from 'react';

import type IStreamedAsset from '@/interfaces/streamed-asset';

import { useAccount } from 'wagmi';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { roundDecimal } from '@/lib/utils';

interface IStreamDetailsDialog {
  stream: IStreamedAsset;
}

export default function StreamDetailsDialog({ stream }: IStreamDetailsDialog) {
  const { address } = useAccount();

  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const streamedPercentage = roundDecimal((stream.streamedAmount / stream.depositAmount) * 100, 2);

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        <Button size='icon' variant='secondary' className='h-7 w-7'>
          ...
        </Button>
      </DialogTrigger>
      <DialogContent className='flex flex-col sm:max-w-md'>
        <DialogHeader className='w-full text-left'>
          <DialogTitle>Stream #LL2-11155111-{Number(stream.id)}</DialogTitle>
        </DialogHeader>

        <div className='relative my-2.5 flex items-center justify-center'>
          <p className='absolute z-[2] text-secondary-foreground'>
            {streamedPercentage} % out of {stream.depositAmount} GHO
          </p>

          <Progress value={streamedPercentage} className='h-8' />
        </div>

        <div className='flex flex-col gap-5'>
          <div className='flex justify-between'>
            <div className='flex w-1/2 flex-col'>
              <p className='text-muted-foreground'>Chain:</p>
              <p className='font-bold'>Sepolia</p>
            </div>

            <div className='flex w-1/2 flex-col'>
              <p className='text-muted-foreground'>Status:</p>
              <p className='font-bold'>{stream.status}</p>
            </div>
          </div>

          <div className='flex justify-between'>
            <div className='flex w-1/2 flex-col'>
              <p className='text-muted-foreground'>From:</p>
              <p className='font-bold'>{address?.slice(0, 8) + '...' + address?.slice(-8)}</p>
            </div>

            <div className='flex w-1/2 flex-col'>
              <p className='text-muted-foreground'>To:</p>
              <p className='font-bold'>
                {stream.recipient.slice(0, 8) + '...' + stream.recipient.slice(-8)}
              </p>
            </div>
          </div>

          <div className='flex justify-between'>
            <div className='flex w-1/2 flex-col'>
              <p className='text-muted-foreground'>Started on:</p>
              <p className='font-bold'>{stream.startTime}</p>
            </div>

            <div className='flex w-1/2 flex-col'>
              <p className='text-muted-foreground'>
                {stream.status === 'Settled' ? 'Ended on: ' : 'Ends on: '}
              </p>
              <p className='font-bold'>{stream.endTime}</p>
            </div>
          </div>

          <div className='flex justify-between'>
            <div className='flex w-1/2 flex-col'>
              <p className='text-muted-foreground'>Deposit amount:</p>
              <p className='font-bold'>{stream.depositAmount}</p>
            </div>

            <div className='flex w-1/2 flex-col'>
              <p className='text-muted-foreground'>
                {stream.status === 'Settled' ? 'Streamed amount: ' : 'Streaming amount: '}
              </p>
              <p className='font-bold'>{stream.streamedAmount}</p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
