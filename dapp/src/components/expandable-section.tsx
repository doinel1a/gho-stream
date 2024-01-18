import React, { useState } from 'react';

import type { HTMLAttributes, PropsWithChildren } from 'react';

import { Minus, Plus } from 'lucide-react';

import { cn } from '@/lib/utils';

import { Button } from './ui/button';

interface IExpandableSecion extends PropsWithChildren, HTMLAttributes<HTMLDivElement> {
  title: string;
  defaultExpanded?: boolean;
}

export default function ExpandableSecion({
  title,
  children,
  className,
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
      {isSectionExpaned && <>{children}</>}
    </section>
  );
}
