import { Button, Flex, Heading, VStack } from "@chakra-ui/react";
import { useComponentValue } from "@latticexyz/react";
import { singletonEntity } from "@latticexyz/store-sync/recs";
import { SyncStep } from "@latticexyz/store-sync";
import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useMemo } from "react";

import { useGamesContext } from "../contexts/GamesContext";
import { GameBoard } from "../GameBoard";
import { useMUD } from "../MUDContext";

export const GameView = () => {
  const { gameId } = useParams();
  const navigate = useNavigate();

  const {
    components: { Player, SyncProgress },
    network: { playerEntity },
    systemCalls: { logout },
  } = useMUD();
  const { games, setActiveGame } = useGamesContext();

  const playerExists = useComponentValue(Player, playerEntity)?.value === true;
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
            logout();
            navigate("/");
          }}
        >
          Leave game
        </Button>
        {playerExists && (
          <Button onClick={logout} variant="solid" w="100%">
            Logout
          </Button>
        )}
      </VStack>
      <Heading>{activeGame.name}</Heading>
      <GameBoard />
    </VStack>
  );
};

export default GameView;
