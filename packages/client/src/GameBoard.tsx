import { useComponentValue } from "@latticexyz/react";
import { Image } from "@chakra-ui/react";
import { hexToArray } from "@latticexyz/utils";
import { singletonEntity } from "@latticexyz/store-sync/recs";

import { GameMap } from "./GameMap";
import { useMUD } from "./MUDContext";
import warrior from "./assets/warrior.svg";
import { useKeyboardMovement } from "./utils/useKeyboardMovement";
import { TerrainType, terrainTypes } from "./terrainTypes";

export const GameBoard = () => {
  const { flipCharacterImage } = useKeyboardMovement();

  const {
    components: { MapConfig, Player, Position },
    network: { playerEntity },
    systemCalls: { spawn },
  } = useMUD();

  const canSpawn = useComponentValue(Player, playerEntity)?.value !== true;
  const playerPosition = useComponentValue(Position, playerEntity);

  const player =
    playerEntity && playerPosition
      ? {
          x: playerPosition.x,
          y: playerPosition.y,
          emoji: (
            <Image
              src={warrior}
              transform={flipCharacterImage ? "scaleX(-1)" : undefined}
            />
          ),
          entity: playerEntity,
        }
      : null;

  const mapConfig = useComponentValue(MapConfig, singletonEntity);
  if (mapConfig == null) {
    throw new Error(
      "map config not set or not ready, only use this hook after loading state === LIVE"
    );
  }

  const { width, height, terrain: terrainData } = mapConfig;
  const terrain = Array.from(hexToArray(terrainData)).map((value, index) => {
    const { color, emoji } =
      value in TerrainType
        ? terrainTypes[value as TerrainType]
        : { color: "green.400", emoji: "" };
    return {
      x: index % width,
      y: Math.floor(index / width),
      color,
      emoji,
    };
  });

  return (
    <GameMap
      height={height}
      onTileClick={canSpawn ? spawn : undefined}
      players={player ? [player] : []}
      terrain={terrain}
      width={width}
    />
  );
};
