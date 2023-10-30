import { useComponentValue, useEntityQuery } from "@latticexyz/react";
import { Image } from "@chakra-ui/react";
import { hexToArray } from "@latticexyz/utils";
import { singletonEntity } from "@latticexyz/store-sync/recs";
import { Has, HasValue, getComponentValueStrict } from "@latticexyz/recs";

import { GameMap } from "./GameMap";
import { useMUD } from "./MUDContext";
import { useKeyboardMovement } from "./utils/useKeyboardMovement";
import { TerrainType, terrainTypes } from "./terrainTypes";
import { useCharacter } from "./hooks/useCharacter";
import { getCharacterImage } from "./utils/helpers";

export const GameBoard = () => {
  useKeyboardMovement();

  const {
    components: { CharacterSheetInfo, MapConfig, Player, Position },
    network: { playerEntity },
  } = useMUD();

  const csInfo = useComponentValue(CharacterSheetInfo, playerEntity) as {
    playerAddress: string;
    gameAddress: string;
  };

  const { playerAddress, gameAddress } = csInfo ?? {};
  const { character } = useCharacter(playerAddress, gameAddress);

  const players = useEntityQuery([
    HasValue(Player, { value: true }),
    Has(Position),
    Has(CharacterSheetInfo),
  ]).map((entity) => {
    const position = getComponentValueStrict(Position, entity);
    return {
      entity,
      x: position.x,
      y: position.y,
      emoji: (
        <Image
          key={entity}
          height="100%"
          position="absolute"
          transform="scale(1.5)"
          src={getCharacterImage(
            character?.classes[0]?.name ?? "villager",
            position
          )}
          zIndex={1}
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
    const { color, sprite } =
      value in TerrainType
        ? terrainTypes[value as TerrainType]
        : { color: "green.400", sprite: "" };
    return {
      x: index % width,
      y: Math.floor(index / width),
      color,
      sprite,
    };
  });

  return (
    <GameMap
      height={height}
      players={players}
      terrain={terrain}
      width={width}
    />
  );
};
