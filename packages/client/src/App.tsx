import { Button, Flex } from "@chakra-ui/react";
import { useComponentValue } from "@latticexyz/react";
import { singletonEntity } from "@latticexyz/store-sync/recs";
import { SyncStep } from "@latticexyz/store-sync";

import { GameBoard } from "./GameBoard";
import { useMUD } from "./MUDContext";

export const App = () => {
  const {
    components: { Player, SyncProgress },
    network: { playerEntity },
    systemCalls: { logout },
  } = useMUD();

  const playerExists = useComponentValue(Player, playerEntity)?.value === true;
  const syncProgress = useComponentValue(SyncProgress, singletonEntity);

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
    <Flex alignItems="center" bg="black" h="100vh" justifyContent="center">
      {playerExists && (
        <Button
          colorScheme="red"
          onClick={logout}
          position="absolute"
          right={4}
          top={4}
        >
          Logout
        </Button>
      )}
      <GameBoard />
    </Flex>
  );
};
