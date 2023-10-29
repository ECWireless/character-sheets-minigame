import {
  CharacterInfoFragment,
  ClassInfoFragment,
  GameMetaInfoFragment,
  ItemInfoFragment,
  ItemRequirementInfoFragment,
} from "../graphql/autogen/types";

import {
  Character,
  Class,
  GameMeta,
  Item,
  ItemRequirement,
  Metadata,
} from "./types";
import warriorRight1 from "./assets/warrior/right1.svg";
import warriorLeft1 from "./assets/warrior/left1.svg";
import warriorUp1 from "./assets/warrior/up1.svg";
import warriorDown1 from "./assets/warrior/down1.svg";
import wizard from "./assets/wizard.svg";
import scribe from "./assets/scribe.svg";
import villager from "./assets/villager.png";

/**
 * Given a URI that may be ipfs, ipns, http, https, ar, or data protocol, return the fetch-able http(s) URLs for the same content
 * @param uri to convert to fetch-able http url
 */
export const uriToHttp = (uri: string): string[] => {
  try {
    const protocol = uri.split(":")[0].toLowerCase();
    switch (protocol) {
      case "data":
        return [uri];
      case "https":
        return [uri];
      case "http":
        return ["https" + uri.substring(4), uri];
      case "ipfs": {
        const hash = uri.match(/^ipfs:(\/\/)?(.*)$/i)?.[2];
        return [
          `https://ipfs.io/ipfs/${hash}/`,
          `https://cloudflare-ipfs.com/ipfs/${hash}/`,
        ];
      }
      case "ipns": {
        const name = uri.match(/^ipns:(\/\/)?(.*)$/i)?.[2];
        return [
          `https://ipfs.io/ipns/${name}/`,
          `https://cloudflare-ipfs.com/ipns/${name}/`,
        ];
      }
      case "ar": {
        const tx = uri.match(/^ar:(\/\/)?(.*)$/i)?.[2];
        return [`https://arweave.net/${tx}`];
      }
      default:
        return [];
    }
  } catch (e) {
    console.error(e);
    return ["", ""];
  }
};

export const shortenAddress = (address: string, chars = 4): string => {
  return `${address.slice(0, chars + 2)}...${address.slice(
    address.length - chars
  )}`;
};

export const shortenText = (text: string, length: number): string => {
  if (text.length <= length) {
    return text;
  }

  return `${text.slice(0, length)}...`;
};

export const timeout = (ms: number): Promise<void> => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

export const fetchMetadata = async (uri: string): Promise<Metadata> => {
  const res = await fetch(`${uri}`);
  return await res.json();
};

export const formatGameMeta = async (
  game: GameMetaInfoFragment
): Promise<GameMeta> => {
  const metadata = await fetchMetadata(uriToHttp(game.uri)[0]);

  return {
    id: game.id,
    uri: game.uri,
    owners: game.owners,
    masters: game.masters,
    players: game.characters.map((c) => c.player),
    name: metadata.name,
    description: metadata.description,
    image: uriToHttp(metadata.image)[0],
    characters: game.characters,
    classes: game.classes,
    items: game.items,
    experience: game.experience,
  };
};

export const formatCharacter = async (
  character: CharacterInfoFragment
): Promise<Character> => {
  const metadata = await fetchMetadata(uriToHttp(character.uri)[0]);

  const heldClasses = character.heldClasses.map((hc) => hc.classEntity);
  const classes = await Promise.all(heldClasses.map(formatClass));
  const heldItems = character.heldItems.map((hi) => hi.item);
  const items = await Promise.all(heldItems.map(formatItem));
  const equippedItems: Item[] = [];

  items.forEach((i) => {
    const equipped = character.equippedItems.find(
      (e) => e.item.itemId === i.itemId
    );
    if (!equipped) return;
    equippedItems.push({
      ...i,
      amount: BigInt(equipped.heldItem.amount),
    });
  });

  return {
    id: character.id,
    uri: character.uri,
    name: metadata.name,
    description: metadata.description,
    image: uriToHttp(metadata.image)[0],
    experience: character.experience,
    characterId: character.characterId,
    account: character.account,
    player: character.player,
    jailed: character.jailed,
    classes,
    heldItems: items,
    equippedItems,
  };
};

export const formatClass = async (
  classEntity: ClassInfoFragment
): Promise<Class> => {
  const metadata = await fetchMetadata(uriToHttp(classEntity.uri)[0]);

  return {
    id: classEntity.id,
    uri: classEntity.uri,
    name: metadata.name,
    description: metadata.description,
    image: uriToHttp(metadata.image)[0],
    classId: classEntity.classId,
    holders: classEntity.holders,
  };
};

export const formatItemRequirement = (
  r: ItemRequirementInfoFragment
): ItemRequirement => {
  return {
    amount: BigInt(r.amount),
    assetAddress: r.assetAddress,
    assetCategory: r.assetCategory,
    assetId: BigInt(r.assetId),
  };
};

export const formatItem = async (item: ItemInfoFragment): Promise<Item> => {
  const metadata = await fetchMetadata(uriToHttp(item.uri)[0]);

  return {
    id: item.id,
    uri: item.uri,
    name: metadata.name,
    description: metadata.description,
    image: uriToHttp(metadata.image)[0],
    itemId: item.itemId,
    soulbound: item.soulbound,
    supply: BigInt(item.supply),
    totalSupply: BigInt(item.totalSupply),
    amount: BigInt(0),
    requirements: item.requirements.map(formatItemRequirement),
    holders: item.holders,
    equippers: item.equippers,
    merkleRoot: item.merkleRoot,
  };
};

export const getDirection = (
  x: number,
  y: number,
  previousX: number,
  previousY: number
) => {
  if (x === previousX) {
    return y > previousY ? "down" : "up";
  }
  return x > previousX ? "right" : "left";
};

export const getCharacterImage = (
  className: string,
  position: { x: number; y: number; previousX: number; previousY: number }
) => {
  const lcName = className.toLowerCase();

  const direction = getDirection(
    position.x,
    position.y,
    position.previousX,
    position.previousY
  );

  switch (lcName) {
    case "warrior":
      switch (direction) {
        case "up":
          return warriorUp1;
        case "down":
          return warriorDown1;
        case "left":
          return warriorLeft1;
        case "right":
          return warriorRight1;
        default:
          return warriorDown1;
      }
    case "wizard":
      return wizard;
    case "scribe":
      return scribe;
    default:
      return villager;
  }
};
