import { Entity } from '@latticexyz/recs';
import { encodeEntity } from '@latticexyz/store-sync/recs';

import archerAttackLeft from '../assets/archer/archer_attack_left.gif';
import archerAttackRight from '../assets/archer/archer_attack_right.gif';
import archerLeft from '../assets/archer/archer_walk_left.gif';
import archerRight from '../assets/archer/archer_walk_right.gif';
import clericAttackLeft from '../assets/cleric/cleric_attack_left.gif';
import clericAttackRight from '../assets/cleric/cleric_attack_right.gif';
import clericLeft from '../assets/cleric/cleric_walk_left.gif';
import clericRight from '../assets/cleric/cleric_walk_right.gif';
import healerAttackLeft from '../assets/healer/healer_attack_left.gif';
import healerAttackRight from '../assets/healer/healer_attack_right.gif';
import healerLeft from '../assets/healer/healer_walk_left.gif';
import healerRight from '../assets/healer/healer_walk_right.gif';
import hunterAttackLeft from '../assets/hunter/hunter_attack_left.gif';
import hunterAttackRight from '../assets/hunter/hunter_attack_right.gif';
import hunterLeft from '../assets/hunter/hunter_walk_left.gif';
import hunterRight from '../assets/hunter/hunter_walk_right.gif';
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
import rogueAttackLeft from '../assets/rogue/rogue_attack_left.gif';
import rogueAttackRight from '../assets/rogue/rogue_attack_right.gif';
import rogueLeft from '../assets/rogue/rogue_walk_left.gif';
import rogueRight from '../assets/rogue/rogue_walk_right.gif';
import scribeAttackLeft from '../assets/scribe/scribe_attack_left.gif';
import scribeAttackRight from '../assets/scribe/scribe_attack_right.gif';
import scribeLeft from '../assets/scribe/scribe_walk_left.gif';
import scribeRight from '../assets/scribe/scribe_walk_right.gif';
import sorcererAttackLeft from '../assets/sorcerer/sorcerer_attack_left.gif';
import sorcererAttackRight from '../assets/sorcerer/sorcerer_attack_right.gif';
import sorcererLeft from '../assets/sorcerer/sorcerer_walk_left.gif';
import sorcererRight from '../assets/sorcerer/sorcerer_walk_right.gif';
import tavernAttackLeft from '../assets/tavern/tavern_attack_left.gif';
import tavernAttackRight from '../assets/tavern/tavern_attack_right.gif';
import tavernLeft from '../assets/tavern/tavern_walk_left.gif';
import tavernRight from '../assets/tavern/tavern_walk_right.gif';
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
} from '../graphql/autogen/types';
import { decodeCraftRequirements, decodeRequirementNode } from './requirements';
import {
  Character,
  Class,
  EquippedItem,
  Game,
  GameMeta,
  HeldClass,
  Item,
  Metadata,
} from './types';

const IPFS_GATEWAYS = [
  'https://charactersheets.mypinata.cloud',
  'https://cloudflare-ipfs.com',
  'https://ipfs.io',
];

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

export const formatFullCharacter = async (
  character: CharacterInfoFragment,
): Promise<Character> => {
  const metadata = await fetchMetadata(character.uri);

  const heldClasses = await Promise.all(
    character.heldClasses.map(async c => {
      const info = await formatClass(c.classEntity);
      return {
        ...info,
        experience: BigInt(c.experience).toString(),
        level: BigInt(c.level).toString(),
      };
    }),
  );

  const heldItems = await Promise.all(
    character.heldItems.map(async i => {
      const info = await formatItem(i.item);
      return {
        ...info,
        amount: BigInt(i.amount).toString(),
      };
    }),
  );

  const equippedItems: EquippedItem[] = [];
  character.equippedItems.map(e => {
    const info = heldItems.find(i => i.itemId === e.item.itemId);
    if (!info) return null;
    equippedItems.push({
      ...info,
      amount: BigInt(e.heldItem.amount).toString(),
      equippedAt: Number(e.equippedAt) * 1000,
    });
    return null;
  });

  return {
    id: character.id,
    chainId: Number(character.game.chainId),
    gameId: character.game.id,
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
    heldClasses,
    heldItems,
    equippedItems,
    equippable_layer: null,
  };
};

export const formatCharacter = async (
  character: CharacterInfoFragment,
  classes: Class[],
  items: Item[],
): Promise<Character> => {
  const metadata = await fetchMetadata(character.uri);

  const heldClasses = classes
    .map(c => {
      const held = character.heldClasses.find(
        h => h.classEntity.classId === c.classId,
      );
      if (!held) return null;
      return {
        ...c,
        experience: BigInt(held.experience).toString(),
        level: BigInt(held.level).toString(),
      };
    })
    .filter(c => c !== null) as HeldClass[];

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
    chainId: Number(character.game.chainId),
    gameId: character.game.id,
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
    heldClasses,
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

export const formatItem = async (item: ItemInfoFragment): Promise<Item> => {
  const metadata = await fetchMetadata(item.uri);

  const decodedCraftRequirements = decodeCraftRequirements(
    item.craftRequirementsBytes,
  );

  const decodedRequirementNode = decodeRequirementNode(
    item.claimRequirementsBytes,
  );

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
    holders: item.holders.map(h => h.character),
    equippers: item.equippers.map(e => e.character),
    merkleRoot: item.merkleRoot,
    distribution: item.distribution,
    craftable: item.craftable,
    craftRequirements: decodedCraftRequirements,
    claimRequirements: decodedRequirementNode,
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

export const generateRandomNumber = (min: number, max: number): number => {
  return Math.floor(Math.random() * (max - min + 1) + min);
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

    case 'tavern keeper':
      if (actionRunning) {
        return direction === 'right' ? tavernAttackRight : tavernAttackLeft;
      }

      switch (direction) {
        case 'up':
          return tavernRight;
        case 'down':
          return tavernLeft;
        case 'left':
          return tavernLeft;
        case 'right':
          return tavernRight;
        default:
          return tavernRight;
      }

    case 'scribe':
      if (actionRunning) {
        return direction === 'right' ? scribeAttackRight : scribeAttackLeft;
      }

      switch (direction) {
        case 'up':
          return scribeRight;
        case 'down':
          return scribeLeft;
        case 'left':
          return scribeLeft;
        case 'right':
          return scribeRight;
        default:
          return scribeRight;
      }

    case 'hunter':
      if (actionRunning) {
        return direction === 'right' ? hunterAttackRight : hunterAttackLeft;
      }

      switch (direction) {
        case 'up':
          return hunterRight;
        case 'down':
          return hunterLeft;
        case 'left':
          return hunterLeft;
        case 'right':
          return hunterRight;
        default:
          return hunterRight;
      }

    case 'cleric':
      if (actionRunning) {
        return direction === 'right' ? clericAttackRight : clericAttackLeft;
      }

      switch (direction) {
        case 'up':
          return clericRight;
        case 'down':
          return clericLeft;
        case 'left':
          return clericLeft;
        case 'right':
          return clericRight;
        default:
          return clericRight;
      }

    case 'rogue':
      if (actionRunning) {
        return direction === 'right' ? rogueAttackRight : rogueAttackLeft;
      }

      switch (direction) {
        case 'up':
          return rogueRight;
        case 'down':
          return rogueLeft;
        case 'left':
          return rogueLeft;
        case 'right':
          return rogueRight;
        default:
          return rogueRight;
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

    case 'healer':
      if (actionRunning) {
        return direction === 'right' ? healerAttackRight : healerAttackLeft;
      }

      switch (direction) {
        case 'up':
          return healerRight;
        case 'down':
          return healerLeft;
        case 'left':
          return healerLeft;
        case 'right':
          return healerRight;
        default:
          return healerRight;
      }

    case 'sorcerer':
      if (actionRunning) {
        return direction === 'right' ? sorcererAttackRight : sorcererAttackLeft;
      }

      switch (direction) {
        case 'up':
          return sorcererRight;
        case 'down':
          return sorcererLeft;
        case 'left':
          return sorcererLeft;
        case 'right':
          return sorcererRight;
        default:
          return sorcererRight;
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
