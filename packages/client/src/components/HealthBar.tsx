import { Box, HStack, Text, VStack } from '@chakra-ui/react';
import { useMemo } from 'react';

export const HealthBar: React.FC<{
  startingHealth: number;
  currentHealth: number;
}> = ({ currentHealth, startingHealth }) => {
  const healthColor = useMemo(() => {
    if (currentHealth / startingHealth > 0.5) return 'softgreen';
    if (currentHealth / startingHealth > 0.25) return 'softyellow';
    if (currentHealth / startingHealth > 0.15) return 'orange';
    return 'red';
  }, [currentHealth, startingHealth]);
  return (
    <VStack alignItems="flex-end" w="100%">
      <HStack h={2} w="100%">
        <Text fontSize="sm" fontWeight={900}>
          HP
        </Text>
        <Box background="grey" h="100%" overflow="hidden" w="100%">
          <Box
            background={healthColor}
            h="100%"
            style={{ width: `${(currentHealth / startingHealth) * 100}%` }}
            transition="all 1s ease-out"
          />
        </Box>
      </HStack>
      <Text fontSize="2xs" fontWeight={900}>
        {currentHealth} / {startingHealth}
      </Text>
    </VStack>
  );
};
