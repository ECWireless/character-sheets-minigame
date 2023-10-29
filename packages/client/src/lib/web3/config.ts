import { goerli } from "viem/chains";
import { infuraProvider } from "wagmi/providers/infura";
import { jsonRpcProvider } from "wagmi/providers/jsonRpc";
import { Chain, configureChains } from "wagmi";
import { publicProvider } from "wagmi/providers/public";

export const DEFAULT_CHAIN = goerli;
export const PROJECT_ID = import.meta.env.VITE_WALLET_CONNECT_PROJECT_ID;
export const INFURA_KEY = import.meta.env.VITE_INFURA_KEY;

if (!PROJECT_ID) {
  throw new Error(
    `Invalid/Missing environment variable: "VITE_WALLET_CONNECT_PROJECT_ID"`
  );
}

if (!INFURA_KEY) {
  throw new Error(`Invalid/Missing environment variable: "VITE_INFURA_KEY"`);
}

export const { chains, publicClient, webSocketPublicClient } = configureChains(
  [DEFAULT_CHAIN],
  [
    infuraProvider({ apiKey: INFURA_KEY }),
    jsonRpcProvider({
      rpc: (localChain: Chain) => ({
        http: localChain.rpcUrls.default.http[0],
      }),
    }),
    publicProvider(),
  ]
);
