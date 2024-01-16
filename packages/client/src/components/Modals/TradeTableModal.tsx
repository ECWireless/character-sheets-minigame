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
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useAccount } from 'wagmi';

import villagerImage from '../../assets/villager/villager.png';
import { CharacterCardSmall } from '../../components/CharacterCard';
import { CharacterStats } from '../../components/CharacterStats';
import { ClassTag } from '../../components/ClassTag';
import { RadioOption } from '../../components/RadioOption';
import { useGame } from '../../contexts/GameContext';
import { useRaidParty } from '../../contexts/RaidPartyContext';
import { CLASS_STATS, WEARABLE_STATS } from '../../utils/constants';
import { Character, EquippableTraitType, Stats } from '../../utils/types';

export const TradeTableModal: React.FC = () => {
  const { address } = useAccount();
  const { character } = useGame();
  const {
    isTradeTableModalOpen: isOpen,
    myAvatarClassId,
    myPartyCharacters,
    onCloseTradeTableModal: onClose,
    selectedCharacter,
    selectedCharacterAvatarClassId: otherAvatarClassId,
    selectedCharacterPartyCharacters: otherPartyCharacters,
  } = useRaidParty();

  const [mySelectedCard, setMySelectedCard] = useState(1);
  const [otherSelectedCard, setOtherSelectedCard] = useState(1);
  const [lockedCards, setLockedCards] = useState<[number, number]>([0, 0]);

  const {
    getRootProps: getMyClassRootProps,
    getRadioProps: getMyClassRadioProps,
    setValue: setMyClassValue,
    value: myClassValue,
  } = useRadioGroup({
    name: 'my avatar class',
    defaultValue: '-1',
  });
  const {
    getRootProps: getOtherClassRootProps,
    getRadioProps: getOtherClassRadioProps,
    setValue: setOtherClassValue,
    value: otherClassValue,
  } = useRadioGroup({
    name: 'other avatar class',
    defaultValue: '-1',
  });

  const resetData = useCallback(() => {
    setMyClassValue(myAvatarClassId);
    setOtherClassValue(otherAvatarClassId);
    setMySelectedCard(1);
    setOtherSelectedCard(1);
    setLockedCards([0, 0]);
  }, [
    myAvatarClassId,
    otherAvatarClassId,
    setMyClassValue,
    setOtherClassValue,
  ]);

  useEffect(() => {
    if (isOpen) {
      resetData();
    }
  }, [resetData, isOpen]);

  const partyCharacters = useMemo(() => {
    if (!(character && selectedCharacter)) return null;

    return {
      [character.id]: myPartyCharacters ?? [character, character, character],
      [selectedCharacter.id]: otherPartyCharacters ?? [
        selectedCharacter,
        selectedCharacter,
        selectedCharacter,
      ],
    };
  }, [character, myPartyCharacters, otherPartyCharacters, selectedCharacter]);

  const getEquippedWeapons = useCallback((_character: Character) => {
    const { equippedItems } = _character;

    const equippedWeapons = equippedItems.filter(
      item =>
        item.attributes.find(
          a =>
            a.value === EquippableTraitType.EQUIPPED_ITEM_1 ||
            a.value === EquippableTraitType.EQUIPPED_ITEM_2,
        ) !== undefined,
    );

    return equippedWeapons;
  }, []);

  const equippedWeapons = useMemo(() => {
    if (!(character && selectedCharacter)) return null;

    return {
      [character.id]: getEquippedWeapons(character),
      [selectedCharacter.id]: getEquippedWeapons(selectedCharacter),
    };
  }, [character, getEquippedWeapons, selectedCharacter]);

  const getEquippedWearable = useCallback((_character: Character) => {
    const { equippedItems } = _character;

    const equippedWearable = equippedItems.find(
      item =>
        item.attributes.find(
          a => a.value === EquippableTraitType.EQUIPPED_WEARABLE,
        ) !== undefined,
    );

    return equippedWearable ?? null;
  }, []);

  const equippedWearable = useMemo(() => {
    if (!(character && selectedCharacter)) return null;

    return {
      [character.id]: getEquippedWearable(character),
      [selectedCharacter.id]: getEquippedWearable(selectedCharacter),
    };
  }, [character, getEquippedWearable, selectedCharacter]);

  const getWearableBonuses = useCallback(
    (_character: Character) => {
      const defaultValues = {
        attack: 0,
        defense: 0,
        specialAttack: 0,
        specialDefense: 0,
      };

      const { itemId } = equippedWearable?.[_character.id] ?? {};
      if (!itemId) return defaultValues;

      const numberId = Number(itemId);
      const wearable = WEARABLE_STATS[numberId];
      if (!wearable) return defaultValues;

      return {
        attack: wearable.attack,
        defense: wearable.defense,
        specialAttack: wearable.specialAttack,
        specialDefense: wearable.specialDefense,
      };
    },
    [equippedWearable],
  );

  const wearableBonuses = useMemo(() => {
    if (!(character && selectedCharacter)) return null;

    return {
      [character.id]: getWearableBonuses(character),
      [selectedCharacter.id]: getWearableBonuses(selectedCharacter),
    };
  }, [character, getWearableBonuses, selectedCharacter]);

  const getCharacterStats = useCallback(
    (_character: Character, classValue: string): Stats => {
      if (classValue === '-1') {
        return {
          health: 0,
          attack: 0,
          defense: 0,
          specialAttack: 0,
          specialDefense: 0,
        };
      }

      const selectedClass = Number(classValue);
      const classStats = CLASS_STATS[selectedClass];
      const { attack, defense, specialAttack, specialDefense } = classStats;

      if (wearableBonuses && wearableBonuses[_character.id]) {
        return {
          health: 10,
          attack: attack + wearableBonuses[_character.id].attack,
          defense: defense + wearableBonuses[_character.id].defense,
          specialAttack:
            specialAttack + wearableBonuses[_character.id].specialAttack,
          specialDefense:
            specialDefense + wearableBonuses[_character.id].specialDefense,
        };
      } else {
        return {
          health: 10,
          attack,
          defense,
          specialAttack,
          specialDefense,
        };
      }
    },
    [wearableBonuses],
  );

  const characterStats = useMemo(() => {
    if (!(character && selectedCharacter)) return null;

    return {
      [character.id]: getCharacterStats(character, String(myClassValue)),
      [selectedCharacter.id]: getCharacterStats(
        selectedCharacter,
        String(otherClassValue),
      ),
    };
  }, [
    character,
    getCharacterStats,
    myClassValue,
    otherClassValue,
    selectedCharacter,
  ]);

  const { classes: myClasses } = character ?? {};
  const { classes: otherClasses } = selectedCharacter ?? {};

  const classesWithVillager = useMemo(() => {
    if (!(character && myClasses && otherClasses && selectedCharacter))
      return {};
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

    return {
      [character.id]: [villagerClass, ...myClasses],
      [selectedCharacter.id]: [villagerClass, ...otherClasses],
    };
  }, [character, myClasses, otherClasses, selectedCharacter]);

  const myClassOptions = useMemo(() => {
    if (!character) return [];
    return classesWithVillager[character.id]?.map(c => c.classId);
  }, [character, classesWithVillager]);

  const otherClassOptions = useMemo(() => {
    if (!selectedCharacter) return [];
    return classesWithVillager[selectedCharacter.id]?.map(c => c.classId);
  }, [selectedCharacter, classesWithVillager]);

  if (
    !(
      address &&
      character &&
      characterStats &&
      equippedWeapons &&
      equippedWearable &&
      myClasses &&
      otherClasses &&
      partyCharacters &&
      selectedCharacter &&
      wearableBonuses
    )
  )
    return null;

  return (
    <Modal closeOnEsc closeOnOverlayClick isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent h="100vh" maxH="100vh" minW="100%" w="100%" m={0}>
        <ModalHeader>
          <Text textAlign="left" textTransform="initial" fontWeight="500">
            Trade Table
          </Text>
          <ModalCloseButton size="lg" />
        </ModalHeader>
        <ModalBody>
          <VStack mb={8} spacing={4}>
            {!lockedCards[0] && !lockedCards[1] && (
              <Text textAlign="center">
                Lock in cards from both parties to make a trade offer.
              </Text>
            )}
            {!!lockedCards[0] && !lockedCards[1] && (
              <Text textAlign="center">
                {character.name} is locked in for trade. Please select a card
                from other party.
              </Text>
            )}
            {!lockedCards[0] && !!lockedCards[1] && (
              <Text textAlign="center">
                {selectedCharacter.name} is locked in for trade. Please select a
                card from your party.
              </Text>
            )}
            {!!lockedCards[0] && !!lockedCards[1] && (
              <Text textAlign="center">
                {character.name} and {selectedCharacter.name} are locked in for
                a trade.
              </Text>
            )}
            <Button isDisabled={!(lockedCards[0] && lockedCards[1])} size="sm">
              Make Offer
            </Button>
          </VStack>
          <HStack alignItems="flex-start" spacing={24}>
            <Box w="100%">
              <Text>Your character cards (max of 3):</Text>
              <HStack mt={4} spacing={6}>
                {partyCharacters[character.id].map((character, i) => (
                  <Box
                    key={`${character.id}-${i}`}
                    onClick={() =>
                      !!lockedCards[0] ? undefined : setMySelectedCard(i + 1)
                    }
                    w="100%"
                  >
                    <CharacterCardSmall
                      character={character}
                      isSelected={i + 1 === mySelectedCard}
                      locked={!!lockedCards[0] && lockedCards[0] !== i + 1}
                      selectedClassId={String(myClassValue)}
                    />
                  </Box>
                ))}
              </HStack>
              <VStack my={8} spacing={4}>
                <Text>
                  {!!lockedCards[0]
                    ? `You have ${character.name} locked for a trade.`
                    : `Lock ${character.name} to make trade offer.`}
                </Text>
                <Button
                  onClick={() =>
                    setLockedCards(prev =>
                      !!lockedCards[0]
                        ? [0, prev[1]]
                        : [mySelectedCard, prev[1]],
                    )
                  }
                  size="sm"
                >
                  {!!lockedCards[0] ? 'Unlock' : 'Lock'}
                </Button>
              </VStack>
              <Text>{character.name}&apos;s classes:</Text>
              <Wrap mt={2} spacing={2} {...getMyClassRootProps()}>
                {myClassOptions.map(value => {
                  const radio = getMyClassRadioProps({ value });
                  const _class = classesWithVillager[character.id].find(
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
              <CharacterStats
                avatarClassId={String(myClassValue)}
                characterStats={characterStats[character.id]}
                equippedWeapons={equippedWeapons[character.id]}
                equippedWearable={equippedWearable[character.id]}
                wearableBonuses={wearableBonuses[character.id]}
              />
            </Box>
            <Box w="100%">
              <Text>
                {selectedCharacter.name}&apos;s character cards (max of 3):
              </Text>
              <HStack mt={4} spacing={6}>
                {partyCharacters[selectedCharacter.id].map((character, i) => (
                  <Box
                    key={`${character.id}-${i}`}
                    onClick={() =>
                      !!lockedCards[1] ? undefined : setOtherSelectedCard(i + 1)
                    }
                    w="100%"
                  >
                    <CharacterCardSmall
                      character={character}
                      isSelected={i + 1 === otherSelectedCard}
                      locked={!!lockedCards[1] && lockedCards[1] !== i + 1}
                      selectedClassId={String(otherClassValue)}
                    />
                  </Box>
                ))}
              </HStack>
              <VStack my={8} spacing={4}>
                <Text>
                  {!!lockedCards[1]
                    ? `You have ${selectedCharacter.name} locked for a trade.`
                    : `Lock ${selectedCharacter.name} to make trade offer.`}
                </Text>
                <Button
                  onClick={() =>
                    setLockedCards(prev =>
                      !!lockedCards[1]
                        ? [prev[0], 0]
                        : [prev[0], otherSelectedCard],
                    )
                  }
                  size="sm"
                >
                  {!!lockedCards[1] ? 'Unlock' : 'Lock'}
                </Button>
              </VStack>
              <Text>{selectedCharacter.name}&apos;s classes:</Text>
              <Wrap mt={2} spacing={2} {...getOtherClassRootProps()}>
                {otherClassOptions.map(value => {
                  const radio = getOtherClassRadioProps({ value });
                  const _class = classesWithVillager[selectedCharacter.id].find(
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
              <CharacterStats
                avatarClassId={String(otherClassValue)}
                characterStats={characterStats[selectedCharacter.id]}
                equippedWeapons={equippedWeapons[selectedCharacter.id]}
                equippedWearable={equippedWearable[selectedCharacter.id]}
                wearableBonuses={wearableBonuses[selectedCharacter.id]}
              />
            </Box>
          </HStack>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};
