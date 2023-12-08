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

import {
  MUDChain,
  mudFoundry,
  
} from "@latticexyz/common/chains";

export const redstoneTestnet = {
  name: "Redstone Testnet",
  id: 17001,
  network: "redstone-holesky",
  nativeCurrency: { decimals: 18, name: "Ether", symbol: "ETH" },
  rpcUrls: {
    default: {
      http: ["https://rpc.holesky.redstone.xyz"],
      webSocket: ["wss://rpc.holesky.redstone.xyz/ws"],
    },
    public: {
      http: ["https://rpc.holesky.redstone.xyz"],
      webSocket: ["wss://rpc.holesky.redstone.xyz/ws"],
    },
  },
  blockExplorers: {
    default: {
      name: "Redstone Testnet",
      url: "https://explorer.holesky.redstone.xyz",
    },
  },
} as const satisfies MUDChain;

/*
 * See https://mud.dev/tutorials/minimal/deploy#run-the-user-interface
 * for instructions on how to add networks.
 */
export const supportedChains: MUDChain[] = [mudFoundry, redstoneTestnet];
