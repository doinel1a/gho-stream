/* eslint-disable quotes */

import React, { useState } from 'react';

import type { TAssetToStream } from '../assets-to-stream';

import { DialogTitle } from '@radix-ui/react-dialog';
import { addDays, addHours, format } from 'date-fns';
import { Trash2 } from 'lucide-react';

import LoadingButton from '@/components/loading-button';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';

import AmountInput from './amount-input';
import IncrementalInput from './incremental-input';

interface IStreamAssetsDialog {
  token: TAssetToStream;
}

const hoursInADay = 24;
const daysInAYear = 365;
const suggestedDurations = [
  { value: '360', text: '360 days' },
  { value: '180', text: '180 days' },
  { value: '30', text: '30 days' },
  { value: '7', text: '7 days' },
  { value: '2', text: '2 days' },
  { value: '1', text: '1 day' }
];

export default function StreamAssetsDialog({ token }: IStreamAssetsDialog) {
  const [amount, setAmount] = useState('');
  const [recipient, setRecipient] = useState('');
  const [durationInDays, setDurationInDays] = useState('');
  const [durationInHours, setDurationInHours] = useState('');

  const isAmountInputValid = amount.trim() !== '' && amount !== '0';
  const areInputsValid =
    isAmountInputValid &&
    recipient.trim() !== '' &&
    (durationInDays.trim() !== '' || durationInHours.trim() !== '') &&
    (durationInDays !== '0' || durationInHours !== '0');

  const startDate = new Date();
  const endDatePrevision = addHours(
    addDays(startDate, Number(durationInDays)),
    Number(durationInHours)
  );

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button className='w-16'>Stream</Button>
      </DialogTrigger>
      <DialogContent className='sm:max-w-md'>
        <DialogHeader>
          <DialogTitle>Stream {token.name}</DialogTitle>
        </DialogHeader>

        <AmountInput
          id='stream-assets'
          tokenName={token.name}
          tokenIcon={token.icon}
          amount={amount}
          maxAmount={token.available}
          maxAmountDescription='Available'
          areButtonsDisabled={false}
          setAmount={setAmount}
        />

        <div className='grid flex-1 gap-2'>
          <Label htmlFor='recipient-address' className='text-base'>
            Recipient
          </Label>

          <Input
            id='recipient-address'
            value={recipient}
            placeholder='Fill in address or ENS'
            onChange={(event) => setRecipient(event.target.value)}
          />
        </div>

        <div className='grid flex-1 gap-2'>
          <span>Duration</span>
          <div className='grid flex-1 gap-2 rounded-md border border-border p-3'>
            <div className='flex flex-col gap-y-2.5'>
              <span className='text-sm'>Suggested</span>

              <div className='flex gap-x-1.5'>
                {suggestedDurations.map((duration, index) => (
                  <Button
                    key={`${duration.value}-${index}`}
                    variant='outline'
                    className='px-2 py-1 text-xs'
                    onClick={() => setDurationInDays(duration.value)}
                  >
                    {duration.text}
                  </Button>
                ))}
              </div>
            </div>

            <Separator className='my-1' />

            <div className='flex flex-col gap-y-2.5'>
              <div className='flex w-full items-center justify-between'>
                <span className='text-sm'>Custom</span>

                <Button
                  size='icon'
                  variant='outline'
                  className='h-6 w-6'
                  onClick={() => {
                    setDurationInDays('');
                    setDurationInHours('');
                  }}
                >
                  <Trash2 className='h-3.5 w-3.5' />
                </Button>
              </div>

              <div className='relative flex gap-x-2.5'>
                <IncrementalInput
                  id='duration-days'
                  type='days'
                  value={durationInDays}
                  placeholder='0'
                  readOnly
                  onUpClick={() =>
                    setDurationInDays((previousState) =>
                      ((Number(previousState) + 1 + daysInAYear) % daysInAYear).toString()
                    )
                  }
                  onDownClick={() =>
                    setDurationInDays((previousState) =>
                      ((Number(previousState) - 1 + daysInAYear) % daysInAYear).toString()
                    )
                  }
                />

                <IncrementalInput
                  id='duration-hours'
                  type='hours'
                  value={durationInHours}
                  placeholder='0'
                  readOnly
                  onUpClick={() =>
                    setDurationInHours((previousState) =>
                      ((Number(previousState) + 1 + hoursInADay) % hoursInADay).toString()
                    )
                  }
                  onDownClick={() =>
                    setDurationInHours((previousState) =>
                      ((Number(previousState) - 1 + hoursInADay) % hoursInADay).toString()
                    )
                  }
                />
              </div>
            </div>
          </div>
        </div>

        <span className='text-sm text-muted-foreground'>
          The stream would end on {format(endDatePrevision, "MMM d ''yy ~ h:mm a")}
        </span>

        <LoadingButton
          isLoading={false}
          loadingContent={`Streaming ${token.name}`}
          defaultContent={isAmountInputValid ? `Stream ${token.name}` : 'Enter an amount'}
          disabled={!areInputsValid}
          onClick={() => {
            console.log('Stream');
          }}
        />
      </DialogContent>
    </Dialog>
  );
}
