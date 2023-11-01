import { useComponentValue, useEntityQuery } from "@latticexyz/react";
import { Image } from "@chakra-ui/react";
import { hexToArray } from "@latticexyz/utils";
import { singletonEntity } from "@latticexyz/store-sync/recs";
import { Has, HasValue, getComponentValueStrict } from "@latticexyz/recs";

import { GameMap } from "./GameMap";
import { useMUD } from "../contexts/MUDContext";
import { useKeyboardMovement } from "../utils/useKeyboardMovement";
import { TerrainType, terrainTypes } from "../utils/terrainTypes";
import { useCharacter } from "../hooks/useCharacter";
import { getDirection, getCharacterImage } from "../utils/helpers";
import warriorAction1 from "../assets/warrior/warrior_attack1.gif";
import warriorAction2 from "../assets/warrior/warrior_attack2.gif";
import molochSoldier from "../assets/moloch/moloch_left.gif";
import molochSoldierDead from "../assets/moloch/moloch_dead_left.gif";

export const GameBoard = () => {
  const { actionRunning } = useKeyboardMovement();

  const {
    components: {
      CharacterSheetInfo,
      Health,
      MapConfig,
      MolochSoldier,
      Player,
      Position,
    },
    network: { playerEntity },
  } = useMUD();

  const csInfo = useComponentValue(CharacterSheetInfo, playerEntity) as {
    playerAddress: string;
    gameAddress: string;
  };

  const { playerAddress, gameAddress } = csInfo ?? {};
  const { character } = useCharacter(playerAddress, gameAddress);

  const molochSoldiers = useEntityQuery([
    HasValue(MolochSoldier, { value: true }),
    Has(Position),
  ]).map((entity) => {
    const position = getComponentValueStrict(Position, entity);
    const health = getComponentValueStrict(Health, entity).value ?? 0;

    return {
      entity,
      x: position.x,
      y: position.y,
      sprite: (
        <Image
          key={entity}
          height="100%"
          position="absolute"
          src={health > 0 ? molochSoldier : molochSoldierDead}
          transform="scale(1.5) translateY(-8px)"
          zIndex={1}
        />
      ),
    };
  });

  const players = useEntityQuery([
    HasValue(Player, { value: true }),
    Has(Position),
    Has(CharacterSheetInfo),
  ]).map((entity) => {
    const position = getComponentValueStrict(Position, entity);
    const direction = getDirection(position);
    const characterClass = character?.classes[0]?.name ?? "villager";
    let transform = "scale(1.5)";

    if (
      (direction === "up" || direction === "down") &&
      characterClass === "warrior"
    ) {
      transform = "scale(1.2)";
    }

    if (
      (direction === "right" || direction === "left") &&
      characterClass === "villager"
    ) {
      transform = "scale(1.2)";
    }

    if (actionRunning) {
      transform =
        direction === "left"
          ? "scale(1.7) translate(-5px, -4px)"
          : "scale(1.7) translate(5px, -4px)";
    }

    let src = getCharacterImage(characterClass, position);

    if (actionRunning) {
      src = direction === "right" ? warriorAction1 : warriorAction2;
    }

    return {
      entity,
      x: position.x,
      y: position.y,
      sprite: (
        <Image
          key={entity}
          height="100%"
          position="absolute"
          transform={transform}
          src={src}
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
      molochSoldiers={molochSoldiers}
      players={players}
      terrain={terrain}
      width={width}
    />
  );
};
