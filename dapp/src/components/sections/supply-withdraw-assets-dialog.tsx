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
  token: IToken;
}

export function SupplyAssetsDialog({ token }: ISupplyAssetsDialog) {
  const [supplyAmount, setSupplyAmount] = useState('');

  const isInputValid = supplyAmount !== '' && supplyAmount !== '0';

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant='secondary' className='w-20'>
          Supply
        </Button>
      </DialogTrigger>
      <DialogContent className='sm:max-w-md'>
        <DialogHeader>
          <DialogTitle>Supply {token.name}</DialogTitle>
        </DialogHeader>
        <div className='flex items-center space-x-2'>
          <AmountInput
            id='supply-assets'
            token={token}
            amount={supplyAmount}
            setAmount={setSupplyAmount}
          />
        </div>

        <div className='flex w-full flex-col gap-y-2.5'>
          {isInputValid && (
            <Button variant='secondary' disabled={!isInputValid}>
              Approve {token.name} to continue
            </Button>
          )}

          <Button disabled={!isInputValid}>
            {isInputValid ? <span>Supply {token.name}</span> : <span>Supply an amount</span>}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
