import React, { useState } from 'react';

import type { HTMLAttributes, PropsWithChildren } from 'react';

import { Minus, Plus } from 'lucide-react';

import { cn } from '@/lib/utils';

import { Button } from './ui/button';

interface IExpandableSecion extends PropsWithChildren, HTMLAttributes<HTMLDivElement> {
  title: string;
  balance?: number;
  defaultExpanded?: boolean;
}

export default function ExpandableSecion({
  title,
  children,
  className,
  balance,
  defaultExpanded,
  ...properties
}: IExpandableSecion) {
  const [isSectionExpaned, setIsSectionExpanded] = useState(defaultExpanded ?? false);

  return (
    <section className={cn('rounded-md border border-border p-5', className)} {...properties}>
      <div className='flex w-full items-center justify-between'>
        <h2 className='text-xl font-medium'>{title}</h2>

        <Button
          variant='ghost'
          className='flex items-center text-muted-foreground hover:text-muted-foreground'
          onClick={() => setIsSectionExpanded((previousState) => !previousState)}
        >
          {isSectionExpaned ? (
            <>
              <span>Hide</span>
              <Minus className='ml-2.5 h-4 w-4' />
            </>
          ) : (
            <>
              <span>Show</span>
              <Plus className='ml-2.5 h-4 w-4' />
            </>
          )}
        </Button>
      </div>

      {balance ? (
        <div className='flex w-min gap-x-1 rounded-md border p-1 text-sm text-muted-foreground'>
          <span className=''>Balance</span>
          {/* Dollar sign code */}
          <span className='font-semibold'>&#36;</span>
          <span className='font-semibold text-secondary-foreground'>{balance}</span>
        </div>
      ) : null}

      {isSectionExpaned && <>{children}</>}
    </section>
  );
}
