import {
  Box,
  Button,
  Flex,
  Heading,
  HStack,
  Spinner,
  Text,
  useDisclosure,
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
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getAddress, isAddress } from 'viem';
import { useAccount, useWalletClient } from 'wagmi';

import { Alert } from '../components/Alert';
import { ConnectWalletButton } from '../components/ConnectWalletButton';
import { GameBoard } from '../components/GameBoard';
import { RaidPartyModal } from '../components/Modals/RaidPartyModal';
import { RulesModal } from '../components/Modals/RulesModal';
import { GameProvider, useGame } from '../contexts/GameContext';
import { useMUD } from '../contexts/MUDContext';
import { RaidPartyProvider } from '../contexts/RaidPartyContext';
import { getChainIdFromLabel, getSignatureDetails } from '../lib/web3';

export const GameView: React.FC = () => {
  const { gameId, chainLabel } = useParams();
  const navigate = useNavigate();

  const chainId = getChainIdFromLabel(chainLabel as string);

  useEffect(() => {
    if (
      !gameId ||
      typeof gameId !== 'string' ||
      !isAddress(gameId) ||
      !chainId
    ) {
      navigate('/');
    }
  }, [chainId, gameId, navigate]);

  if (!gameId || !chainId) {
    return <></>;
  }

  return (
    <GameProvider chainId={chainId} gameId={gameId.toString()} game={null}>
      <RaidPartyProvider>
        <GameViewInner />
      </RaidPartyProvider>
    </GameProvider>
  );
};

export const GameViewInner: React.FC = () => {
  const { data: walletClient } = useWalletClient();
  const { isConnected } = useAccount();
  const toast = useToast();
  const navigate = useNavigate();

  const { game, loading } = useGame();

  const raidPartyModalControls = useDisclosure();
  const rulesModalControls = useDisclosure();

  const {
    components: { CharacterSheetInfo, SpawnInfo, SyncProgress },
    network: { playerEntity },
    systemCalls: { updateBurnerWallet },
  } = useMUD();

  const [updateCounter, setUpdateCounter] = useState(0);

  const syncProgress = useComponentValue(SyncProgress, singletonEntity);
  const otherLoggedInAccounts = useEntityQuery([
    HasValue(CharacterSheetInfo, {
      gameAddress: game?.id ? getAddress(game.id) : '',
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

      const signatureDetails = getSignatureDetails(walletClient.chain.id);
      const signature = (await walletClient.signTypedData({
        domain: signatureDetails.domain,
        types: signatureDetails.types,
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

  if (loading) {
    return (
      <VStack py={12} spacing={8}>
        <Heading>Loading...</Heading>
        <Spinner size="lg" />
      </VStack>
    );
  }

  if (!game) {
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
    const formattedPercentage = syncProgress.percentage;
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
        {isConnected && (
          <HStack mt={2}>
            <Button onClick={raidPartyModalControls.onOpen}>Raid Party</Button>
            <Button onClick={rulesModalControls.onOpen}>Rules</Button>
          </HStack>
        )}
      </Box>
      <Heading>{game.name}</Heading>
      <GameBoard />
      <RaidPartyModal {...raidPartyModalControls} />
      <RulesModal {...rulesModalControls} />
    </VStack>
  );
};

export default GameView;
