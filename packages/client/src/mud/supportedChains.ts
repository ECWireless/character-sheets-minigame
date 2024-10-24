/*
 * The supported chains.
 * By default, there are only two chains here:
 *
 * - mudFoundry, the chain running on anvil that pnpm dev
 *   starts by default. It is similar to the viem anvil chain
 *   (see https://viem.sh/docs/clients/test.html), but with the
 *   basefee set to zero to avoid transaction fees.
 * - latticeTestnet, our public test network.
 *

 */

import { MUDChain, mudFoundry } from '@latticexyz/common/chains';

export const redstoneTestnet = {
  name: 'Garnet',
  id: 17069,
  network: 'Garnet',
  nativeCurrency: { decimals: 18, name: 'Ether', symbol: 'ETH' },
  rpcUrls: {
    default: {
      http: ['https://rpc.garnetchain.com'],
      webSocket: ['wss://rpc.garnetchain.com/ws'],
    },
    public: {
      http: ['https://rpc.garnetchain.com'],
      webSocket: ['wss://rpc.garnetchain.com/ws'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Garnet Explorer',
      url: 'https://explorer.garnetchain.com/',
    },
  },
  faucetUrl: 'https://redstone-holesky-faucet-g6e2uilmrq-uc.a.run.app/trpc',
} as const satisfies MUDChain;

export const base = {
  name: 'Base',
  id: 8453,
  network: 'Base',
  nativeCurrency: { decimals: 18, name: 'Ether', symbol: 'ETH' },
  rpcUrls: {
    default: {
      http: ['https://base.infura.io/v3/34a5f1a2463a4b27afadbf054248066b'],
      webSocket: [
        'wss://base.infura.io/ws/v3/34a5f1a2463a4b27afadbf054248066b',
      ],
    },
    public: {
      http: ['https://base.infura.io/v3/34a5f1a2463a4b27afadbf054248066b'],
      webSocket: [
        'wss://base.infura.io/ws/v3/34a5f1a2463a4b27afadbf054248066b',
      ],
    },
  },
  blockExplorers: {
    default: {
      name: 'Base',
      url: 'https://basescan.org/',
    },
  },
};

/*
 * See https://mud.dev/tutorials/minimal/deploy#run-the-user-interface
 * for instructions on how to add networks.
 */
export const supportedChains: MUDChain[] = [
  { ...mudFoundry },
  base,
  redstoneTestnet,
];
