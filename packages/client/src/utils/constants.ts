export const ENVIRONMENT = (import.meta.env.VITE_ENVIRONMENT || 'dev') as
  | 'main'
  | 'dev';

export const RAIDGUILD_GAME_ADDRESS = String(
  import.meta.env.VITE_RAIDGUILD_GAME_ADDRESS,
).toLowerCase();

export const CLASS_STATS: { [key: number]: { [key: string]: number } } = {
  // Warrior
  0: {
    attack: 15,
    defense: 9,
    specialAttack: 3,
    specialDefense: 3,
  },
  // Wizard
  1: {
    attack: 3,
    defense: 3,
    specialAttack: 15,
    specialDefense: 9,
  },
  // Tavern Keeper
  2: {
    attack: 12,
    defense: 12,
    specialAttack: 3,
    specialDefense: 3,
  },
  // Scribe
  3: {
    attack: 6,
    defense: 6,
    specialAttack: 9,
    specialDefense: 9,
  },
  // Rogue
  4: {
    attack: 12,
    defense: 3,
    specialAttack: 9,
    specialDefense: 6,
  },
  // Paladin
  5: {
    attack: 15,
    defense: 12,
    specialAttack: 3,
    specialDefense: 0,
  },
  // Monk
  6: {
    attack: 6,
    defense: 6,
    specialAttack: 9,
    specialDefense: 9,
  },
  // Hunter
  7: {
    attack: 9,
    defense: 3,
    specialAttack: 9,
    specialDefense: 3,
  },
  // Healer
  8: {
    attack: 3,
    defense: 3,
    specialAttack: 9,
    specialDefense: 15,
  },
  // Dwarf
  9: {
    attack: 12,
    defense: 12,
    specialAttack: 3,
    specialDefense: 3,
  },
  // Cleric
  10: {
    attack: 9,
    defense: 6,
    specialAttack: 6,
    specialDefense: 9,
  },
  // Archer
  11: {
    attack: 12,
    defense: 3,
    specialAttack: 3,
    specialDefense: 6,
  },
};

export const WEARABLE_STATS: { [key: string]: { [key: string]: number } } = {
  // Archer Clothing
  0: {
    attack: 9,
    defense: 0,
    specialAttack: 3,
    specialDefense: 0,
  },
  // Warrior Clothing
  2: {
    attack: 6,
    defense: 6,
    specialAttack: 0,
    specialDefense: 0,
  },
  // Wizard Clothing
  3: {
    attack: 0,
    defense: 0,
    specialAttack: 6,
    specialDefense: 6,
  },
  // Monk Clothing
  5: {
    attack: 0,
    defense: 0,
    specialAttack: 6,
    specialDefense: 6,
  },
};

export enum POWER_TYPE {
  ATTACK = 'attack',
  SPECIAL_ATTACK = 'special attack',
}

export const WEAPON_STATS: {
  [key: string]: { [key: string]: number | string };
} = {
  1: {
    name: 'Sword of Undhur',
    power: 30,
    type: POWER_TYPE.ATTACK,
    color: 'red',
  },
  4: {
    name: "Hunter's Dagger",
    power: 10,
    type: POWER_TYPE.ATTACK,
    color: 'red',
  },
  6: {
    name: 'The Ghoul Slayer',
    power: 40,
    type: POWER_TYPE.ATTACK,
    color: 'red',
  },
  7: {
    name: 'Wooden Staff',
    power: 30,
    type: POWER_TYPE.SPECIAL_ATTACK,
    color: 'blue',
  },
};

export const MOLOCH_SOLDIER_STATS = {
  heath: 200,
  attack: 24,
  defense: 18,
  specialAttack: 9,
  specialDefense: 9,
};

export const MOLOCH_SOLDIER_MOVES: {
  [key: string]: { [key: string]: number | string };
} = {
  1: {
    name: 'Fireball',
    power: 30,
    type: POWER_TYPE.SPECIAL_ATTACK,
    color: 'blue',
  },
  2: {
    name: 'Stomp',
    power: 21,
    type: POWER_TYPE.ATTACK,
    color: 'red',
  },
  3: {
    name: 'Bite',
    power: 24,
    type: POWER_TYPE.ATTACK,
    color: 'red',
  },
  4: {
    name: 'Coordination Failure',
    power: 42,
    type: POWER_TYPE.SPECIAL_ATTACK,
    color: 'blue',
  },
};

export const DEFAULT_CHARACTER_HEALTH = 100;
export const DEFAULT_MOLOCH_HEALTH = 200;
