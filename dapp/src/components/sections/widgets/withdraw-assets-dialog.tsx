import React, { useEffect, useState } from 'react';

import type { IToken } from '@/interfaces/token';
import type {
  IWithdrawTransactionAction,
  TWithdrawTransactionState
} from '@/reducers/withdraw-transaction';

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

interface IWithdrawAssetsSection {
  token: IToken;
  withdrawTransactionState: TWithdrawTransactionState;
  onWithdrawClick(tokenName: string, amount: string): Promise<void>;
  onWithdrawDialogClose: () => void;
  dispatchWithdrawTransaction: React.Dispatch<IWithdrawTransactionAction>;
}

export default function WithdrawAssetsSection({
  token,
  withdrawTransactionState,
  onWithdrawClick,
  onWithdrawDialogClose,
  dispatchWithdrawTransaction
}: IWithdrawAssetsSection) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [amount, setAmount] = useState('');

  const isInputValid = amount !== '' && amount !== '0';

  const errorMessage = withdrawTransactionState.errorCode
    ? withdrawTransactionState.errorCode === 4001
      ? 'You cancelled the transaction.'
      : 'Error with your transaction.'
    : 'Error with your transaction.';

  useEffect(() => {
    if (!isDialogOpen) {
      setAmount('');

      dispatchWithdrawTransaction({
        state: EReducerState.reset,
        payload: undefined
      });
    }
  }, [isDialogOpen, dispatchWithdrawTransaction]);

  return (
    <Dialog
      open={isDialogOpen}
      onOpenChange={(isOpen) => {
        if (withdrawTransactionState.isLoading) {
          return;
        }

        setIsDialogOpen(isOpen);
      }}
    >
      <DialogTrigger asChild>
        <Button variant='secondary' className='w-20'>
          Withdraw
        </Button>
      </DialogTrigger>
      <DialogContent className='sm:max-w-md'>
        {!withdrawTransactionState.isSuccess && (
          <DialogHeader>
            <DialogTitle>Withdraw {token.name}</DialogTitle>
          </DialogHeader>
        )}

        {withdrawTransactionState.isSuccess ? (
          <SuccessfulTransaction
            content={`You withdrew ${amount} ${token.name}`}
            onCloseClick={() => {
              setIsDialogOpen((previousState) => !previousState);
              onWithdrawDialogClose();
            }}
          />
        ) : (
          <>
            <AmountInput
              id='withdraw-assets'
              tokenName={token.name}
              tokenIcon={token.icon}
              amount={amount}
              maxAmount={token.normalizedBalance}
              maxAmountDescription='Supply balance'
              disabled={withdrawTransactionState.isLoading}
              setAmount={setAmount}
            />

            {withdrawTransactionState.isError && <ErrorBanner>{errorMessage}</ErrorBanner>}

            <LoadingButton
              isLoading={withdrawTransactionState.isLoading}
              loadingContent={`Withdrawing ${token.name}`}
              defaultContent={isInputValid ? `Withdraw ${token.name}` : 'Enter an amount'}
              disabled={!isInputValid || withdrawTransactionState.isLoading}
              onClick={() => onWithdrawClick(token.name, amount)}
            />
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
