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

interface ISupplyAssetsDialog {
  id: string;
  token: IToken;
  isSupply: boolean;
}

export default function SupplyWithdrawAssetsDialog({ id, token, isSupply }: ISupplyAssetsDialog) {
  const [amount, setAmount] = useState('');

  const isInputValid = amount !== '' && amount !== '0';

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant={isSupply ? 'default' : 'secondary'} className='w-20'>
          {isSupply ? <span>Supply</span> : <span>Withdraw</span>}
        </Button>
      </DialogTrigger>
      <DialogContent className='sm:max-w-md'>
        <DialogHeader>
          <DialogTitle>
            {isSupply ? <span>Supply {token.name}</span> : <span>Withdraw {token.name}</span>}
          </DialogTitle>
        </DialogHeader>
        <div className='flex items-center space-x-2'>
          <AmountInput id={id} token={token} amount={amount} setAmount={setAmount} />
        </div>

        <div className='flex w-full flex-col gap-y-2.5'>
          {isInputValid && (
            <Button variant='secondary' disabled={!isInputValid}>
              {isSupply ? (
                <span>Approve {token.name} to continue</span>
              ) : (
                <span>Approve to continue</span>
              )}
            </Button>
          )}

          <Button disabled={!isInputValid}>
            {isInputValid ? (
              isSupply ? (
                <span>Supply {token.name}</span>
              ) : (
                <span>Withdraw {token.name} </span>
              )
            ) : (
              <span>Enter an amount</span>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
