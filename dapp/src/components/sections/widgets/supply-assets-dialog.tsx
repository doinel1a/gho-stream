import React, { useEffect, useState } from 'react';

import type { IToken } from '@/interfaces/token';
import type {
  IApproveTransactionAction,
  TApproveTransactionState
} from '@/reducers/approve-transaction';
import type {
  ISupplyTransactionAction,
  TSupplyTransactionState
} from '@/reducers/supply-transaction';

import { Check } from 'lucide-react';

import ErrorBanner from '@/components/error-banner';
import LoadingButton from '@/components/loading-button';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog';
import EReducerState from '@/constants/reducer-state';

import AmountInput from './amount-input';

interface ISupplyAssetsDialog {
  token: IToken;
  approveTransactionState: TApproveTransactionState;
  supplyTransactionState: TSupplyTransactionState;
  onApproveClick(tokenName: string, amount: string): Promise<void>;
  onSupplyClick(tokenName: string, amount: string): Promise<void>;
  dispatchApproveTransaction: React.Dispatch<IApproveTransactionAction>;
  dispatchSupplyTransaction: React.Dispatch<ISupplyTransactionAction>;
}

export default function SupplyAssetsDialog({
  token,
  approveTransactionState,
  supplyTransactionState,
  onApproveClick,
  onSupplyClick,
  dispatchApproveTransaction,
  dispatchSupplyTransaction
}: ISupplyAssetsDialog) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [amount, setAmount] = useState('');

  const isInputValid = amount !== '' && amount !== '0';

  const errorMessage =
    approveTransactionState.errorCode ?? supplyTransactionState.errorCode
      ? approveTransactionState.errorCode ?? supplyTransactionState.errorCode === 4001
        ? 'You cancelled the transaction.'
        : 'Error with your transaction.'
      : 'Error with your transaction.';

  useEffect(() => {
    if (!isDialogOpen) {
      setAmount('');
      dispatchApproveTransaction({
        state: EReducerState.reset,
        payload: undefined
      });

      dispatchSupplyTransaction({
        state: EReducerState.reset,
        payload: undefined
      });
    }
  }, [isDialogOpen, dispatchApproveTransaction, dispatchSupplyTransaction]);

  useEffect(() => {
    console.log('amount', amount);
  }, [amount]);

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        <Button className='w-16'>Supply</Button>
      </DialogTrigger>
      <DialogContent className='sm:max-w-md'>
        {!supplyTransactionState.isSuccess && (
          <DialogHeader>
            <DialogTitle>Supply {token.name}</DialogTitle>
          </DialogHeader>
        )}

        {supplyTransactionState.isSuccess ? (
          <div className='flex flex-col gap-y-5'>
            <div className='flex flex-col items-center gap-y-1'>
              <span className='mb-2.5 rounded-full bg-secondary p-2.5'>
                <Check className='h-5 w-5 text-green-500' />
              </span>

              <h2 className='text-xl font-semibold'>All done!</h2>
              <h3>
                You supplied {amount} {token.name}
              </h3>
            </div>

            <Button onClick={() => setIsDialogOpen((previousState) => !previousState)}>
              Ok, close
            </Button>
          </div>
        ) : (
          <>
            <div className='flex items-center space-x-2'>
              <AmountInput id='supply-assets' token={token} amount={amount} setAmount={setAmount} />
            </div>

            {(approveTransactionState.isError || supplyTransactionState.isError) && (
              <ErrorBanner>{errorMessage}</ErrorBanner>
            )}

            <div className='flex w-full flex-col gap-y-2.5'>
              {isInputValid && !approveTransactionState.isSuccess && (
                <LoadingButton
                  variant='secondary'
                  isLoading={approveTransactionState.isLoading}
                  loadingContent={`Approving ${token.name}`}
                  defaultContent={`Approve ${token.name} to continue`}
                  disabled={!isInputValid || approveTransactionState.isLoading}
                  onClick={() => onApproveClick(token.name, amount)}
                />
              )}

              <LoadingButton
                isLoading={supplyTransactionState.isLoading}
                loadingContent={`Supplying ${token.name}`}
                defaultContent={isInputValid ? `Supply ${token.name}` : 'Enter an amount'}
                disabled={
                  !isInputValid ||
                  !approveTransactionState.isSuccess ||
                  supplyTransactionState.isLoading
                }
                onClick={() => onSupplyClick(token.name, amount)}
              />
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
