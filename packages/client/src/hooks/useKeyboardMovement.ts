import { useEffect, useState } from "react";
import { useMUD } from "../contexts/MUDContext";
import { getComponentValueStrict } from "@latticexyz/recs";
import { getPlayerEntity } from "../utils/helpers";

export const useKeyboardMovement = (
  playerAddress: string | undefined,
  characterClass: string
) => {
  const {
    components: { Position },
    systemCalls: { attack, moveBy },
  } = useMUD();

  const [actionRunning, setActionRunning] = useState(false);

  useEffect(() => {
    const listener = (e: KeyboardEvent) => {
      if (!playerAddress) return;
      if (e.key === "w") {
        moveBy(playerAddress, 0, -1);
      }
      if (e.key === "s") {
        moveBy(playerAddress, 0, 1);
      }
      if (e.key === "a") {
        moveBy(playerAddress, -1, 0);
      }
      if (e.key === "d") {
        moveBy(playerAddress, 1, 0);
      }

      if (e.key === "ArrowUp") {
        moveBy(playerAddress, 0, -1);
      }
      if (e.key === "ArrowDown") {
        moveBy(playerAddress, 0, 1);
      }
      if (e.key === "ArrowLeft") {
        moveBy(playerAddress, -1, 0);
      }
      if (e.key === "ArrowRight") {
        moveBy(playerAddress, 1, 0);
      }

      if (e.key === "e") {
        if (characterClass !== "warrior") return;
        const playerEntity = getPlayerEntity(playerAddress);
        if (!playerEntity) return;
        setActionRunning(true);
        const playerPosition = getComponentValueStrict(Position, playerEntity);
        const { x, y, previousX } = playerPosition;
        if (x > previousX) {
          attack(playerAddress, x + 1, y);
        } else if (x < previousX) {
          attack(playerAddress, x - 1, y);
        }
      }
    };

    window.addEventListener("keydown", listener);
    return () => window.removeEventListener("keydown", listener);
  }, [attack, characterClass, moveBy, playerAddress, Position]);

  useEffect(() => {
    if (!actionRunning) return;
    setTimeout(() => {
      setActionRunning(false);
    }, 500);
  });

  return { actionRunning };
};
