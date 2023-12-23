import rock1 from '../assets/map/rock1.svg';
import tree1 from '../assets/map/tree.svg';
import waterCorner1 from '../assets/map/water/water_corner1.svg';
import waterCorner2 from '../assets/map/water/water_corner2.svg';
import waterCorner3 from '../assets/map/water/water_corner3.svg';
import waterCorner4 from '../assets/map/water/water_corner4.svg';
import waterHorizontal from '../assets/map/water/water_horizontal.svg';
import waterVertical from '../assets/map/water/water_vertical.svg';

export enum TerrainType {
  Tree = 1,
  Boulder,
  Water,
}

type TerrainConfig = {
  name: string;
  color: string;
  sprite: string;
  spriteSelections: string[];
};

export const terrainTypes: Record<TerrainType, TerrainConfig> = {
  [TerrainType.Tree]: {
    name: 'tree',
    color: 'green.400',
    sprite: tree1,
    spriteSelections: [],
  },
  [TerrainType.Boulder]: {
    name: 'boulder',
    color: 'green.400',
    sprite: rock1,
    spriteSelections: [],
  },
  [TerrainType.Water]: {
    name: 'water',
    color: 'blue.400',
    sprite: waterHorizontal,
    spriteSelections: [
      waterVertical,
      waterCorner1,
      waterCorner2,
      waterCorner3,
      waterCorner4,
    ],
  },
};
