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
import SuccessfulTransaction from './successful-transaction';

interface ISupplyAssetsDialog {
  token: IToken;
  approveTransactionState: TApproveTransactionState;
  supplyTransactionState: TSupplyTransactionState;
  onApproveClick(tokenName: string, amount: string): Promise<void>;
  onSupplyClick(tokenName: string, amount: string): Promise<void>;
  onSupplyDialogClose: () => void;
  dispatchApproveTransaction: React.Dispatch<IApproveTransactionAction>;
  dispatchSupplyTransaction: React.Dispatch<ISupplyTransactionAction>;
}

export default function SupplyAssetsDialog({
  token,
  approveTransactionState,
  supplyTransactionState,
  onApproveClick,
  onSupplyClick,
  onSupplyDialogClose,
  dispatchApproveTransaction,
  dispatchSupplyTransaction
}: ISupplyAssetsDialog) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [amount, setAmount] = useState('');

  const isInputValid = amount !== '' && amount !== '0' && Number(amount) <= token.normalizedBalance;

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

  function onDialogOpenChange(isOpen: boolean) {
    if (approveTransactionState.isLoading || supplyTransactionState.isLoading) {
      return;
    }

    if (!isOpen && approveTransactionState.isSuccess && supplyTransactionState.isSuccess) {
      onSupplyDialogClose();
    }

    setIsDialogOpen(isOpen);
  }

  return (
    <Dialog open={isDialogOpen} onOpenChange={onDialogOpenChange}>
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
          <SuccessfulTransaction
            content={`You supplied ${amount} ${token.name}`}
            onCloseClick={() => {
              setIsDialogOpen((previousState) => !previousState);
              onSupplyDialogClose();
            }}
          />
        ) : (
          <>
            <AmountInput
              id='supply-assets'
              tokenName={token.name}
              tokenIcon={token.icon}
              amount={amount}
              maxAmount={token.normalizedBalance}
              maxAmountDescription='Wallet balance'
              disabled={approveTransactionState.isLoading || supplyTransactionState.isLoading}
              setAmount={setAmount}
            />

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
