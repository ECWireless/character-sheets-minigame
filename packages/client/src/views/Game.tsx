import {
  Box,
  Button,
  Flex,
  Heading,
  Spinner,
  Text,
  useToast,
  VStack,
} from '@chakra-ui/react';
import { useComponentValue, useEntityQuery } from '@latticexyz/react';
import {
  getComponentValue,
  getComponentValueStrict,
  HasValue,
} from '@latticexyz/recs';
import { SyncStep } from '@latticexyz/store-sync';
import { decodeEntity, singletonEntity } from '@latticexyz/store-sync/recs';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getAddress } from 'viem';
import { useWalletClient } from 'wagmi';

import { Alert } from '../components/Alert';
import { ConnectWalletButton } from '../components/ConnectWalletButton';
import { GameBoard } from '../components/GameBoard';
import { useGamesContext } from '../contexts/GamesContext';
import { useMUD } from '../contexts/MUDContext';
import { SIGNATURE_DETAILS } from '../utils/constants';

export const GameView: React.FC = () => {
  const { data: walletClient } = useWalletClient();
  const { gameId } = useParams();
  const toast = useToast();
  const navigate = useNavigate();

  const {
    components: { CharacterSheetInfo, SpawnInfo, SyncProgress },
    network: { playerEntity },
    systemCalls: { updateBurnerWallet },
  } = useMUD();
  const { games, loading, setActiveGame } = useGamesContext();

  const [updateCounter, setUpdateCounter] = useState(0);

  const syncProgress = useComponentValue(SyncProgress, singletonEntity);
  const otherLoggedInAccounts = useEntityQuery([
    HasValue(CharacterSheetInfo, {
      gameAddress: gameId ? getAddress(gameId) : '',
      playerAddress: walletClient?.account.address
        ? getAddress(walletClient.account.address)
        : '',
    }),
  ]);

  const needsBurnerAddressUpdate = useMemo(() => {
    if (!walletClient?.account) return false;
    let _needsBurnerAddress = false;
    otherLoggedInAccounts.forEach(entity => {
      const spawnInfo = getComponentValueStrict(SpawnInfo, entity);

      const currentBurnerAddress = decodeEntity(
        { address: 'address' },
        playerEntity,
      ).address;

      if (spawnInfo?.burnerAddress !== currentBurnerAddress) {
        _needsBurnerAddress = true;
      }
    });
    return _needsBurnerAddress;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    otherLoggedInAccounts,
    playerEntity,
    updateCounter,
    SpawnInfo,
    walletClient,
  ]);

  const onUpdateBurnerWallet = useCallback(async () => {
    const address = walletClient?.account.address;
    if (!address) {
      toast({
        title: 'Error spawning player',
        status: 'error',
        position: 'top',
        duration: 5000,
        isClosable: true,
      });
      return;
    }
    try {
      const currentNonce =
        getComponentValue(SpawnInfo, otherLoggedInAccounts[0])?.nonce ??
        BigInt(0);
      const message = {
        playerAddress: address,
        burnerAddress: decodeEntity({ address: 'address' }, playerEntity)
          .address,
        nonce: currentNonce + BigInt(1),
      };

      const signature = (await walletClient.signTypedData({
        domain: SIGNATURE_DETAILS.domain,
        types: SIGNATURE_DETAILS.types,
        primaryType: 'SpawnRequest',
        message,
      })) as `0x${string}`;

      await updateBurnerWallet(address, signature);

      toast({
        title: 'Burner wallet updated',
        status: 'success',
        position: 'top',
        duration: 5000,
        isClosable: true,
      });
      setUpdateCounter(prev => prev + 1);
    } catch (e) {
      console.error(e);
      toast({
        title: 'Error spawning player',
        status: 'error',
        position: 'top',
        duration: 5000,
        isClosable: true,
      });
    }
  }, [
    otherLoggedInAccounts,
    playerEntity,
    SpawnInfo,
    toast,
    updateBurnerWallet,
    walletClient,
  ]);

  const activeGame = useMemo(() => {
    if (!games) {
      return null;
    }

    return games.find(game => game.id === gameId);
  }, [games, gameId]);

  useEffect(() => {
    if (activeGame) {
      setActiveGame(activeGame);
    }
  }, [activeGame, setActiveGame]);

  if (loading) {
    return (
      <VStack py={12} spacing={8}>
        <Heading>Loading...</Heading>
        <Spinner size="lg" />
      </VStack>
    );
  }

  if (!activeGame) {
    return (
      <VStack py={12} spacing={8}>
        <Heading>Game not found</Heading>
        <Button colorScheme="blue" onClick={() => navigate('/')}>
          Go back
        </Button>
      </VStack>
    );
  }

  if (!syncProgress) {
    return null;
  }

  if (syncProgress.step !== SyncStep.LIVE) {
    const formattedPercentage = syncProgress.percentage * 100;
    return (
      <Flex alignItems="center" h="100vh" justifyContent="center">
        {syncProgress.message} {Math.round(formattedPercentage)}%
      </Flex>
    );
  }

  return (
    <VStack py={12} spacing={8}>
      {needsBurnerAddressUpdate && (
        <Alert>
          <Text>You are logged in on a separate device. Click</Text>
          <Button
            onClick={onUpdateBurnerWallet}
            size="xs"
            variant="outline-dark"
          >
            here
          </Button>{' '}
          <Text>to play on this device.</Text>
        </Alert>
      )}
      <Box position="fixed" left={4} top={4}>
        <Button
          onClick={() => {
            navigate('/');
          }}
        >
          All games
        </Button>
      </Box>
      <Box position="fixed" right={4} top={4}>
        <ConnectWalletButton />
      </Box>
      <Heading>{activeGame.name}</Heading>
      <GameBoard gameAddress={activeGame.id} />
    </VStack>
  );
};

export default GameView;
