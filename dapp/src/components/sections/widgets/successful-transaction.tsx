import React from 'react';

import type { HTMLAttributes } from 'react';

import { Check } from 'lucide-react';

import { Button } from '@/components/ui/button';

interface ISuccessfulTransaction extends HTMLAttributes<HTMLDivElement> {
  content: string;
  onCloseClick: () => void;
}

export default function SuccessfulTransaction({ content, onCloseClick }: ISuccessfulTransaction) {
  return (
    <div className='flex flex-col gap-y-5'>
      <div className='flex flex-col items-center gap-y-1'>
        <span className='mb-2.5 rounded-full bg-secondary p-2.5'>
          <Check className='h-7 w-7 text-green-500' />
        </span>

        <h2 className='text-xl font-semibold'>All done!</h2>
        <h3>{content}</h3>
      </div>

      <Button onClick={onCloseClick}>Ok, close</Button>
    </div>
  );
}
