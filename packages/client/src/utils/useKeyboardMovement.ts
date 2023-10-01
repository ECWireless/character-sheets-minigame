import { useEffect, useState } from "react";
import { useMUD } from "../MUDContext";

export const useKeyboardMovement = () => {
  const {
    systemCalls: { moveBy },
  } = useMUD();

  const [flipCharacterImage, setFlipCharacterImage] = useState(false);

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
        setFlipCharacterImage(false);
      }
      if (e.key === "d") {
        moveBy(1, 0);
        setFlipCharacterImage(true);
      }

      if (e.key === "ArrowUp") {
        moveBy(0, -1);
      }
      if (e.key === "ArrowDown") {
        moveBy(0, 1);
      }
      if (e.key === "ArrowLeft") {
        moveBy(-1, 0);
        setFlipCharacterImage(false);
      }
      if (e.key === "ArrowRight") {
        moveBy(1, 0);
        setFlipCharacterImage(true);
      }
    };

    window.addEventListener("keydown", listener);
    return () => window.removeEventListener("keydown", listener);
  }, [moveBy]);

  return { flipCharacterImage };
};
