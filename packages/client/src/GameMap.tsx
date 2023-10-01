import { Box } from "@chakra-ui/react";
import { Entity } from "@latticexyz/recs";

type GameMapProps = {
  onTileClick?: (x: number, y: number) => void;
  players?: {
    x: number;
    y: number;
    emoji: JSX.Element;
    entity: Entity;
  }[];
};

export const GameMap = ({ onTileClick, players }: GameMapProps) => {
  const width = 20;
  const height = 20;

  const rows = new Array(width).fill(0).map((_, i) => i);
  const columns = new Array(height).fill(0).map((_, i) => i);

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
          const playersHere = players?.filter((p) => p.x === x && p.y === y);

          return (
            <Box
              key={`${x},${y}`}
              gridColumn={x + 1}
              gridRow={y + 1}
              h={9}
              onClick={() => onTileClick?.(x, y)}
              w={9}
              _hover={{
                bg: "green.500",
                border: "2px solid",
                borderColor: "green.600",
                cursor: "pointer",
              }}
              _active={{
                bg: "green.600",
              }}
            >
              {playersHere?.map((p) => p.emoji)}
            </Box>
          );
        })
      )}
    </Box>
  );
};
