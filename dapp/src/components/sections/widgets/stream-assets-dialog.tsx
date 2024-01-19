/* eslint-disable quotes */

import React, { useEffect, useState } from 'react';

import type {
  IStreamTransactionAction,
  TStreamTransactionState
} from '@/reducers/stream-transaction';
import type { TAssetToStream } from '../assets-to-stream';

import { DialogTitle } from '@radix-ui/react-dialog';
import { addDays, addHours, format } from 'date-fns';
import { Trash2 } from 'lucide-react';

import ErrorBanner from '@/components/error-banner';
import LoadingButton from '@/components/loading-button';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import EReducerState from '@/constants/reducer-state';

import AmountInput from './amount-input';
import IncrementalInput from './incremental-input';
import SuccessfulTransaction from './successful-transaction';

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

interface IStreamAssetsDialog {
  token: TAssetToStream;
  streamTransactionState: TStreamTransactionState;
  dispatchStreamTransaction: React.Dispatch<IStreamTransactionAction>;
  onStreamClick(amount: string, streamDuration: string, streamRecipient: string): Promise<void>;
}

export default function StreamAssetsDialog({
  token,
  streamTransactionState,
  dispatchStreamTransaction,
  onStreamClick
}: IStreamAssetsDialog) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

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
  const durationInSeconds = ((endDatePrevision.getTime() - startDate.getTime()) / 1000).toString();

  const errorMessage = streamTransactionState.errorCode
    ? streamTransactionState.errorCode === 4001
      ? 'You cancelled the transaction.'
      : 'Error with your transaction.'
    : 'Error with your transaction.';

  useEffect(() => {
    if (!isDialogOpen) {
      setAmount('');
      setRecipient('');
      setDurationInDays('');
      setDurationInHours('');

      dispatchStreamTransaction({
        state: EReducerState.reset,
        payload: undefined
      });
    }
  }, [isDialogOpen, dispatchStreamTransaction]);

  return (
    <Dialog
      open={isDialogOpen}
      onOpenChange={(isOpen) => {
        if (streamTransactionState.isLoading) {
          return;
        }

        setIsDialogOpen(isOpen);
      }}
    >
      <DialogTrigger asChild>
        <Button className='w-16'>Stream</Button>
      </DialogTrigger>
      <DialogContent className='sm:max-w-md'>
        {!streamTransactionState.isSuccess && (
          <DialogHeader>
            <DialogTitle>Stream {token.name}</DialogTitle>
          </DialogHeader>
        )}

        {streamTransactionState.isSuccess ? (
          <SuccessfulTransaction
            content={`You streamed ${amount} ${token.name}`}
            onCloseClick={() => {
              setIsDialogOpen((previousState) => !previousState);
            }}
          />
        ) : (
          <>
            <AmountInput
              id='stream-assets'
              tokenName={token.name}
              tokenIcon={token.icon}
              amount={amount}
              maxAmount={token.available}
              maxAmountDescription='Available'
              disabled={streamTransactionState.isLoading}
              setAmount={setAmount}
            />

            <div className='grid flex-1 gap-2'>
              <Label htmlFor='recipient-address' className='text-base'>
                Recipient
              </Label>

              <Input
                id='recipient-address'
                value={recipient}
                disabled={streamTransactionState.isLoading}
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
                        disabled={streamTransactionState.isLoading}
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
                      disabled={streamTransactionState.isLoading}
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
                      disabled={streamTransactionState.isLoading}
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
                      disabled={streamTransactionState.isLoading}
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

            {streamTransactionState.isError && <ErrorBanner>{errorMessage}</ErrorBanner>}

            <LoadingButton
              isLoading={streamTransactionState.isLoading}
              loadingContent={`Streaming ${token.name}`}
              defaultContent={isAmountInputValid ? `Stream ${token.name}` : 'Enter an amount'}
              disabled={!areInputsValid || streamTransactionState.isLoading}
              onClick={() => {
                // eslint-disable-next-line @typescript-eslint/no-floating-promises
                onStreamClick(amount, durationInSeconds, recipient);
              }}
            />
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
