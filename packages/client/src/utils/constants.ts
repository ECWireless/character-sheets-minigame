export const ENVIRONMENT = (import.meta.env.VITE_ENVIRONMENT || 'dev') as
  | 'main'
  | 'dev';

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
