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
import { useEntityQuery } from '@latticexyz/react';
import { Has, HasValue } from '@latticexyz/recs';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useAccount } from 'wagmi';

import villagerImage from '../../assets/villager/villager.png';
import { CharacterCardSmall } from '../../components/CharacterCard';
import { CharacterStats } from '../../components/CharacterStats';
import { ClassTag } from '../../components/ClassTag';
import { RadioOption } from '../../components/RadioOption';
import { useMUD } from '../../contexts/MUDContext';
import { useRaidParty } from '../../contexts/RaidPartyContext';
import { CLASS_STATS, WEARABLE_STATS } from '../../utils/constants';
import { EquippableTraitType } from '../../utils/types';

export const RaidPartyModal: React.FC = () => {
  const { address } = useAccount();
  const {
    components: { CharacterSheetInfo, TradeInfo },
    systemCalls: { removeAvatarClass, setAvatarClass },
  } = useMUD();
  const {
    myAvatarClassId,
    isMyCharacterSelected,
    isRaidPartyModalOpen: isOpen,
    onCloseRaidPartyModal: onClose,
    onOpenTradeTableModal: onOpenTradeModal,
    selectedCharacter,
    selectedCharacterAvatarClassId: otherAvatarClassId,
  } = useRaidParty();
  const toast = useToast();

  const [isSaving, setIsSaving] = useState(false);
  const [selectedCard, setSelectedCard] = useState(0);

  const { getRootProps, getRadioProps, setValue, value } = useRadioGroup({
    name: 'avatar class',
    defaultValue: '-1',
  });

  const partyCharacters = useMemo(() => {
    if (!selectedCharacter) return [];
    return [selectedCharacter, selectedCharacter, selectedCharacter];
  }, [selectedCharacter]);

  const equippedWeapons = useMemo(() => {
    if (!selectedCharacter) return null;
    const { equippedItems } = selectedCharacter;
    return equippedItems.filter(
      item =>
        item.attributes.find(
          a =>
            a.value === EquippableTraitType.EQUIPPED_ITEM_1 ||
            a.value === EquippableTraitType.EQUIPPED_ITEM_2,
        ) !== undefined,
    );
  }, [selectedCharacter]);

  const equippedWearable = useMemo(() => {
    if (!selectedCharacter) return null;
    const { equippedItems } = selectedCharacter;
    return (
      equippedItems.find(
        item =>
          item.attributes.find(
            a => a.value === EquippableTraitType.EQUIPPED_WEARABLE,
          ) !== undefined,
      ) ?? null
    );
  }, [selectedCharacter]);

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
    if (!selectedCharacter) return null;

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
  }, [selectedCharacter, value, wearableBonuses]);

  const { classes } = selectedCharacter ?? {};
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
    setValue(myAvatarClassId);
  }, [myAvatarClassId, setValue]);

  useEffect(() => {
    if (isOpen) {
      resetData();
    }
  }, [resetData, isOpen]);

  const hasChanged = useMemo(() => {
    return myAvatarClassId !== value;
  }, [myAvatarClassId, value]);

  const onSetAvatarClass = useCallback(async () => {
    if (!(address && selectedCharacter && classes)) return;
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
    classes,
    onClose,
    removeAvatarClass,
    selectedCharacter,
    setAvatarClass,
    toast,
    value,
  ]);

  const isTradeActive =
    useEntityQuery([
      HasValue(TradeInfo, { active: true }),
      Has(CharacterSheetInfo),
    ]).length > 0;

  if (!(address && classes && selectedCharacter)) return null;

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
          {isMyCharacterSelected && (
            <>
              <Text>Select a class-based avatar:</Text>
              <Wrap mt={2} spacing={2} {...getRootProps()}>
                {options.map(value => {
                  const radio = getRadioProps({ value });
                  const _class = classesWithVillager.find(
                    c => c.classId === value,
                  );
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
            </>
          )}
          {!isMyCharacterSelected && (
            <VStack mb={8} spacing={4}>
              {isTradeActive && (
                <Text align="center" color="red" fontSize="sm">
                  You already have an active trade. Creating a new one will
                  cancel the active one.
                </Text>
              )}
              <Button onClick={onOpenTradeModal} size="sm">
                Trade Cards
              </Button>
            </VStack>
          )}
          <Text>
            {isMyCharacterSelected ? 'Your' : `${selectedCharacter.name}'s`}{' '}
            character cards (max of 3):
          </Text>
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
                  selectedClassId={
                    isMyCharacterSelected ? String(value) : otherAvatarClassId
                  }
                />
              </Box>
            ))}
          </HStack>
          <CharacterStats
            avatarClassId={String(value)}
            characterStats={characterStats}
            equippedWeapons={equippedWeapons}
            equippedWearable={equippedWearable}
            wearableBonuses={wearableBonuses}
          />
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};
