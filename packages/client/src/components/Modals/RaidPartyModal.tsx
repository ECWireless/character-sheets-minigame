import {
  Box,
  Button,
  HStack,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  Text,
  useRadioGroup,
  useToast,
  VStack,
  Wrap,
  WrapItem,
} from '@chakra-ui/react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useAccount } from 'wagmi';

import villagerImage from '../../assets/villager/villager.png';
import { CharacterCardSmall } from '../../components/CharacterCard';
import { ClassTag } from '../../components/ClassTag';
import { RadioOption } from '../../components/RadioOption';
import { useGame } from '../../contexts/GameContext';
import { useMUD } from '../../contexts/MUDContext';
import { useRaidParty } from '../../contexts/RaidPartyContext';
import {
  CLASS_STATS,
  WEAPON_STATS,
  WEARABLE_STATS,
} from '../../utils/constants';
import { EquippableTraitType } from '../../utils/types';

type RaidPartyModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

export const RaidPartyModal: React.FC<RaidPartyModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { address } = useAccount();
  const { character } = useGame();
  const {
    systemCalls: { removeAvatarClass, setAvatarClass },
  } = useMUD();
  const { avatarClassId } = useRaidParty();
  const toast = useToast();

  const [isSaving, setIsSaving] = useState(false);
  const [selectedCard, setSelectedCard] = useState(0);

  const partyCharacters = useMemo(() => {
    if (!character) return [];
    return [character, character, character];
  }, [character]);

  const { getRootProps, getRadioProps, setValue, value } = useRadioGroup({
    name: 'avatar class',
    defaultValue: '-1',
  });

  const equippedWeapons = useMemo(() => {
    if (!character) return null;
    const { equippedItems } = character;
    return equippedItems.filter(
      item =>
        item.attributes.find(
          a =>
            a.value === EquippableTraitType.EQUIPPED_ITEM_1 ||
            a.value === EquippableTraitType.EQUIPPED_ITEM_2,
        ) !== undefined,
    );
  }, [character]);

  const equippedWearable = useMemo(() => {
    if (!character) return null;
    const { equippedItems } = character;
    return (
      equippedItems.find(
        item =>
          item.attributes.find(
            a => a.value === EquippableTraitType.EQUIPPED_WEARABLE,
          ) !== undefined,
      ) ?? null
    );
  }, [character]);

  const wearableBonuses = useMemo(() => {
    if (!equippedWearable) return null;

    const { itemId } = equippedWearable;
    const numberId = Number(itemId);
    const wearable = WEARABLE_STATS[numberId];
    if (!wearable) {
      return { attack: 0, defense: 0, specialAttack: 0, specialDefense: 0 };
    } else {
      return {
        attack: wearable.attack,
        defense: wearable.defense,
        specialAttack: wearable.specialAttack,
        specialDefense: wearable.specialDefense,
      };
    }
  }, [equippedWearable]);

  const characterStats = useMemo(() => {
    if (!character) return null;

    if (value === '-1') {
      return {
        health: 0,
        attack: 0,
        defense: 0,
        specialAttack: 0,
        specialDefense: 0,
      };
    }

    const selectedClass = Number(value);
    const classStats = CLASS_STATS[selectedClass];
    const { attack, defense, specialAttack, specialDefense } = classStats;

    return {
      health: 10,
      attack: attack + (wearableBonuses?.attack ?? 0),
      defense: defense + (wearableBonuses?.defense ?? 0),
      specialAttack: specialAttack + (wearableBonuses?.specialAttack ?? 0),
      specialDefense: specialDefense + (wearableBonuses?.specialDefense ?? 0),
    };
  }, [character, value, wearableBonuses]);

  const { classes } = character ?? {};
  const classesWithVillager = useMemo(() => {
    if (!classes) return [];
    const villagerClass = {
      name: 'Villager',
      description: 'A simple villager',
      image: villagerImage,
      equippable_layer: null,
      attributes: [],
      id: '-1',
      classId: '-1',
      uri: '',
      claimable: false,
      holders: [],
    };

    return [villagerClass, ...classes];
  }, [classes]);

  const options = useMemo(() => {
    return classesWithVillager.map(c => c.classId);
  }, [classesWithVillager]);

  const resetData = useCallback(() => {
    setValue(avatarClassId);
  }, [avatarClassId, setValue]);

  useEffect(() => {
    if (isOpen) {
      resetData();
    }
  }, [resetData, isOpen]);

  const hasChanged = useMemo(() => {
    return avatarClassId !== value;
  }, [avatarClassId, value]);

  const onSetAvatarClass = useCallback(async () => {
    if (!(address && character && classes)) return;
    setIsSaving(true);

    try {
      if (value === '-1') {
        await removeAvatarClass(address);
      } else {
        await setAvatarClass(address, value.toString());
      }

      toast({
        title: 'Raid Party updated!',
        status: 'success',
        position: 'top',
        duration: 5000,
        isClosable: true,
      });

      onClose();
    } catch (e) {
      console.error(e);
      toast({
        title: 'Error updating Raid Party',
        status: 'error',
        position: 'top',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsSaving(false);
    }
  }, [
    address,
    character,
    classes,
    onClose,
    removeAvatarClass,
    setAvatarClass,
    toast,
    value,
  ]);

  if (!(address && character && classes)) return null;

  return (
    <Modal closeOnEsc closeOnOverlayClick isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent mt={{ base: 0, md: '84px' }}>
        <ModalHeader>
          <Text textAlign="left" textTransform="initial" fontWeight="500">
            Raid Party
          </Text>
          <ModalCloseButton size="lg" />
        </ModalHeader>
        <ModalBody>
          <Text>Select a class-based avatar:</Text>
          <Wrap mt={2} spacing={2} {...getRootProps()}>
            {options.map(value => {
              const radio = getRadioProps({ value });
              const _class = classesWithVillager.find(c => c.classId === value);
              if (!_class) return null;

              return (
                <WrapItem key={_class.classId + _class.name}>
                  <RadioOption {...radio}>
                    <ClassTag {..._class} size="md" />
                  </RadioOption>
                </WrapItem>
              );
            })}
          </Wrap>
          <HStack justifyContent="flex-end" mt={4}>
            <Button
              isLoading={isSaving}
              loadingText="Saving..."
              isDisabled={!hasChanged}
              onClick={onSetAvatarClass}
              size="xs"
            >
              Save
            </Button>
          </HStack>
          <Text>Your party&apos;s character cards (max of 3):</Text>
          <HStack mt={4} spacing={6}>
            {partyCharacters.map((character, i) => (
              <Box
                key={`${character.id}-${i}`}
                onClick={() => setSelectedCard(i)}
                w="100%"
              >
                <CharacterCardSmall
                  character={character}
                  isSelected={i === selectedCard}
                />
              </Box>
            ))}
          </HStack>
          <VStack border="2px solid rgba(219, 211, 139, 0.75)" mt={4} p={4}>
            <Text>Stats</Text>
            {value === '-1' && (
              <Text color="orange">
                (choose a non-villager class to see stats)
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
                  Because of your equipped {equippedWearable.name}, your stats
                  have been modified by:
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
          <VStack border="2px solid rgba(219, 211, 139, 0.75)" mt={4} p={4}>
            <Text>Moves</Text>
            {value === '-1' && (
              <Text color="orange">
                (choose a non-villager class to see moves)
              </Text>
            )}
            {equippedWeapons && (
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
            )}
          </VStack>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};
