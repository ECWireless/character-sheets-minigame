import {
  AspectRatio,
  Box,
  HStack,
  Image,
  Text,
  VStack,
} from '@chakra-ui/react';

import molochImage from '../assets/moloch/moloch.webp';
import { XPDisplaySmall } from './XPDisplay';

export const MolochCardSmall: React.FC = () => {
  return (
    <VStack spacing={3} h="100%" w="100%">
      <Box
        border="2px solid"
        borderColor="rgba(219, 211, 139, 0.75)"
        overflow="hidden"
        p={3}
        transition="transform 0.3s"
        w="100%"
      >
        <Box pos="relative">
          <AspectRatio ratio={10 / 13} w="full">
            <Image
              alt="character avatar"
              borderRadius="lg"
              h="100%"
              objectFit="cover"
              src={molochImage}
              w="100%"
            />
          </AspectRatio>
          <HStack
            bottom={4}
            left="50%"
            pos="absolute"
            transform="translateX(-50%)"
          >
            <XPDisplaySmall experience="∞" />
          </HStack>
        </Box>
        <VStack py={4} spacing={5}>
          <Text fontSize="lg" fontWeight={500}>
            Moloch Soldier
          </Text>
          <HStack justify="space-between" w="full">
            <Text fontSize="xs">God of coordination failure</Text>
          </HStack>
        </VStack>
      </Box>
    </VStack>
  );
};
