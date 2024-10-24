import {
  Button,
  Grid,
  GridItem,
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
import { useComponentValue, useEntityQuery } from '@latticexyz/react';
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
import { getPlayerEntity } from '../../utils/helpers';

export const RaidPartyModal: React.FC = () => {
  const { address } = useAccount();
  const {
    components: { BattleInfo, CharacterSheetInfo, TradeInfo },
    systemCalls: { setPartyClasses },
  } = useMUD();
  const {
    equippedWeapons,
    equippedWearable,
    getCharacterStats,
    isMyCharacterSelected,
    isRaidPartyModalOpen: isOpen,
    myCharacterCardCounter,
    myParty,
    onCloseRaidPartyModal: onClose,
    onOpenTradeTableModal: onOpenTradeModal,
    resetSelectedCharacter,
    selectedCharacter,
    selectedCharacterCardCounter,
    selectedCharacterParty,
    wearableBonuses,
  } = useRaidParty();
  const { renderError, renderSuccess } = useToast();

  const party = useMemo(() => {
    if (!(myParty && selectedCharacter)) return null;
    if (selectedCharacterParty) return selectedCharacterParty;
    return myParty;
  }, [myParty, selectedCharacter, selectedCharacterParty]);

  const cardCount = useMemo(() => {
    if (isMyCharacterSelected) {
      return myCharacterCardCounter;
    } else {
      return selectedCharacterCardCounter;
    }
  }, [
    isMyCharacterSelected,
    myCharacterCardCounter,
    selectedCharacterCardCounter,
  ]);

  const [isSaving, setIsSaving] = useState(false);
  const [selectedCard, setSelectedCard] = useState(0);

  const {
    getRootProps: getCardOneRootProps,
    getRadioProps: getCardOneRadioProps,
    setValue: setCardOneClass,
    value: cardOneClass,
  } = useRadioGroup({
    name: 'card one class',
    defaultValue: '-1',
  });
  const {
    getRootProps: getCardTwoRootProps,
    getRadioProps: getCardTwoRadioProps,
    setValue: setCardTwoClass,
    value: cardTwoClass,
  } = useRadioGroup({
    name: 'card two class',
    defaultValue: '-1',
  });
  const {
    getRootProps: getCardThreeRootProps,
    getRadioProps: getCardThreeRadioProps,
    setValue: setCardThreeClass,
    value: cardThreeClass,
  } = useRadioGroup({
    name: 'card three class',
    defaultValue: '-1',
  });

  const cardClasses = useMemo(
    () => [cardOneClass, cardTwoClass, cardThreeClass].map(c => String(c)),
    [cardOneClass, cardThreeClass, cardTwoClass],
  );

  const characterStats = useMemo(() => {
    if (!selectedCharacter || !cardClasses[selectedCard]) return null;
    return getCharacterStats(selectedCharacter, cardClasses[selectedCard]);
  }, [cardClasses, getCharacterStats, selectedCard, selectedCharacter]);

  const classes = useMemo(() => {
    if (!party) return null;
    return party[selectedCard]?.character.heldClasses ?? null;
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
      setCardOneClass(party[0]?.class ?? '-1');
      setCardTwoClass(party[1]?.class ?? '-1');
      setCardThreeClass(party[2]?.class ?? '-1');
    } else {
      setCardOneClass('-1');
      setCardTwoClass('-1');
      setCardThreeClass('-1');
    }
    setSelectedCard(0);
  }, [party, setCardOneClass, setCardThreeClass, setCardTwoClass]);

  useEffect(() => {
    if (isOpen) {
      resetData();
    }
  }, [resetData, isOpen]);

  const hasChanged = useMemo(() => {
    const oldCardOneClass = party ? party[0]?.class : '-1';
    const oldCardTwoClass = party ? party[1]?.class : '-1';
    const oldCardThreeClass = party ? party[2]?.class : '-1';

    return (
      oldCardOneClass !== cardOneClass ||
      oldCardTwoClass !== cardTwoClass ||
      oldCardThreeClass !== cardThreeClass
    );
  }, [cardOneClass, cardThreeClass, cardTwoClass, party]);

  const onSetPartyClasses = useCallback(async () => {
    if (!(address && party && selectedCharacter && classes)) return;
    setIsSaving(true);

    try {
      const success = await setPartyClasses(address, cardClasses);

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
    cardClasses,
    classes,
    party,
    onClose,
    renderError,
    renderSuccess,
    resetSelectedCharacter,
    selectedCharacter,
    setPartyClasses,
  ]);

  const isTradeActive =
    useEntityQuery([
      HasValue(TradeInfo, { active: true }),
      Has(CharacterSheetInfo),
    ]).length > 0;

  const myPlayerEntity = useMemo(() => {
    return getPlayerEntity(address);
  }, [address]);

  const otherPlayerEntity = useMemo(() => {
    return getPlayerEntity(selectedCharacter?.player);
  }, [selectedCharacter?.player]);

  const myBattleInfo = useComponentValue(BattleInfo, myPlayerEntity);
  const otherBattleInfo = useComponentValue(BattleInfo, otherPlayerEntity);

  if (
    !(
      address &&
      classes &&
      characterStats &&
      equippedWeapons &&
      equippedWearable &&
      selectedCharacter &&
      wearableBonuses
    )
  )
    return null;

  const getRootProps = [
    getCardOneRootProps,
    getCardTwoRootProps,
    getCardThreeRootProps,
  ];
  const getRadioProps = [
    getCardOneRadioProps,
    getCardTwoRadioProps,
    getCardThreeRadioProps,
  ];

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
          {myBattleInfo?.molochDefeated && (
            <Text color="orange" fontSize="sm" mb={4} textAlign="center">
              You cannot{' '}
              {isMyCharacterSelected ? 'change your Raid Party' : 'trade cards'}{' '}
              after defeating a Moloch Soldier.
            </Text>
          )}
          {isMyCharacterSelected && !myBattleInfo?.molochDefeated && (
            <>
              <Text>Select a class avatar :</Text>
              <Text fontSize="xs">
                (Your personal card&apos;s class will be your avatar)
              </Text>
              <Wrap mt={2} spacing={2} {...getRootProps[selectedCard]?.()}>
                {options.map(value => {
                  const radio = getRadioProps[selectedCard]?.({ value });
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
          {!isMyCharacterSelected &&
            !myBattleInfo?.molochDefeated &&
            !otherBattleInfo?.molochDefeated && (
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
            party:
          </Text>
          <Grid gap={6} mt={4} templateColumns="repeat(3, 1fr)">
            {party?.map(({ character }, i) => (
              <GridItem
                key={`${character.id}-${i}`}
                onClick={() => setSelectedCard(i)}
              >
                <CharacterCardSmall
                  cardCount={i === 0 ? cardCount : undefined}
                  character={character}
                  isSelected={i === selectedCard}
                  selectedClassId={cardClasses[i]}
                />
              </GridItem>
            ))}
            {party &&
              party.length < 3 &&
              new Array(3 - (party?.length ?? 0)).fill(0).map((_, i) => (
                <GridItem
                  key={`empty-${i}`}
                  border="2px solid"
                  borderColor="rgba(219, 211, 139, 0.75)"
                  p={3}
                  _hover={{
                    cursor: 'not-allowed',
                  }}
                >
                  <VStack justify="center" h="100%">
                    <Text>EMPTY SLOT</Text>
                  </VStack>
                </GridItem>
              ))}
          </Grid>
          <CharacterStats
            avatarClassId={cardClasses[selectedCard]}
            characterStats={characterStats}
            equippedWeapons={equippedWeapons[selectedCharacter.id]}
            equippedWearable={equippedWearable[selectedCharacter.id]}
            wearableBonuses={wearableBonuses[selectedCharacter.id]}
          />
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};
