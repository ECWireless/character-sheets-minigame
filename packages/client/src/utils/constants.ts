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
      { name: 'playerAddress', type: 'address' },
      { name: 'burnerAddress', type: 'address' },
      { name: 'nonce', type: 'uint256' },
    ],
  },
};
