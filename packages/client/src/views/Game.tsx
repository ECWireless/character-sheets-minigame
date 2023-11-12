import { Button, Flex, Heading, VStack, Spinner } from "@chakra-ui/react";
import { useComponentValue } from "@latticexyz/react";
import { singletonEntity } from "@latticexyz/store-sync/recs";
import { SyncStep } from "@latticexyz/store-sync";
import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useMemo } from "react";

import { ConnectWalletButton } from "../components/ConnectWalletButton";
import { useGamesContext } from "../contexts/GamesContext";
import { GameBoard } from "../components/GameBoard";
import { useMUD } from "../contexts/MUDContext";
import { useAccount } from "wagmi";

export const GameView = () => {
  const { address } = useAccount();
  const { gameId } = useParams();
  const navigate = useNavigate();

  const {
    components: { SyncProgress },
    systemCalls: { logout },
  } = useMUD();
  const { games, loading, setActiveGame } = useGamesContext();

  const syncProgress = useComponentValue(SyncProgress, singletonEntity);

  const activeGame = useMemo(() => {
    if (!games) {
      return null;
    }

    return games.find((game) => game.id === gameId);
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
        <Button colorScheme="blue" onClick={() => navigate("/")}>
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
      <VStack position="absolute" right={4} top={4}>
        <Button
          onClick={() => {
            logout(address ?? "");
            navigate("/");
          }}
        >
          Leave game
        </Button>
        <ConnectWalletButton />
      </VStack>
      <Heading>{activeGame.name}</Heading>
      <GameBoard gameAddress={activeGame.id} />
    </VStack>
  );
};

export default GameView;
