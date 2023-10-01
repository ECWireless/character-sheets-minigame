export enum TerrainType {
  Tree = 1,
  Boulder,
  Water,
}

type TerrainConfig = {
  emoji: string;
};

export const terrainTypes: Record<TerrainType, TerrainConfig> = {
  [TerrainType.Tree]: {
    emoji: "🌳",
  },
  [TerrainType.Boulder]: {
    emoji: "🪨",
  },
  [TerrainType.Water]: {
    emoji: "🌊",
  },
};
