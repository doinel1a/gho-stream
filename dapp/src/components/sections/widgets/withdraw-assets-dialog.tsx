import React, { useState } from 'react';

import type { IToken } from '@/interfaces/token';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog';

import AmountInput from './amount-input';

interface IWithdrawAssetsSection {
  token: IToken;
  onWithdrawClick: () => void;
}

export default function WithdrawAssetsSection({ token, onWithdrawClick }: IWithdrawAssetsSection) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [amount, setAmount] = useState('');

  const isInputValid = amount !== '' && amount !== '0';

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

        <div className='flex w-full flex-col gap-y-2.5'>
          <Button disabled={!isInputValid} onClick={onWithdrawClick}>
            {isInputValid ? <span>Withdraw {token.name}</span> : <span>Enter an amount</span>}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
