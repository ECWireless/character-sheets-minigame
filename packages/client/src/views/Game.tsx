import {
  Box,
  Button,
  Heading,
  HStack,
  Image,
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
import { useAccount, useDisconnect, useWalletClient } from 'wagmi';

import loadingImage from '../assets/loading.png';
import { Alert } from '../components/Alert';
import { ConnectWalletButton } from '../components/ConnectWalletButton';
import { GameBoard } from '../components/GameBoard';
import { Leaderboard } from '../components/Leaderboard';
import { BattleInitiationModal } from '../components/Modals/BattleInitiationModal';
import { BattleModal } from '../components/Modals/BattleModal';
import { RaidPartyModal } from '../components/Modals/RaidPartyModal';
import { RulesModal } from '../components/Modals/RulesModal';
import { TradeTableModal } from '../components/Modals/TradeTableModal';
import { TradeOffers } from '../components/TradeOffers';
import { GameProvider, useGame } from '../contexts/GameContext';
import { useMUD } from '../contexts/MUDContext';
import { RaidPartyProvider, useRaidParty } from '../contexts/RaidPartyContext';
import { getChainIdFromLabel, getSignatureDetails } from '../lib/web3';
import { getPlayerEntity } from '../utils/helpers';

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
  const { disconnect } = useDisconnect();
  const { onOpenBattleModal, onOpenRaidPartyModal } = useRaidParty();
  const toast = useToast();
  const navigate = useNavigate();

  const { character, game, loading } = useGame();

  const rulesModalControls = useDisclosure();

  const {
    components: { AccountInfo, BattleInfo, CharacterSheetInfo, SyncProgress },
    network: { playerEntity: burnerPlayerEntity },
    systemCalls: { login, updateBurnerWallet },
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

  const playerEntity = useMemo(() => {
    const address = walletClient?.account.address;
    return getPlayerEntity(address);
  }, [walletClient?.account.address]);

  const onLogin = useCallback(async () => {
    const address = walletClient?.account.address;
    try {
      if (!(address && walletClient)) {
        throw new Error('No address or wallet client');
      }

      if (!game) {
        throw new Error('No game');
      }

      if (!playerEntity) {
        throw new Error('No player entity');
      }

      const currentNonce =
        getComponentValue(AccountInfo, playerEntity)?.nonce ?? BigInt(0);
      const message = {
        playerAddress: address,
        burnerAddress: decodeEntity({ address: 'address' }, burnerPlayerEntity)
          .address,
        nonce: currentNonce + BigInt(1),
      };
      const chainId = walletClient.chain.id;
      const signatureDetails = getSignatureDetails(chainId);
      const signature = (await walletClient.signTypedData({
        domain: signatureDetails.domain,
        types: signatureDetails.types,
        primaryType: 'LoginRequest',
        message,
      })) as `0x${string}`;
      await login(chainId, game.id, address, signature);
    } catch (e) {
      console.error(e);
      toast({
        title: 'Error logging in',
        status: 'error',
        position: 'top',
        duration: 5000,
        isClosable: true,
      });
      disconnect();
    }
  }, [
    AccountInfo,
    burnerPlayerEntity,
    disconnect,
    game,
    login,
    playerEntity,
    toast,
    walletClient,
  ]);

  useEffect(() => {
    if (!game) return;
    if (playerEntity && walletClient && walletClient.account.address) {
      const accountInfo = getComponentValue(AccountInfo, playerEntity);
      if (!accountInfo) {
        onLogin();
      }
    }
  }, [AccountInfo, game, onLogin, playerEntity, walletClient]);

  const needsBurnerAddressUpdate = useMemo(() => {
    if (!walletClient?.account) return false;
    let _needsBurnerAddress = false;
    otherLoggedInAccounts.forEach(entity => {
      const accountInfo = getComponentValueStrict(AccountInfo, entity);

      const currentBurnerAddress = decodeEntity(
        { address: 'address' },
        burnerPlayerEntity,
      ).address;

      if (accountInfo?.burnerAddress !== currentBurnerAddress) {
        _needsBurnerAddress = true;
      }
    });
    return _needsBurnerAddress;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    AccountInfo,
    burnerPlayerEntity,
    otherLoggedInAccounts,
    updateCounter,
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
        getComponentValue(AccountInfo, otherLoggedInAccounts[0])?.nonce ??
        BigInt(0);
      const message = {
        playerAddress: address,
        burnerAddress: decodeEntity({ address: 'address' }, burnerPlayerEntity)
          .address,
        nonce: currentNonce + BigInt(1),
      };

      const signatureDetails = getSignatureDetails(walletClient.chain.id);
      const signature = (await walletClient.signTypedData({
        domain: signatureDetails.domain,
        types: signatureDetails.types,
        primaryType: 'LoginRequest',
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
    AccountInfo,
    burnerPlayerEntity,
    otherLoggedInAccounts,
    toast,
    updateBurnerWallet,
    walletClient,
  ]);

  const battleActive = useComponentValue(BattleInfo, playerEntity)?.active;

  useEffect(() => {
    if (battleActive && character) {
      onOpenBattleModal(character);
    }
  }, [battleActive, character, onOpenBattleModal]);

  if (loading) {
    return (
      <VStack pos="relative" spacing={8}>
        <Image alt="loading" h="100vh" src={loadingImage} />
        <Box pos="absolute" left="50%" top={4} transform="translateX(-50%)">
          <Spinner size="xl" />
        </Box>
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
    return (
      <VStack pos="relative" spacing={8}>
        <Image alt="loading" h="100vh" src={loadingImage} />
        <Text pos="absolute" left="50%" top={4}>
          {syncProgress.message} {Math.round(syncProgress.percentage)}%
        </Text>
      </VStack>
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
            <Button onClick={() => onOpenRaidPartyModal(null)}>
              Raid Party
            </Button>
            <Button onClick={rulesModalControls.onOpen}>Rules</Button>
          </HStack>
        )}
      </Box>
      <Heading>{game.name}</Heading>
      {isConnected && <TradeOffers />}
      <GameBoard />
      <Leaderboard />
      <RaidPartyModal />
      <TradeTableModal />
      <BattleInitiationModal />
      <BattleModal />
      <RulesModal {...rulesModalControls} />
    </VStack>
  );
};

export default GameView;
