import React from 'react';

import type { ButtonProperties } from './ui/button';

import { useModal } from 'connectkit';
import { useAccount } from 'wagmi';

import { cn } from '@/lib/utils';

import { Button } from './ui/button';

interface IWalletButton extends ButtonProperties {}

export default function WalletButton({ className, ...properties }: IWalletButton) {
  const { isConnected, address } = useAccount();
  const { setOpen } = useModal();

  const displayAddress = address?.slice(0, 8) + '...' + address?.slice(-8);

  return (
    <Button
      variant={isConnected ? 'secondary' : 'default'}
      className={cn(className)}
      onClick={() => setOpen(true)}
      {...properties}
    >
      {isConnected ? displayAddress : 'Connect Wallet'}
    </Button>
  );
}
