export enum TerrainType {
  Tree = 1,
  Boulder,
  Water,
}

type TerrainConfig = {
  color: string;
  emoji: string;
};

export const terrainTypes: Record<TerrainType, TerrainConfig> = {
  [TerrainType.Tree]: {
    color: "green.400",
    emoji: "🌳",
  },
  [TerrainType.Boulder]: {
    color: "green.400",
    emoji: "🪨",
  },
  [TerrainType.Water]: {
    color: "blue.400",
    emoji: "",
  },
};
