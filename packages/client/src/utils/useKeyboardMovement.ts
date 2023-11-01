import { useEffect, useState } from "react";
import { useMUD } from "../contexts/MUDContext";
import { getComponentValueStrict } from "@latticexyz/recs";

export const useKeyboardMovement = (characterClass: string) => {
  const {
    components: { Position },
    systemCalls: { attack, moveBy },
    network: { playerEntity },
  } = useMUD();

  const [actionRunning, setActionRunning] = useState(false);

  useEffect(() => {
    const listener = (e: KeyboardEvent) => {
      if (e.key === "w") {
        moveBy(0, -1);
      }
      if (e.key === "s") {
        moveBy(0, 1);
      }
      if (e.key === "a") {
        moveBy(-1, 0);
      }
      if (e.key === "d") {
        moveBy(1, 0);
      }

      if (e.key === "ArrowUp") {
        moveBy(0, -1);
      }
      if (e.key === "ArrowDown") {
        moveBy(0, 1);
      }
      if (e.key === "ArrowLeft") {
        moveBy(-1, 0);
      }
      if (e.key === "ArrowRight") {
        moveBy(1, 0);
      }

      if (e.key === "e") {
        if (characterClass !== "warrior") return;
        setActionRunning(true);
        const playerPosition = getComponentValueStrict(Position, playerEntity);
        const { x, y, previousX } = playerPosition;
        if (x > previousX) {
          attack(x + 1, y);
        } else if (x < previousX) {
          attack(x - 1, y);
        }
      }
    };

    window.addEventListener("keydown", listener);
    return () => window.removeEventListener("keydown", listener);
  }, [attack, characterClass, moveBy, playerEntity, Position]);

  useEffect(() => {
    if (!actionRunning) return;
    setTimeout(() => {
      setActionRunning(false);
    }, 500);
  });

  return { actionRunning };
};
