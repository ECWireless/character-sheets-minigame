export const ENVIRONMENT = (import.meta.env.VITE_ENVIRONMENT || 'dev') as
  | 'main'
  | 'dev';

export const RAIDGUILD_GAME_ADDRESS = String(
  import.meta.env.VITE_RAIDGUILD_GAME_ADDRESS,
).toLowerCase();

export const CLASS_STATS: { [key: number]: { [key: string]: number } } = {
  // Warrior
  0: {
    attack: 5,
    defense: 3,
    specialAttack: 1,
    specialDefense: 1,
  },
  // Wizard
  1: {
    attack: 1,
    defense: 1,
    specialAttack: 5,
    specialDefense: 3,
  },
  // Tavern Keeper
  2: {
    attack: 4,
    defense: 4,
    specialAttack: 1,
    specialDefense: 1,
  },
  // Scribe
  3: {
    attack: 2,
    defense: 2,
    specialAttack: 3,
    specialDefense: 3,
  },
  // Rogue
  4: {
    attack: 4,
    defense: 1,
    specialAttack: 3,
    specialDefense: 2,
  },
  // Paladin
  5: {
    attack: 5,
    defense: 4,
    specialAttack: 1,
    specialDefense: 0,
  },
  // Monk
  6: {
    attack: 2,
    defense: 2,
    specialAttack: 3,
    specialDefense: 3,
  },
  // Hunter
  7: {
    attack: 3,
    defense: 1,
    specialAttack: 3,
    specialDefense: 1,
  },
  // Healer
  8: {
    attack: 1,
    defense: 1,
    specialAttack: 3,
    specialDefense: 5,
  },
  // Dwarf
  9: {
    attack: 4,
    defense: 4,
    specialAttack: 1,
    specialDefense: 1,
  },
  // Cleric
  10: {
    attack: 3,
    defense: 2,
    specialAttack: 2,
    specialDefense: 3,
  },
  // Archer
  11: {
    attack: 4,
    defense: 1,
    specialAttack: 1,
    specialDefense: 2,
  },
};

export const WEARABLE_STATS: { [key: string]: { [key: string]: number } } = {
  // Archer Clothing
  0: {
    attack: 3,
    defense: 0,
    specialAttack: 1,
    specialDefense: 0,
  },
  // Warrior Clothing
  2: {
    attack: 2,
    defense: 2,
    specialAttack: 0,
    specialDefense: 0,
  },
  // Wizard Clothing
  3: {
    attack: 0,
    defense: 0,
    specialAttack: 2,
    specialDefense: 2,
  },
  // Monk Clothing
  5: {
    attack: 0,
    defense: 0,
    specialAttack: 2,
    specialDefense: 2,
  },
};

export enum POWER_TYPE {
  ATTACK = 'attack',
  SPECIAL_ATTACK = 'special attack',
}

export const WEAPON_STATS: {
  [key: string]: { [key: string]: number | string };
} = {
  // Sword of Undhur
  1: {
    power: 3,
    type: POWER_TYPE.ATTACK,
    color: 'red',
  },
  // Hunter's Dagger
  4: {
    power: 1,
    type: POWER_TYPE.ATTACK,
    color: 'red',
  },
  // The Ghoul Slayer
  6: {
    power: 4,
    type: POWER_TYPE.ATTACK,
    color: 'red',
  },
  // Wooden Staff
  7: {
    power: 3,
    type: POWER_TYPE.SPECIAL_ATTACK,
    color: 'blue',
  },
};

export const MOLOCH_SOLDIER_STATS = {
  heath: 20,
  attack: 7,
  defense: 5,
  specialAttack: 8,
  specialDefense: 5,
};
