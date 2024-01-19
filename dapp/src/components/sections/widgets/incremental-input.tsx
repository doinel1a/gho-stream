import React from 'react';

import type { InputProps } from '@/components/ui/input';

import { ChevronDown, ChevronUp } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface IIncrementalInput extends InputProps {
  type: 'hours' | 'days';
  onUpClick: () => void;
  onDownClick: () => void;
}

export default function IncrementalInput({
  type,
  disabled,
  onUpClick,
  onDownClick,
  ...properties
}: IIncrementalInput) {
  return (
    <div className='relative flex w-full items-center'>
      <div className='absolute left-3 flex h-full w-full flex-col justify-between py-2'>
        <Button
          size='icon'
          variant='secondary'
          className='h-3 w-6 rounded-sm'
          disabled={disabled}
          onClick={onUpClick}
        >
          <ChevronUp className='h-3.5 w-3.5 text-secondary-foreground' />
        </Button>

        <Button
          size='icon'
          variant='secondary'
          className='h-3 w-6 rounded-sm'
          disabled={disabled}
          onClick={onDownClick}
        >
          <ChevronDown className='h-3.5 w-3.5 text-secondary-foreground' />
        </Button>
      </div>

      <span className='absolute right-3 text-sm text-muted-foreground'>{type}</span>

      <Input className='h-12 w-full pl-12 text-lg' disabled={disabled} {...properties} />
    </div>
  );
}
