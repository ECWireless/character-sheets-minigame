import { TypedDataDomain } from 'viem';
import { base, Chain, gnosis, mainnet, sepolia } from 'wagmi/chains';

import { ENVIRONMENT } from '../../utils/constants';

export const PROJECT_ID = import.meta.env.VITE_WALLET_CONNECT_PROJECT_ID;
export const INFURA_KEY = import.meta.env.VITE_INFURA_KEY;

export const EXPLORER_URLS: { [key: number]: string } = {
  [gnosis.id]: 'https://gnosisscan.io',
  [sepolia.id]: 'https://sepolia.etherscan.io',
  [base.id]: 'https://basescan.org',
};

export const SUBGRAPH_URLS: { [key: number]: string } = {
  [gnosis.id]:
    'https://api.studio.thegraph.com/query/71457/character-sheets-gnosis/version/latest',
  [sepolia.id]:
    'https://api.studio.thegraph.com/query/71457/character-sheets-sepolia/version/latest',
  [base.id]:
    'https://api.studio.thegraph.com/query/71457/character-sheets-base/version/latest',
};

export const RPC_URLS: { [key: number]: string } = {
  [gnosis.id]: 'https://gnosischain-mainnet.rpc.porters.xyz/wrb6GCyjbz',
  [sepolia.id]: 'https://sepolia-testnet.rpc.porters.xyz/wrb6GCyjbz',
  [mainnet.id]: 'https://eth-mainnet.rpc.porters.xyz/wrb6GCyjbz',
  [base.id]: 'https://base-fullnode-mainnet.rpc.porters.xyz/wrb6GCyjbz',
};

export const CHAINS: { [key: number]: Chain } = {
  [base.id]: base,
  [gnosis.id]: gnosis,
  [sepolia.id]: sepolia,
  [mainnet.id]: mainnet,
};

export const CHAIN_LABEL_TO_ID: { [key: string]: number } = {
  gnosis: gnosis.id,
  sepolia: sepolia.id,
  mainnet: mainnet.id,
  base: base.id,
};

export const CHAIN_ID_TO_IMAGE: { [key: number]: string } = {
  [gnosis.id]: '/images/gnosis.svg',
  [sepolia.id]: '/images/ethereum.svg',
  [mainnet.id]: '/images/ethereum.svg',
  [base.id]: '/images/base.svg',
  42161: '/images/arbitrum.svg',
};

export const CHAIN_ID_TO_LABEL: { [key: number]: string } = {
  [gnosis.id]: 'gnosis',
  [sepolia.id]: 'sepolia',
  [mainnet.id]: 'mainnet',
  [base.id]: 'base',
};

const ALL_SUPPORTED_CHAINS: Chain[] = [base, sepolia];

export const SUPPORTED_CHAINS: Chain[] = (() => {
  switch (ENVIRONMENT) {
    case 'main':
      return ALL_SUPPORTED_CHAINS.filter(chain => !!chain.testnet === false);
    case 'dev':
    default:
      return ALL_SUPPORTED_CHAINS.filter(chain => chain.testnet === true);
  }
})();

const validateConfig = () => {
  if (!INFURA_KEY) {
    throw new Error('VITE_INFURA_KEY is not set');
  }

  if (!PROJECT_ID) {
    throw new Error('VITE_WALLET_CONNECT_PROJECT_ID is not set');
  }

  SUPPORTED_CHAINS.forEach(chain => {
    if (!RPC_URLS[chain.id]) {
      throw new Error(`RPC_URLS[${chain.id}] is not set`);
    }

    if (!EXPLORER_URLS[chain.id]) {
      throw new Error(`EXPLORER_URLS[${chain.id}] is not set`);
    }

    if (!SUBGRAPH_URLS[chain.id]) {
      throw new Error(`SUBGRAPH_URLS[${chain.id}] is not set`);
    }

    if (!CHAIN_ID_TO_LABEL[chain.id]) {
      throw new Error(`CHAIN_ID_TO_LABEL[${chain.id}] is not set`);
    }

    if (
      !CHAIN_LABEL_TO_ID[CHAIN_ID_TO_LABEL[chain.id]] ||
      CHAIN_LABEL_TO_ID[CHAIN_ID_TO_LABEL[chain.id]] !== chain.id
    ) {
      throw new Error(
        `CHAIN_LABEL_TO_ID[${
          CHAIN_ID_TO_LABEL[chain.id]
        }] is not set or does not match ${chain.id}`,
      );
    }
  });
};

export const SIGNATURE_DETAILS = {
  domain: {
    name: 'CharacterSheets - Minigame',
    chainId: base.id,
  } as TypedDataDomain,
  types: {
    LoginRequest: [
      { name: 'playerAddress', type: 'address' },
      { name: 'burnerAddress', type: 'address' },
      { name: 'nonce', type: 'uint256' },
    ],
  },
};

validateConfig();
