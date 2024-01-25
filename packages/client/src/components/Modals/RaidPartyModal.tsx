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
import { useToast } from '../../hooks/useToast';
import { CLASS_STATS, WEARABLE_STATS } from '../../utils/constants';
import { EquippableTraitType } from '../../utils/types';

export const RaidPartyModal: React.FC = () => {
  const { address } = useAccount();
  const {
    components: { CharacterSheetInfo, TradeInfo },
    systemCalls: { setPartyClasses },
  } = useMUD();
  const {
    isMyCharacterSelected,
    isRaidPartyModalOpen: isOpen,
    myParty,
    onCloseRaidPartyModal: onClose,
    onOpenTradeTableModal: onOpenTradeModal,
    resetSelectedCharacter,
    selectedCharacter,
    selectedCharacterParty,
  } = useRaidParty();
  const { renderError, renderSuccess } = useToast();

  const party = useMemo(() => {
    if (!(myParty && selectedCharacter)) return null;
    if (selectedCharacterParty) return selectedCharacterParty;
    return myParty;
  }, [myParty, selectedCharacter, selectedCharacterParty]);

  const [isSaving, setIsSaving] = useState(false);
  const [selectedCard, setSelectedCard] = useState(0);

  const { getRootProps, getRadioProps, setValue, value } = useRadioGroup({
    name: 'card class',
    defaultValue: '-1',
  });

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

  const classes = useMemo(() => {
    if (!party) return null;
    return party[selectedCard].character.classes;
  }, [party, selectedCard]);

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
    if (party) {
      const myAvatarClassId = party[0].class;
      setValue(myAvatarClassId);
    } else {
      setValue('-1');
    }
    setSelectedCard(0);
  }, [party, setValue]);

  useEffect(() => {
    const myAvatarClassId = party ? party[selectedCard].class : '-1';
    setValue(myAvatarClassId);
  }, [party, selectedCard, setValue]);

  useEffect(() => {
    if (isOpen) {
      resetData();
    }
  }, [resetData, isOpen]);

  const hasChanged = useMemo(() => {
    const myAvatarClassId = party ? party[selectedCard].class : '-1';
    return myAvatarClassId !== value;
  }, [party, selectedCard, value]);

  const onSetPartyClasses = useCallback(async () => {
    if (!(address && party && selectedCharacter && classes)) return;
    setIsSaving(true);

    try {
      const newClasses = party.map((slot, i) => {
        if (i === selectedCard) {
          return String(value);
        } else {
          return slot.class;
        }
      });

      const success = await setPartyClasses(address, newClasses);

      if (!success) {
        renderError('Error updating Raid Party');
        return;
      }

      renderSuccess('Raid Party updated!');

      resetSelectedCharacter();
      onClose();
    } catch (e) {
      renderError(e, 'Error updating Raid Party');
    } finally {
      setIsSaving(false);
    }
  }, [
    address,
    classes,
    party,
    onClose,
    renderError,
    renderSuccess,
    resetSelectedCharacter,
    selectedCard,
    selectedCharacter,
    setPartyClasses,
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
              <Text>Select a class avatar :</Text>
              <Text fontSize="xs">
                (Your primary card&apos;s class will be your avatar)
              </Text>
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
                  onClick={onSetPartyClasses}
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
              <Button
                onClick={() => onOpenTradeModal(selectedCharacter)}
                size="sm"
              >
                Trade Cards
              </Button>
            </VStack>
          )}
          <Text>
            {isMyCharacterSelected ? 'Your' : `${selectedCharacter.name}'s`}{' '}
            character cards (max of 3):
          </Text>
          <HStack align="flex-start" mt={4} spacing={6}>
            {party?.map(({ character }, i) => (
              <Box
                key={`${character.id}-${i}`}
                onClick={() => setSelectedCard(i)}
                w="100%"
              >
                <CharacterCardSmall
                  character={character}
                  isSelected={i === selectedCard}
                  primary={i === 0}
                  selectedClassId={selectedCharacterParty?.[i].class}
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
