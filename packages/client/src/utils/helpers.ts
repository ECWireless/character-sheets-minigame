import { Entity } from '@latticexyz/recs';
import { encodeEntity } from '@latticexyz/store-sync/recs';

import archerAttackLeft from '../assets/archer/archer_attack_left.gif';
import archerAttackRight from '../assets/archer/archer_attack_right.gif';
import archerLeft from '../assets/archer/archer_walk_left.gif';
import archerRight from '../assets/archer/archer_walk_right.gif';
import monkAttackLeft from '../assets/monk/monk_attack_left.gif';
import monkAttackRight from '../assets/monk/monk_attack_right.gif';
import monkDown from '../assets/monk/monk_walk_down.gif';
import monkLeft from '../assets/monk/monk_walk_left.gif';
import monkRight from '../assets/monk/monk_walk_right.gif';
import monkUp from '../assets/monk/monk_walk_up.gif';
import paladinAttackLeft from '../assets/paladin/paladin_attack_left.gif';
import paladinAttackRight from '../assets/paladin/paladin_attack_right.gif';
import paladinLeft from '../assets/paladin/paladin_walk_left.gif';
import paladinRight from '../assets/paladin/paladin_walk_right.gif';
import villagerDown from '../assets/villager/villager_down.gif';
import villagerLeft from '../assets/villager/villager_left.gif';
import villagerRight from '../assets/villager/villager_right.gif';
import villagerUp from '../assets/villager/villager_up.gif';
import warriorAttackLeft from '../assets/warrior/warrior_attack_left.gif';
import warriorAttackRight from '../assets/warrior/warrior_attack_right.gif';
import warriorDown from '../assets/warrior/warrior_walk_down.gif';
import warriorLeft from '../assets/warrior/warrior_walk_left.gif';
import warriorRight from '../assets/warrior/warrior_walk_right.gif';
import warriorUp from '../assets/warrior/warrior_walk_up.gif';
import wizardAttackLeft from '../assets/wizard/wizard_attack_left.gif';
import wizardAttackRight from '../assets/wizard/wizard_attack_right.gif';
import wizardDown from '../assets/wizard/wizard_walk_down.gif';
import wizardLeft from '../assets/wizard/wizard_walk_left.gif';
import wizardRight from '../assets/wizard/wizard_walk_right.gif';
import wizardUp from '../assets/wizard/wizard_walk_up.gif';
import {
  CharacterInfoFragment,
  ClassInfoFragment,
  FullGameInfoFragment,
  GameMetaInfoFragment,
  ItemInfoFragment,
  ItemRequirementInfoFragment,
} from '../graphql/autogen/types';
import {
  Character,
  Class,
  EquippedItem,
  Game,
  GameMeta,
  Item,
  ItemRequirement,
  Metadata,
} from './types';

const IPFS_GATEWAYS = ['https://cloudflare-ipfs.com', 'https://ipfs.io'];

/**
 * Given a URI that may be ipfs, ipns, http, https, ar, or data protocol, return the fetch-able http(s) URLs for the same content
 * @param uri to convert to fetch-able http url
 */
export const uriToHttp = (uri: string): string[] => {
  try {
    const protocol = uri.split(':')[0].toLowerCase();
    switch (protocol) {
      case 'data':
        return [uri];
      case 'https':
        return [uri];
      case 'http':
        return ['https' + uri.substring(4), uri];
      case 'ipfs': {
        const hash = uri.match(/^ipfs:(\/\/)?(.*)$/i)?.[2];
        return IPFS_GATEWAYS.map(g => `${g}/ipfs/${hash}`);
      }
      case 'ipns': {
        const name = uri.match(/^ipns:(\/\/)?(.*)$/i)?.[2];
        return IPFS_GATEWAYS.map(g => `${g}/ipns/${name}`);
      }
      case 'ar': {
        const tx = uri.match(/^ar:(\/\/)?(.*)$/i)?.[2];
        return [`https://arweave.net/${tx}`];
      }
      default:
        return [];
    }
  } catch (e) {
    console.error(e);
    return ['', ''];
  }
};

export const shortenAddress = (address: string, chars = 4): string => {
  return `${address.slice(0, chars + 2)}...${address.slice(
    address.length - chars,
  )}`;
};

export const shortenText = (
  text: string | undefined,
  length: number,
): string => {
  if (!text) {
    return '';
  }

  if (text.length <= length) {
    return text;
  }

  return `${text.slice(0, length)}...`;
};

export const timeout = (ms: number): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

const fetchMetadataFromUri = async (uri: string): Promise<Metadata> => {
  const res = await fetch(uri);
  if (!res.ok) throw new Error('Failed to fetch');
  const metadata = await res.json();
  metadata.name = metadata.name || '';
  metadata.description = metadata.description || '';
  metadata.image = metadata.image || '';
  metadata.equippable_layer = metadata.equippable_layer || null;
  metadata.attributes = metadata.attributes || [];
  return metadata;
};

const fetchMetadata = async (ipfsUri: string): Promise<Metadata> => {
  try {
    const uris = uriToHttp(ipfsUri);
    for (const u of uris) {
      try {
        const metadata = await fetchMetadataFromUri(u);
        return metadata;
      } catch (e) {
        console.error('Failed to fetch metadata from', u);
        continue;
      }
    }
  } catch (e) {
    console.error('Failed to fetch metadata from', ipfsUri);
  }
  return {
    name: '',
    description: '',
    image: '',
    equippable_layer: null,
    attributes: [],
  };
};

export const formatCharacter = async (
  character: CharacterInfoFragment,
  classes: Class[],
  items: Item[],
): Promise<Character> => {
  const metadata = await fetchMetadata(character.uri);

  const characterClasses = classes.filter(c =>
    character.heldClasses.find(h => h.classEntity.classId === c.classId),
  );

  const heldItems: Item[] = [];
  const equippedItems: EquippedItem[] = [];

  items.forEach(i => {
    const held = character.heldItems.find(h => h.item.itemId === i.itemId);
    if (!held) return;
    heldItems.push({
      ...i,
      amount: BigInt(held.amount).toString(),
    });
    const equipped = character.equippedItems.find(
      e => e.item.itemId === i.itemId,
    );
    if (!equipped) return;
    equippedItems.push({
      ...i,
      amount: BigInt(equipped.heldItem.amount).toString(),
      equippedAt: Number(equipped.equippedAt) * 1000,
    });
  });

  return {
    id: character.id,
    uri: character.uri,
    name: metadata.name,
    description: metadata.description,
    image: uriToHttp(metadata.image)[0],
    attributes: metadata.attributes,
    experience: character.experience,
    characterId: character.characterId,
    account: character.account,
    player: character.player,
    jailed: character.jailed,
    approved: character.approved,
    removed: character.removed,
    classes: characterClasses,
    heldItems,
    equippedItems,
    equippable_layer: null,
  };
};

export const formatClass = async (
  classEntity: ClassInfoFragment,
): Promise<Class> => {
  const metadata = await fetchMetadata(classEntity.uri);

  return {
    id: classEntity.id,
    uri: classEntity.uri,
    name: metadata.name,
    description: metadata.description,
    image: uriToHttp(metadata.image)[0],
    claimable: classEntity.claimable,
    classId: classEntity.classId,
    holders: classEntity.holders.map(h => h.character),
    equippable_layer: null,
    attributes: metadata.attributes,
  };
};

export const formatItemRequirement = (
  r: ItemRequirementInfoFragment,
): ItemRequirement => {
  return {
    amount: BigInt(r.amount).toString(),
    assetAddress: r.assetAddress,
    assetCategory: r.assetCategory,
    assetId: BigInt(r.assetId).toString(),
  };
};

export const formatItem = async (item: ItemInfoFragment): Promise<Item> => {
  const metadata = await fetchMetadata(item.uri);

  return {
    id: item.id,
    uri: item.uri,
    name: metadata.name,
    description: metadata.description,
    image: uriToHttp(metadata.image)[0],
    equippable_layer: metadata.equippable_layer
      ? uriToHttp(metadata.equippable_layer)[0]
      : null,
    attributes: metadata.attributes,
    itemId: item.itemId,
    soulbound: item.soulbound,
    supply: BigInt(item.supply).toString(),
    totalSupply: BigInt(item.totalSupply).toString(),
    amount: BigInt(0).toString(),
    requirements: item.requirements.map(formatItemRequirement),
    holders: item.holders.map(h => h.character),
    equippers: item.equippers.map(e => e.character),
    merkleRoot: item.merkleRoot,
    distribution: item.distribution,
  };
};

export const formatGameMeta = async (
  game: GameMetaInfoFragment,
): Promise<GameMeta> => {
  const metadata = await fetchMetadata(game.uri);

  return {
    id: game.id,
    startedAt: Number(game.startedAt) * 1000,
    chainId: Number(game.chainId),
    uri: game.uri,
    owner: game.owner.address,
    admins: game.admins.map(a => a.address),
    masters: game.masters.map(m => m.address),
    players: game.characters.map(c => c.player),
    name: metadata.name,
    description: metadata.description,
    image: uriToHttp(metadata.image)[0],
    characters: game.characters,
    classes: game.classes,
    items: game.items,
    experience: game.experience,
    equippable_layer: null,
    attributes: metadata.attributes,
  };
};

export const formatGame = async (game: FullGameInfoFragment): Promise<Game> => {
  const metadata = await fetchMetadata(game.uri);
  const classes = await Promise.all(game.classes.map(formatClass));
  const items = await Promise.all(game.items.map(formatItem));

  return {
    id: game.id,
    startedAt: Number(game.startedAt) * 1000,
    chainId: Number(game.chainId),
    classesAddress: game.classesAddress,
    itemsAddress: game.itemsAddress,
    itemsManager: game.itemsManager,
    experienceAddress: game.experienceAddress,
    characterEligibilityAdaptor: game.characterEligibilityAdaptor,
    hatsAdaptor: game.hatsAdaptor,
    uri: game.uri,
    baseTokenURI: game.baseTokenURI,
    owner: game.owner.address,
    admins: game.admins.map(a => a.address),
    masters: game.masters.map(m => m.address),
    gameMasterHatEligibilityModule:
      game.hatsData.gameMasterHatEligibilityModule,
    name: metadata.name,
    description: metadata.description,
    image: uriToHttp(metadata.image)[0],
    characters: await Promise.all(
      game.characters.map(c => formatCharacter(c, classes, items)),
    ),
    classes,
    items,
    experience: game.experience,
    equippable_layer: null,
    attributes: metadata.attributes,
  };
};

export const getDirection = (position: {
  x: number;
  y: number;
  previousX: number;
  previousY: number;
}): string => {
  const { x, y, previousX, previousY } = position;
  if (x === previousX) {
    return y >= previousY ? 'down' : 'up';
  }
  return x > previousX ? 'right' : 'left';
};

export const getCharacterImage = (
  className: string,
  classDefaultSrc: string,
  position: { x: number; y: number; previousX: number; previousY: number },
  actionRunning: boolean,
): string => {
  const lcName = className.toLowerCase();

  const direction = getDirection(position);

  switch (lcName) {
    case 'warrior':
      if (actionRunning) {
        return direction === 'right' ? warriorAttackRight : warriorAttackLeft;
      }

      switch (direction) {
        case 'up':
          return warriorUp;
        case 'down':
          return warriorDown;
        case 'left':
          return warriorLeft;
        case 'right':
          return warriorRight;
        default:
          return warriorDown;
      }

    case 'wizard':
      if (actionRunning) {
        return direction === 'right' ? wizardAttackRight : wizardAttackLeft;
      }

      switch (direction) {
        case 'up':
          return wizardUp;
        case 'down':
          return wizardDown;
        case 'left':
          return wizardLeft;
        case 'right':
          return wizardRight;
        default:
          return wizardDown;
      }

    case 'monk':
      if (actionRunning) {
        return direction === 'right' ? monkAttackRight : monkAttackLeft;
      }

      switch (direction) {
        case 'up':
          return monkUp;
        case 'down':
          return monkDown;
        case 'left':
          return monkLeft;
        case 'right':
          return monkRight;
        default:
          return monkDown;
      }

    case 'archer':
      if (actionRunning) {
        return direction === 'right' ? archerAttackRight : archerAttackLeft;
      }

      switch (direction) {
        case 'up':
          return archerRight;
        case 'down':
          return archerLeft;
        case 'left':
          return archerLeft;
        case 'right':
          return archerRight;
        default:
          return archerRight;
      }

    case 'paladin':
      if (actionRunning) {
        return direction === 'right' ? paladinAttackRight : paladinAttackLeft;
      }

      switch (direction) {
        case 'up':
          return paladinRight;
        case 'down':
          return paladinLeft;
        case 'left':
          return paladinLeft;
        case 'right':
          return paladinRight;
        default:
          return paladinRight;
      }

    case 'villager':
      switch (direction) {
        case 'up':
          return villagerUp;
        case 'down':
          return villagerDown;
        case 'left':
          return villagerLeft;
        case 'right':
          return villagerRight;
        default:
          return villagerDown;
      }
    default:
      return classDefaultSrc;
  }
};

export const getPlayerEntity = (
  address: string | undefined,
): Entity | undefined => {
  if (!address) return undefined;
  return encodeEntity(
    {
      address: 'address',
    },
    {
      address: address as `0x${string}`,
    },
  );
};
