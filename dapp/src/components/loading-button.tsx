import React from 'react';

import type { ButtonProperties } from './ui/button';

import { Loader2 } from 'lucide-react';

import { cn } from '@/lib/utils';

import { Button } from './ui/button';

interface ILoadingButton extends ButtonProperties {
  isLoading: boolean;
  loadingContent: string;
  defaultContent: string;
}

export default function LoadingButton({
  isLoading,
  loadingContent,
  defaultContent,
  className,
  ...properties
}: ILoadingButton) {
  return (
    <Button className={cn('', className)} {...properties}>
      {isLoading ? (
        <div className='flex items-center gap-x-2.5'>
          <Loader2 className='h-4 w-4 animate-spin' /> {loadingContent}
        </div>
      ) : (
        <span>{defaultContent}</span>
      )}
    </Button>
  );
}
