import { useComponentValue, useEntityQuery } from "@latticexyz/react";
import { Image } from "@chakra-ui/react";
import { hexToArray } from "@latticexyz/utils";
import { singletonEntity } from "@latticexyz/store-sync/recs";
import { Has, getComponentValueStrict } from "@latticexyz/recs";

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
  const players = useEntityQuery([Has(Player), Has(Position)]).map((entity) => {
    const position = getComponentValueStrict(Position, entity);
    return {
      entity,
      x: position.x,
      y: position.y,
      emoji: (
        <Image
          src={warrior}
          transform={
            flipCharacterImage && entity === playerEntity
              ? "scaleX(-1)"
              : undefined
          }
        />
      ),
    };
  });

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
      players={players}
      terrain={terrain}
      width={width}
    />
  );
};
