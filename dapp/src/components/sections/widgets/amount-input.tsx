import React from 'react';

import type { IToken } from '@/interfaces/token';

import { X } from 'lucide-react';

import Img from '../../img';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';

interface IAmountInput {
  id: string;
  token: IToken;
  amount: string;
  areButtonsDisabled: boolean;
  setAmount: React.Dispatch<React.SetStateAction<string>>;
}

export default function AmountInput({
  id,
  token,
  amount,
  areButtonsDisabled,
  setAmount
}: IAmountInput) {
  return (
    <div className='grid flex-1 gap-2'>
      <Label htmlFor={id} className='text-base'>
        Amount
      </Label>

      <div className='relative flex items-center'>
        <Input
          id={id}
          value={amount}
          placeholder='0.00'
          className='h-16 text-xl'
          onChange={(event) => setAmount(event.target.value)}
        />

        <div className='absolute right-3 flex flex-col gap-y-1 bg-background'>
          <div className='flex items-center justify-end gap-x-2.5'>
            {amount !== '' && (
              <Button
                size='icon'
                variant='outline'
                className='mr-2.5 h-4 w-4 rounded-full bg-muted'
                disabled={areButtonsDisabled}
                onClick={() => setAmount('')}
              >
                <X className='h-2.5 w-2.5 text-muted-foreground' />
              </Button>
            )}

            <Img
              src={token.icon}
              alt={`${token.name}'s logo`}
              width={24}
              height={24}
              className='h-6 w-6 rounded-full'
            />
            <span className='font-semibold'>{token.name}</span>
          </div>

          <div className='flex items-center gap-x-1.5'>
            <span className='text-xs'>Wallet balance {token.normalizedBalance}</span>

            <Button
              variant='ghost'
              className='h-5 px-0 py-1 text-xs'
              disabled={amount === token.normalizedBalance.toString() || areButtonsDisabled}
              onClick={() => setAmount(token.normalizedBalance.toString())}
            >
              MAX
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
