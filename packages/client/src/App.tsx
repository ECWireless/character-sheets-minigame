import { Flex } from "@chakra-ui/react";
import { GameBoard } from "./GameBoard";

export const App = () => {
  return (
    <Flex alignItems="center" h="100vh" justifyContent="center">
      <GameBoard />
    </Flex>
  );
};
