import { Box } from "@chakra-ui/react";
import { Entity } from "@latticexyz/recs";

import { useMUD } from "./MUDContext";

type GameMapProps = {
  height: number;
  onTileClick?: (x: number, y: number) => void;
  players?: {
    x: number;
    y: number;
    emoji: JSX.Element;
    entity: Entity;
  }[];
  terrain?: {
    x: number;
    y: number;
    color: string;
    emoji: string;
  }[];
  width: number;
};

export const GameMap = ({
  height,
  onTileClick,
  players,
  terrain,
  width,
}: GameMapProps) => {
  const {
    network: { playerEntity },
  } = useMUD();

  const rows = new Array(width).fill(0).map((_, i) => i);
  const columns = new Array(height).fill(0).map((_, i) => i);

  const playerExists = !!(playerEntity && players?.length);

  return (
    <Box
      bg="green.400"
      display="inline-grid"
      gridTemplateColumns={`repeat(${width}, 1fr)`}
      gridTemplateRows={`repeat(${height}, 1fr)`}
      overflow="hidden"
    >
      {rows.map((y) =>
        columns.map((x) => {
          const { color: terrainColor, emoji: terrainEmoji } =
            terrain?.find((t) => t.x === x && t.y === y) || {};
          const playersHere = players?.filter((p) => p.x === x && p.y === y);

          return (
            <Box
              background={terrainColor}
              key={`${x},${y}`}
              gridColumn={x + 1}
              gridRow={y + 1}
              h={9}
              onClick={() => onTileClick?.(x, y)}
              position="relative"
              w={9}
              _hover={
                !playerExists
                  ? {
                      bg: "green.500",
                      border: "2px solid",
                      borderColor: "green.600",
                      cursor: "pointer",
                    }
                  : {}
              }
              _active={
                !playerExists
                  ? {
                      bg: "green.600",
                    }
                  : {}
              }
            >
              <Box
                display="flex"
                justifyContent="center"
                transform="scale(1.75)"
              >
                {terrainEmoji}
              </Box>
              {playersHere?.map((p) => p.emoji)}
            </Box>
          );
        })
      )}
    </Box>
  );
};
