export type Metadata = {
  name: string;
  description: string;
  image: string;
};

export type GameMeta = Metadata & {
  id: string;
  uri: string;
  owner: string;
  admins: string[];
  masters: string[];
  players: string[];
  characters: { id: string }[];
  classes: { id: string }[];
  items: { id: string }[];
  experience: string;
};

export type Character = Metadata & {
  id: string;
  name: string;
  characterId: string;
  account: string;
  player: string;
  jailed: boolean;
  experience: string;
  uri: string;
  classes: Class[];
  heldItems: Item[];
  equippedItems: Item[];
};

export type Class = Metadata & {
  id: string;
  classId: string;
  uri: string;
  name: string;
  holders: { id: string }[];
};

export type ItemRequirement = {
  amount: bigint;
  assetId: bigint;
  assetAddress: string;
  assetCategory: string;
};

export type Item = Metadata & {
  id: string;
  itemId: string;
  name: string;
  uri: string;
  soulbound: boolean;
  supply: bigint;
  totalSupply: bigint;
  amount: bigint;
  requirements: ItemRequirement[];
  holders: { id: string }[];
  equippers: { id: string }[];
  merkleRoot: string;
};
