import {
  AspectRatio,
  Box,
  Flex,
  HStack,
  Image,
  Text,
  Tooltip,
  VStack,
  Wrap,
  WrapItem,
} from '@chakra-ui/react';
import { useMemo } from 'react';

import itemsSvg from '../assets/icons/items.svg';
import { Character } from '../utils/types';
import { ClassTag } from './ClassTag';
import { XPDisplaySmall } from './XPDisplay';

export const CharacterCardSmall: React.FC<{
  character: Character;
  isSelected?: boolean;
  locked?: boolean;
  selectedClassId?: string;
}> = ({ character, isSelected, locked, selectedClassId }) => {
  const { classes, experience, heldItems, image, jailed, name } = character;

  const itemTotal = useMemo(() => {
    return heldItems
      .reduce((total, item) => total + BigInt(item.amount), BigInt(0))
      .toString();
  }, [heldItems]);

  return (
    <VStack spacing={3} w="100%">
      <Box
        border="2px solid"
        borderColor={isSelected ? 'white' : 'rgba(219, 211, 139, 0.75)'}
        overflow="hidden"
        p={3}
        transition="transform 0.3s"
        _hover={
          locked
            ? {
                cursor: 'not-allowed',
              }
            : {
                cursor: 'pointer',
                transform: 'rotateY(15deg)',
              }
        }
        w="100%"
        h="100%"
      >
        <Box pos="relative">
          <AspectRatio ratio={10 / 13} w="full">
            <Image
              alt="character avatar"
              borderRadius="lg"
              filter={jailed || locked ? 'grayscale(100%)' : 'none'}
              h="100%"
              objectFit="cover"
              src={image}
              w="100%"
            />
          </AspectRatio>
          {jailed && (
            <Text
              bg="black"
              color="red"
              fontWeight="bold"
              left="50%"
              pos="absolute"
              top="50%"
              transform="translate(-50%, -50%)"
              variant="secondary"
            >
              JAILED
            </Text>
          )}
          <HStack
            bottom={4}
            left="50%"
            pos="absolute"
            transform="translateX(-50%)"
          >
            <XPDisplaySmall experience={experience} />
          </HStack>
        </Box>
        <VStack py={4} spacing={5}>
          <Text fontSize="lg" fontWeight={500}>
            {name}
          </Text>
          <HStack justify="space-between" w="full">
            <Wrap spacing={2}>
              {classes.map(classEntity => (
                <WrapItem
                  key={classEntity.classId + classEntity.name}
                  border="2px solid"
                  borderColor={
                    selectedClassId === classEntity.classId
                      ? 'white'
                      : 'transparent'
                  }
                  borderRadius="50%"
                >
                  <ClassTag {...classEntity} size="xs" />
                </WrapItem>
              ))}
            </Wrap>
            <Tooltip
              aria-label={`${itemTotal} item${
                Number(itemTotal) === 1 ? '' : 's'
              } in inventory`}
              label={`${itemTotal} item${
                Number(itemTotal) === 1 ? '' : 's'
              } in inventory`}
            >
              <Flex align="center" gap={3}>
                <Text>{itemTotal}</Text>
                <Image alt="users" height="16px" src={itemsSvg} width="16px" />
              </Flex>
            </Tooltip>
          </HStack>
        </VStack>
      </Box>
    </VStack>
  );
};
