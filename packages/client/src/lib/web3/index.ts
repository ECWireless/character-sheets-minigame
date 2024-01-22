import { getDefaultWallets } from '@rainbow-me/rainbowkit';
import { createConfig } from 'wagmi';

import { chains, publicClient, webSocketPublicClient } from './config';
import { PROJECT_ID } from './constants';

const { connectors } = getDefaultWallets({
  appName: 'CharacterSheets Minigame',
  projectId: PROJECT_ID,
  chains,
});

export const wagmiConfig = createConfig({
  autoConnect: true,
  connectors,
  publicClient,
  webSocketPublicClient,
});

export * from './constants';
export * from './helpers';
