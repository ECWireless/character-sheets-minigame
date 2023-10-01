import { useComponentValue } from "@latticexyz/react";

import { GameMap } from "./GameMap";
import { useMUD } from "./MUDContext";
import warrior from "./assets/warrior.svg";
import { useKeyboardMovement } from "./utils/useKeyboardMovement";

export const GameBoard = () => {
  useKeyboardMovement();

  const {
    components: { Player, Position },
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
          emoji: <img src={warrior} />,
          entity: playerEntity,
        }
      : null;

  return (
    <GameMap
      onTileClick={canSpawn ? spawn : undefined}
      players={player ? [player] : []}
    />
  );
};
