import { Box, Image, Spinner, useToast } from '@chakra-ui/react';
import { useComponentValue } from '@latticexyz/react';
import { Entity, getComponentValue } from '@latticexyz/recs';
import { decodeEntity } from '@latticexyz/store-sync/recs';
import { useCallback, useMemo, useState } from 'react';
import { useAccount, useWalletClient } from 'wagmi';

import grass1 from '../assets/map/grass1.svg';
import { useGame } from '../contexts/GameContext';
import { useMUD } from '../contexts/MUDContext';
import { getSignatureDetails } from '../lib/web3';
import { getPlayerEntity } from '../utils/helpers';

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
    name: string;
    sprite: string;
    spriteSelections: string[];
  }[];
  width: number;
};

export const GameMap = ({
  height,
  molochSoldiers,
  players,
  terrain,
  width,
}: GameMapProps): JSX.Element => {
  const { address } = useAccount();
  const { data: walletClient } = useWalletClient();
  const {
    components: { Player, SpawnInfo },
    network: { playerEntity: burnerPlayerEntity },
    systemCalls: { spawn },
  } = useMUD();
  const { game } = useGame();
  const toast = useToast();

  const [isSpawning, setIsSpawning] = useState<{ x: number; y: number } | null>(
    null,
  );

  const playerEntity = useMemo(() => {
    return getPlayerEntity(address);
  }, [address]);

  const playerExists = useComponentValue(Player, playerEntity)?.value === true;

  const rows = useMemo(
    () => new Array(width).fill(0).map((_, i) => i),
    [width],
  );
  const columns = useMemo(
    () => new Array(height).fill(0).map((_, i) => i),
    [height],
  );

  const gamePlayers = useMemo(() => {
    const characters = game?.characters.map(c => c) ?? [];
    return characters.map(c => c.player.toLowerCase());
  }, [game]);

  const onTileClick = useCallback(
    async (x: number, y: number, gameAddress: string) => {
      if (!(address && walletClient)) {
        toast({
          title: 'Login to play',
          status: 'warning',
          position: 'top',
          duration: 5000,
          isClosable: true,
        });
      } else if (!gamePlayers.includes(address.toLowerCase())) {
        toast({
          title: "You aren't a part of this game!",
          status: 'warning',
          position: 'top',
          duration: 5000,
          isClosable: true,
        });
      } else if (!playerExists) {
        if (!playerEntity) return;
        setIsSpawning({ x, y });

        try {
          const currentNonce =
            getComponentValue(SpawnInfo, playerEntity)?.nonce ?? BigInt(0);
          const message = {
            playerAddress: address,
            burnerAddress: decodeEntity(
              { address: 'address' },
              burnerPlayerEntity,
            ).address,
            nonce: currentNonce + BigInt(1),
          };
          const chainId = walletClient.chain.id;
          const signatureDetails = getSignatureDetails(chainId);
          const signature = (await walletClient.signTypedData({
            domain: signatureDetails.domain,
            types: signatureDetails.types,
            primaryType: 'SpawnRequest',
            message,
          })) as `0x${string}`;
          await spawn(chainId, gameAddress, address, x, y, signature);
        } catch (e) {
          console.error(e);
          toast({
            title: 'Error spawning player',
            status: 'error',
            position: 'top',
            duration: 5000,
            isClosable: true,
          });
        } finally {
          setIsSpawning(null);
        }
      }
    },
    [
      address,
      burnerPlayerEntity,
      gamePlayers,
      playerEntity,
      playerExists,
      spawn,
      SpawnInfo,
      toast,
      walletClient,
    ],
  );

  const entityLayers = useMemo(() => {
    return rows.map(y =>
      columns.map(x => {
        const { name, sprite, spriteSelections } = terrain?.find(
          t => t.x === x && t.y === y,
        ) || { name: 'grass', sprite: grass1, spriteSelections: [] };
        let terrainSprite = sprite;
        if (name === 'water') {
          const waterLeft = terrain?.find(
            t => t.x === x - 1 && t.y === y && t.name === 'water',
          );
          const waterAbove = terrain?.find(
            t => t.x === x && t.y === y - 1 && t.name === 'water',
          );
          const waterRight = terrain?.find(
            t => t.x === x + 1 && t.y === y && t.name === 'water',
          );
          const waterBelow = terrain?.find(
            t => t.x === x && t.y === y + 1 && t.name === 'water',
          );

          if (waterAbove || waterBelow) {
            terrainSprite = spriteSelections[0] ?? sprite;
          }
          if (waterLeft && waterAbove) {
            terrainSprite = spriteSelections[1] ?? sprite;
          }
          if (waterRight && waterAbove) {
            terrainSprite = spriteSelections[2] ?? sprite;
          }
          if (waterRight && waterBelow) {
            terrainSprite = spriteSelections[3] ?? sprite;
          }
          if (waterLeft && waterBelow) {
            terrainSprite = spriteSelections[4] ?? sprite;
          }
        }

        const playersHere = players?.filter(p => p.x === x && p.y === y);
        const molochsHere = molochSoldiers?.filter(m => m.x === x && m.y === y);

        return (
          <Box
            background={'rgba(0,0,0,0.3)'}
            key={`${x},${y}`}
            gridColumn={x + 1}
            gridRow={y + 1}
            onClick={() => (game ? onTileClick?.(x, y, game.id) : undefined)}
            position="relative"
            _hover={
              !playerExists
                ? {
                    bg: 'green.500',
                    border: '2px solid',
                    borderColor: 'green.600',
                    cursor: 'pointer',
                  }
                : {}
            }
            _active={
              !playerExists
                ? {
                    bg: 'green.600',
                  }
                : {}
            }
          >
            {isSpawning && isSpawning.x === x && isSpawning.y === y && (
              <Spinner h="100%" w="100%" />
            )}
            {playersHere?.map(p => p.sprite)}
            {name !== 'grass' && (
              <Image alt={name} position="absolute" src={terrainSprite} />
            )}
            {molochsHere?.map(m => m.sprite)}
          </Box>
        );
      }),
    );
  }, [
    columns,
    game,
    isSpawning,
    molochSoldiers,
    onTileClick,
    playerExists,
    players,
    rows,
    terrain,
  ]);

  return (
    <Box backgroundImage={grass1} w={width * 36} h={height * 36}>
      <Box
        display="inline-grid"
        gridTemplateColumns={`repeat(${width}, 36px)`}
        gridTemplateRows={`repeat(${height}, 36px)`}
      >
        {entityLayers}
      </Box>
    </Box>
  );
};
