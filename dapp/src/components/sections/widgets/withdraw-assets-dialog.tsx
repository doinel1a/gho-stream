import React, { useEffect, useState } from 'react';

import type { IToken } from '@/interfaces/token';
import type {
  IApproveTransactionAction,
  TApproveTransactionState
} from '@/reducers/approve-transaction';

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

interface IWithdrawAssetsSection {
  token: IToken;
  approveTransactionState: TApproveTransactionState;
  onApproveClick(contractName: string, amount: string): Promise<void>;
  onWithdrawClick: () => void;
  dispatchApproveTransaction: React.Dispatch<IApproveTransactionAction>;
}

export default function WithdrawAssetsSection({
  token,
  approveTransactionState,
  onApproveClick,
  onWithdrawClick,
  dispatchApproveTransaction
}: IWithdrawAssetsSection) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [amount, setAmount] = useState('');

  const isInputValid = amount !== '' && amount !== '0';

  const errorMessage = approveTransactionState.errorCode
    ? approveTransactionState.errorCode === 4001
      ? 'You cancelled the transaction.'
      : 'Error with your transaction.'
    : 'Error with your transaction.';

  useEffect(() => {
    if (!isDialogOpen) {
      dispatchApproveTransaction({
        state: EReducerState.reset,
        payload: undefined
      });
    }
  }, [isDialogOpen, dispatchApproveTransaction]);

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        <Button variant='secondary' className='w-20'>
          Withdraw
        </Button>
      </DialogTrigger>
      <DialogContent className='sm:max-w-md'>
        <DialogHeader>
          <DialogTitle>Withdraw {token.name}</DialogTitle>
        </DialogHeader>
        <div className='flex items-center space-x-2'>
          <AmountInput id='withdraw-assets' token={token} amount={amount} setAmount={setAmount} />
        </div>

        {approveTransactionState.isError && <ErrorBanner>{errorMessage}</ErrorBanner>}

        <div className='flex w-full flex-col gap-y-2.5'>
          {isInputValid && (
            <LoadingButton
              variant='secondary'
              isLoading={approveTransactionState.isLoading}
              loadingContent='Approving'
              defaultContent='Approve to continue'
              disabled={!isInputValid || approveTransactionState.isLoading}
              onClick={() => onApproveClick(token.name, amount)}
            />
          )}

          <Button
            disabled={!isInputValid || !approveTransactionState.isSuccess}
            onClick={onWithdrawClick}
          >
            {isInputValid ? <span>Withdraw {token.name}</span> : <span>Enter an amount</span>}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
