import { useComponentValue, useEntityQuery } from "@latticexyz/react";
import { Image } from "@chakra-ui/react";
import { hexToArray } from "@latticexyz/utils";
import { singletonEntity } from "@latticexyz/store-sync/recs";
import { Has, HasValue, getComponentValueStrict } from "@latticexyz/recs";

import { GameMap } from "./GameMap";
import { useMUD } from "../contexts/MUDContext";
import { useKeyboardMovement } from "../hooks/useKeyboardMovement";
import { TerrainType, terrainTypes } from "../utils/terrainTypes";
import { useCharacter, useCharacters } from "../hooks/useCharacter";
import { getDirection, getCharacterImage } from "../utils/helpers";
import molochSoldierLeft from "../assets/moloch/moloch_left.gif";
import molochSoldierRight from "../assets/moloch/moloch_right.gif";
import molochSoldierDeadLeft from "../assets/moloch/moloch_dead_left.gif";
import molochSoldierDeadRight from "../assets/moloch/moloch_dead_right.gif";
import { useAccount } from "wagmi";

export const GameBoard = ({ gameAddress }: { gameAddress: string }) => {
  const {
    components: {
      CharacterSheetInfo,
      Health,
      MapConfig,
      MolochSoldier,
      Player,
      Position,
    },
  } = useMUD();
  const { address } = useAccount();

  const { character } = useCharacter(address?.toLowerCase(), gameAddress);
  const { characters } = useCharacters(gameAddress);

  const { actionRunning } = useKeyboardMovement(
    address?.toLowerCase(),
    character?.classes[0]?.name.toLowerCase() ?? "villager"
  );

  const players = useEntityQuery([
    HasValue(Player, { value: true }),
    Has(Position),
    Has(CharacterSheetInfo),
  ]).map((entity) => {
    const position = getComponentValueStrict(Position, entity);
    const direction = getDirection(position);
    const characterSheetInfo = getComponentValueStrict(
      CharacterSheetInfo,
      entity
    );

    const characterByPlayer = characters?.find(
      (c) => c.player === characterSheetInfo.playerAddress.toLowerCase()
    );
    const characterClass =
      characterByPlayer?.classes[0]?.name.toLowerCase() ?? "villager";

    const src = getCharacterImage(characterClass, position, actionRunning);
    let transform = "scale(1.5)";

    if (actionRunning && characterByPlayer?.id === character?.id) {
      transform =
        direction === "left"
          ? "scale(1.7) translate(-5px, -4px)"
          : "scale(1.7) translate(5px, -4px)";
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

  const molochSoldiers = useEntityQuery([
    HasValue(MolochSoldier, { value: true }),
    Has(Position),
  ]).map((entity) => {
    const position = getComponentValueStrict(Position, entity);
    const health = getComponentValueStrict(Health, entity).value ?? 0;

    const direction = position.x % 2 === 0 ? "left" : "right";
    const molochSoldier =
      direction === "left" ? molochSoldierLeft : molochSoldierRight;
    const molochSoldierDead =
      direction === "left" ? molochSoldierDeadLeft : molochSoldierDeadRight;

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
          zIndex={3}
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
    const { color, name, sprite, spriteSelections } =
      value in TerrainType
        ? terrainTypes[value as TerrainType]
        : {
            color: "green.400",
            name: "grass",
            sprite: "",
            spriteSelections: [],
          };
    return {
      x: index % width,
      y: Math.floor(index / width),
      color,
      name,
      sprite,
      spriteSelections,
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
