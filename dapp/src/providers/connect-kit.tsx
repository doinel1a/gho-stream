/* eslint-disable sonarjs/no-duplicate-string */

import React from 'react';

import type { PropsWithChildren } from 'react';

import { ConnectKitProvider as FamilyConnectKitProvider, getDefaultConfig } from 'connectkit';
import { createConfig, WagmiConfig } from 'wagmi';

const config = createConfig(
  getDefaultConfig({
    appName: 'Your App Name',
    appDescription: 'Your App Description',
    appIcon: 'https://family.co/logo.png',
    appUrl: 'https://family.co',
    walletConnectProjectId: (import.meta.env.VITE_WALLETCONNECT_PROJECT_ID ?? '') as string
  })
);

interface IConnectKitProvider extends PropsWithChildren {}

export default function ConnectKitProvider({ children }: IConnectKitProvider) {
  return (
    <WagmiConfig config={config}>
      <FamilyConnectKitProvider>{children}</FamilyConnectKitProvider>
    </WagmiConfig>
  );
}
