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

interface ISupplyAssetsDialog {
  token: IToken;
  approveTransactionState: TApproveTransactionState;
  onApproveClick(contractName: string, amount: string): Promise<void>;
  onSupplyClick: () => void;
  dispatchApproveTransaction: React.Dispatch<IApproveTransactionAction>;
}

export default function SupplyAssetsDialog({
  token,
  approveTransactionState,
  onApproveClick,
  onSupplyClick,
  dispatchApproveTransaction
}: ISupplyAssetsDialog) {
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
        <Button className='w-16'>Supply</Button>
      </DialogTrigger>
      <DialogContent className='sm:max-w-md'>
        <DialogHeader>
          <DialogTitle>Supply {token.name}</DialogTitle>
        </DialogHeader>
        <div className='flex items-center space-x-2'>
          <AmountInput id='supply-assets' token={token} amount={amount} setAmount={setAmount} />
        </div>

        {approveTransactionState.isError && <ErrorBanner>{errorMessage}</ErrorBanner>}

        <div className='flex w-full flex-col gap-y-2.5'>
          {isInputValid && (
            <LoadingButton
              variant='secondary'
              isLoading={approveTransactionState.isLoading}
              loadingContent={`Approving ${token.name}`}
              defaultContent={`Approve ${token.name} to continue`}
              disabled={!isInputValid || approveTransactionState.isLoading}
              onClick={() => onApproveClick(token.name, amount)}
            />
          )}

          <Button
            disabled={!isInputValid || !approveTransactionState.isSuccess}
            onClick={onSupplyClick}
          >
            {isInputValid ? <span>Supply {token.name}</span> : <span>Enter an amount</span>}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
