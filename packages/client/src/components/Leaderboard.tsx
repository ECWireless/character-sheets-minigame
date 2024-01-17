import { Text, VStack } from '@chakra-ui/react';

export const Leaderboard: React.FC = () => {
  return (
    <VStack
      border="2px solid white"
      left={4}
      minH="400px"
      position="fixed"
      spacing={2}
      top={40}
      w="265px"
    >
      <Text
        align="center"
        borderBottom="2px solid white"
        fontWeight={500}
        p={2}
        w="100%"
      >
        Leaderboard
      </Text>
    </VStack>
  );
};
