import { Box, useToast } from "@chakra-ui/react";
import { useCallback } from "react";
import { useAccount } from "wagmi";
import { useComponentValue } from "@latticexyz/react";
import { Entity } from "@latticexyz/recs";

import { useMUD } from "./MUDContext";
import { useGamesContext } from "./contexts/GamesContext";

type GameMapProps = {
  height: number;
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

export const GameMap = ({ height, players, terrain, width }: GameMapProps) => {
  const { address } = useAccount();
  const {
    components: { Player },
    network: { playerEntity },
    systemCalls: { spawn },
  } = useMUD();
  const { activeGame } = useGamesContext();
  const toast = useToast();

  const playerExists = useComponentValue(Player, playerEntity)?.value === true;
  const canSpawn = useComponentValue(Player, playerEntity)?.value !== true;

  const rows = new Array(width).fill(0).map((_, i) => i);
  const columns = new Array(height).fill(0).map((_, i) => i);

  const onTileClick = useCallback(
    (x: number, y: number, gameAddress: string) => {
      if (!address) {
        toast({
          title: "Login to play",
          status: "warning",
          position: "top",
          duration: 5000,
          isClosable: true,
        });
      } else if (canSpawn) {
        spawn(x, y, gameAddress, address);
      }
    },
    [address, canSpawn, spawn, toast]
  );

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
              onClick={() =>
                activeGame ? onTileClick?.(x, y, activeGame.id) : undefined
              }
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
