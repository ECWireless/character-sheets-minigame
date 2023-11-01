import { Box, Image, useToast } from "@chakra-ui/react";
import { useCallback } from "react";
import { useAccount } from "wagmi";
import { useComponentValue } from "@latticexyz/react";
import { Entity } from "@latticexyz/recs";

import { useMUD } from "../contexts/MUDContext";
import { useGamesContext } from "../contexts/GamesContext";

type GameMapProps = {
  height: number;
  molochSoldiers?: {
    x: number;
    y: number;
    sprite: JSX.Element;
    entity: Entity;
  }[];
  players?: {
    x: number;
    y: number;
    sprite: JSX.Element;
    entity: Entity;
  }[];
  terrain?: {
    x: number;
    y: number;
    color: string;
    sprite: string;
  }[];
  width: number;
};

export const GameMap = ({
  height,
  molochSoldiers,
  players,
  terrain,
  width,
}: GameMapProps) => {
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
      display="inline-grid"
      gridTemplateColumns={`repeat(${width}, 1fr)`}
      gridTemplateRows={`repeat(${height}, 1fr)`}
    >
      {rows.map((y) =>
        columns.map((x) => {
          const { color: terrainColor, sprite } =
            terrain?.find((t) => t.x === x && t.y === y) || {};
          const playersHere = players?.filter((p) => p.x === x && p.y === y);
          const molochsHere = molochSoldiers?.filter(
            (m) => m.x === x && m.y === y
          );

          return (
            <Box
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
                background={terrainColor}
                h="100%"
                position="absolute"
                w="100%"
                zIndex={0}
              />
              <Image position="absolute" src={sprite} />
              {playersHere?.map((p) => p.sprite)}
              {molochsHere?.map((m) => m.sprite)}
            </Box>
          );
        })
      )}
    </Box>
  );
};
