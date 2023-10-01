import { Flex } from "@chakra-ui/react";
import { useComponentValue } from "@latticexyz/react";
import { singletonEntity } from "@latticexyz/store-sync/recs";
import { SyncStep } from "@latticexyz/store-sync";

import { GameBoard } from "./GameBoard";
import { useMUD } from "./MUDContext";

export const App = () => {
  const {
    components: { SyncProgress },
  } = useMUD();

  const syncProgress = useComponentValue(SyncProgress, singletonEntity);

  if (!syncProgress) {
    return null;
  }

  if (syncProgress.step !== SyncStep.LIVE) {
    return (
      <Flex alignItems="center" h="100vh" justifyContent="center">
        {syncProgress.message} {syncProgress.percentage}%
      </Flex>
    );
  }

  return (
    <Flex alignItems="center" bg="black" h="100vh" justifyContent="center">
      <GameBoard />
    </Flex>
  );
};
