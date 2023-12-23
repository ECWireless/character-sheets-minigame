import { TypedDataDomain } from 'viem';

export const SUBGRAPH_URLS: { [key: number]: string } = {
  [100]:
    'https://api.thegraph.com/subgraphs/name/dan13ram/character-sheets-gnosis',
};

export const EXPLORER_URLS: { [key: number]: string } = {
  [100]: 'https://gnosisscan.io',
};

export const SIGNATURE_DETAILS = {
  domain: {
    name: 'CharacterSheets - Minigame',
    chainId: 100,
  } as TypedDataDomain,
  types: {
    SpawnRequest: [
      { name: 'chainId', type: 'uint256' },
      { name: 'gameAddress', type: 'address' },
      { name: 'playerAddress', type: 'address' },
      { name: 'x', type: 'uint32' },
      { name: 'y', type: 'uint32' },
      { name: 'signature', type: 'bytes' },
    ],
    UpdateBurnerWalletRequest: [
      { name: 'chainId', type: 'uint256' },
      { name: 'playerAddress', type: 'address' },
      { name: 'signature', type: 'bytes' },
    ],
  },
};
