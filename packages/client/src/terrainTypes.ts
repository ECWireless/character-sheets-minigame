import rock1 from "./assets/map/rock1.svg";
import tree1 from "./assets/map/tree.svg";

export enum TerrainType {
  Tree = 1,
  Boulder,
  Water,
}

type TerrainConfig = {
  color: string;
  sprite: string;
};

export const terrainTypes: Record<TerrainType, TerrainConfig> = {
  [TerrainType.Tree]: {
    color: "green.400",
    sprite: tree1,
  },
  [TerrainType.Boulder]: {
    color: "green.400",
    sprite: rock1,
  },
  [TerrainType.Water]: {
    color: "blue.400",
    sprite: "",
  },
};
