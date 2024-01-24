import { HStack, Text, VStack } from '@chakra-ui/react';

import { WEAPON_STATS } from '../utils/constants';
import { EquippedItem, Stats } from '../utils/types';

type CharacterStatsProps = {
  characterStats: Stats | null;
  equippedWeapons?: EquippedItem[] | null;
  equippedWearable: EquippedItem | null;
  avatarClassId: string;
  wearableBonuses: Omit<Stats, 'health'> | null;
};

export const CharacterStats: React.FC<CharacterStatsProps> = ({
  characterStats,
  equippedWeapons,
  equippedWearable,
  avatarClassId,
  wearableBonuses,
}) => {
  return (
    <>
      <VStack border="2px solid rgba(219, 211, 139, 0.75)" mt={4} p={4}>
        <Text>Stats</Text>
        {avatarClassId === '-1' && (
          <Text color="orange">
            (you are using the base villager class, so stats are bad)
          </Text>
        )}
        <HStack justify="space-around" mt={2} w="100%">
          <VStack align="flex-start">
            <Text fontSize="xs">Health:</Text>
            <Text color="rgba(219, 211, 139, 0.75)" fontWeight={500}>
              {characterStats?.health ?? 0}
            </Text>
          </VStack>
          <VStack align="flex-start">
            <Text fontSize="xs">Attack:</Text>
            <Text color="rgba(219, 211, 139, 0.75)" fontWeight={500}>
              {characterStats?.attack ?? 0}
            </Text>
          </VStack>
          <VStack align="flex-start">
            <Text fontSize="xs">Defense:</Text>
            <Text color="rgba(219, 211, 139, 0.75)" fontWeight={500}>
              {characterStats?.defense ?? 0}
            </Text>
          </VStack>
          <VStack align="flex-start">
            <Text fontSize="xs">Special Attack:</Text>
            <Text color="rgba(219, 211, 139, 0.75)" fontWeight={500}>
              {characterStats?.specialAttack ?? 0}
            </Text>
          </VStack>
          <VStack align="flex-start">
            <Text fontSize="xs">Special Defense:</Text>
            <Text color="rgba(219, 211, 139, 0.75)" fontWeight={500}>
              {characterStats?.specialDefense ?? 0}
            </Text>
          </VStack>
        </HStack>
        {equippedWearable && wearableBonuses && (
          <VStack align="flex-start" alignSelf="flex-start" ml={4} mt={4}>
            <Text fontSize="sm" textAlign="left">
              Because of your equipped {equippedWearable.name}, your stats have
              been modified by:
            </Text>
            {wearableBonuses.attack > 0 && (
              <Text fontSize="xs">+{wearableBonuses.attack} Attack</Text>
            )}
            {wearableBonuses.defense > 0 && (
              <Text fontSize="xs">+{wearableBonuses.defense} Defense</Text>
            )}
            {wearableBonuses.specialAttack > 0 && (
              <Text fontSize="xs">
                +{wearableBonuses.specialAttack} Special Attack
              </Text>
            )}
            {wearableBonuses.specialDefense > 0 && (
              <Text fontSize="xs">
                +{wearableBonuses.specialDefense} Special Defense
              </Text>
            )}
          </VStack>
        )}
      </VStack>
      {equippedWeapons && (
        <VStack border="2px solid rgba(219, 211, 139, 0.75)" mt={4} p={4}>
          <Text>Moves</Text>
          {equippedWeapons.length === 0 && (
            <Text color="orange">
              (you must equip an non-wearable item to learn a move)
            </Text>
          )}
          <HStack justify="center" mt={2} spacing={4}>
            {equippedWeapons.map(e => {
              return (
                <VStack
                  align="flex-start"
                  border="2px solid white"
                  key={e.id}
                  p={4}
                >
                  <Text fontSize="sm" textAlign="left">
                    {e.name}
                  </Text>
                  <Text fontSize="xs">
                    Type:{' '}
                    <Text
                      as="span"
                      color={String(WEAPON_STATS[e.itemId].color)}
                    >
                      {WEAPON_STATS[e.itemId].type}
                    </Text>
                  </Text>
                  <Text fontSize="xs">
                    Power:{' '}
                    <Text
                      as="span"
                      color="rgba(219, 211, 139, 0.75)"
                      fontWeight={500}
                    >
                      {WEAPON_STATS[e.itemId].power}
                    </Text>
                  </Text>
                </VStack>
              );
            })}
          </HStack>
        </VStack>
      )}
    </>
  );
};
