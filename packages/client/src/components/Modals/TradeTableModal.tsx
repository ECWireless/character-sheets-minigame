import {
  Box,
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
import {
  getComponentValueStrict,
  getEntitiesWithValue,
} from '@latticexyz/recs';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { getAddress } from 'viem';
import { useAccount } from 'wagmi';

import villagerImage from '../../assets/villager/villager.png';
import { CharacterCardSmall } from '../../components/CharacterCard';
import { CharacterStats } from '../../components/CharacterStats';
import { ClassTag } from '../../components/ClassTag';
import { RadioOption } from '../../components/RadioOption';
import { useGame } from '../../contexts/GameContext';
import { useMUD } from '../../contexts/MUDContext';
import { useRaidParty } from '../../contexts/RaidPartyContext';
import { useToast } from '../../hooks/useToast';

const reversePartyIndex = (index: number, partySize: number) => {
  if (partySize === 1) return 1;

  if (partySize === 2) {
    switch (index) {
      case 1:
        return 2;
      case 2:
        return 1;
      default:
        return 1;
    }
  }

  switch (index) {
    case 1:
      return 3;
    case 2:
      return 2;
    case 3:
      return 1;
    default:
      return 1;
  }
};

export const TradeTableModal: React.FC = () => {
  const { address } = useAccount();
  const { character } = useGame();
  const {
    equippedWeapons,
    equippedWearable,
    getCharacterStats,
    isTradeTableModalOpen: isOpen,
    myCharacterCardCounter,
    myParty,
    onCloseTradeTableModal: onClose,
    selectedCharacter,
    selectedCharacterCardCounter,
    selectedCharacterParty,
    wearableBonuses,
  } = useRaidParty();
  const {
    components: { TradeInfo },
    systemCalls: { acceptOffer, cancelOffer, makeOffer, rejectOffer },
  } = useMUD();
  const { renderError, renderSuccess } = useToast();

  const [mySelectedCard, setMySelectedCard] = useState(1);
  const [otherSelectedCard, setOtherSelectedCard] = useState(1);
  const [lockedCards, setLockedCards] = useState<[number, number]>([0, 0]);
  const [isPending, setIsPending] = useState(false);
  const [isRejecting, setIsRejecting] = useState(false);

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

  useEffect(() => {
    const myAvatarClassId = myParty ? myParty[mySelectedCard - 1]?.class : '-1';
    const otherAvatarClassId = selectedCharacterParty
      ? selectedCharacterParty[otherSelectedCard - 1]?.class
      : '-1';

    setMyClassValue(myAvatarClassId);
    setOtherClassValue(otherAvatarClassId);
  }, [
    myParty,
    mySelectedCard,
    otherSelectedCard,
    selectedCharacterParty,
    setMyClassValue,
    setOtherClassValue,
  ]);

  const tradeRequests = useMemo(() => {
    if (!isOpen) return [];
    const entities = getEntitiesWithValue(TradeInfo, {
      active: true,
      initiatedBy: selectedCharacter
        ? getAddress(selectedCharacter.player)
        : '',
      initiatedWith: address ? getAddress(address) : '',
    });

    const entitiesArray = Array.from(entities);

    return entitiesArray.map(e => {
      const tradeInfo = getComponentValueStrict(TradeInfo, e);
      return {
        active: tradeInfo.active,
        offeredCardPlayer: tradeInfo.offeredCardPlayer,
        requestedCardPlayer: tradeInfo.requestedCardPlayer,
        canceled: tradeInfo.canceled,
        rejected: tradeInfo.rejected,
      };
    });
  }, [address, isOpen, selectedCharacter, TradeInfo]);

  const tradeOffers = useMemo(() => {
    if (!isOpen) return [];
    const entities = getEntitiesWithValue(TradeInfo, {
      active: true,
      initiatedBy: address ? getAddress(address) : '',
      initiatedWith: selectedCharacter
        ? getAddress(selectedCharacter.player)
        : '',
    });

    const entitiesArray = Array.from(entities);

    return entitiesArray.map(e => {
      const tradeInfo = getComponentValueStrict(TradeInfo, e);
      return {
        active: tradeInfo.active,
        offeredCardPlayer: tradeInfo.offeredCardPlayer,
        requestedCardPlayer: tradeInfo.requestedCardPlayer,
        canceled: tradeInfo.canceled,
        rejected: tradeInfo.rejected,
      };
    });
  }, [address, isOpen, selectedCharacter, TradeInfo]);

  const isTradeRequestActive = useMemo(
    () => tradeRequests.filter(tr => tr.active).length > 0,
    [tradeRequests],
  );

  const isTradeOfferActive = useMemo(
    () => tradeOffers.filter(to => to.active).length > 0,
    [tradeOffers],
  );

  const pauseControls = useMemo(
    () => isTradeOfferActive || isTradeRequestActive,
    [isTradeOfferActive, isTradeRequestActive],
  );

  const isLastTradeCanceled = useMemo(
    () =>
      tradeOffers.filter(to => to.canceled).length > 0 ||
      tradeRequests.filter(tr => tr.canceled).length > 0,
    [tradeOffers, tradeRequests],
  );

  const isLastTradeRejected = useMemo(
    () =>
      tradeRequests.filter(tr => tr.rejected).length > 0 ||
      tradeOffers.filter(to => to.rejected).length > 0,
    [tradeOffers, tradeRequests],
  );

  const resetData = useCallback(() => {
    const myAvatarClassId = myParty ? myParty[0]?.class : '-1';
    const otherAvatarClassId = selectedCharacterParty
      ? selectedCharacterParty[0]?.class
      : '-1';

    setMyClassValue(myAvatarClassId);
    setOtherClassValue(otherAvatarClassId);

    if (isTradeOfferActive && myParty && selectedCharacterParty) {
      const activeTradeOffers = tradeOffers.filter(t => t.active);
      const myPartyCards = myParty.map(s => s.character);
      const otherPartyCards = selectedCharacterParty.map(s => s.character);

      let _mySelectedCard = myPartyCards
        ?.reverse()
        .findIndex(
          c =>
            c.player.toLowerCase() ===
            activeTradeOffers[0]?.offeredCardPlayer.toLowerCase(),
        );
      let _otherSelectedCard = otherPartyCards
        ?.reverse()
        .findIndex(
          c =>
            c.player.toLowerCase() ===
            activeTradeOffers[0]?.requestedCardPlayer.toLowerCase(),
        );

      if (
        _mySelectedCard === undefined ||
        _mySelectedCard < 0 ||
        _otherSelectedCard === undefined ||
        _otherSelectedCard < 0
      ) {
        setMySelectedCard(1);
        setOtherSelectedCard(1);
        renderError('Error loading trade offer!');
        return;
      }

      _mySelectedCard = reversePartyIndex(_mySelectedCard + 1, myParty.length);
      _otherSelectedCard = reversePartyIndex(
        _otherSelectedCard + 1,
        selectedCharacterParty.length,
      );

      setMySelectedCard(_mySelectedCard);
      setOtherSelectedCard(_otherSelectedCard);
      setLockedCards([_mySelectedCard, _otherSelectedCard]);

      const myAvatarClassId = myParty
        ? myParty[_mySelectedCard - 1]?.class
        : '-1';
      const otherAvatarClassId = selectedCharacterParty
        ? selectedCharacterParty[_otherSelectedCard - 1]?.class
        : '-1';

      setMyClassValue(myAvatarClassId);
      setOtherClassValue(otherAvatarClassId);
    } else if (isTradeRequestActive && myParty && selectedCharacterParty) {
      const activeTradeRequests = tradeRequests.filter(t => t.active);
      const myPartyCards = myParty.map(s => s.character);
      const otherPartyCards = selectedCharacterParty.map(s => s.character);

      let _mySelectedCard = myPartyCards
        ?.reverse()
        .findIndex(
          c =>
            c.player.toLowerCase() ===
            activeTradeRequests[0]?.requestedCardPlayer.toLowerCase(),
        );
      let _otherSelectedCard = otherPartyCards
        ?.reverse()
        .findIndex(
          c =>
            c.player.toLowerCase() ===
            activeTradeRequests[0]?.offeredCardPlayer.toLowerCase(),
        );

      if (
        _mySelectedCard === undefined ||
        _mySelectedCard < 0 ||
        _otherSelectedCard === undefined ||
        _otherSelectedCard < 0
      ) {
        setMySelectedCard(1);
        setOtherSelectedCard(1);
        renderError('Error loading trade request!');
        return;
      }

      _mySelectedCard = reversePartyIndex(_mySelectedCard + 1, myParty.length);
      _otherSelectedCard = reversePartyIndex(
        _otherSelectedCard + 1,
        selectedCharacterParty.length,
      );

      setMySelectedCard(_mySelectedCard);
      setOtherSelectedCard(_otherSelectedCard);
      setLockedCards([_mySelectedCard, _otherSelectedCard]);

      const myAvatarClassId = myParty
        ? myParty[_mySelectedCard - 1]?.class
        : '-1';
      const otherAvatarClassId = selectedCharacterParty
        ? selectedCharacterParty[_otherSelectedCard - 1]?.class
        : '-1';

      setMyClassValue(myAvatarClassId);
      setOtherClassValue(otherAvatarClassId);
    } else {
      setMySelectedCard(1);
      setOtherSelectedCard(1);
      setLockedCards([0, 0]);
    }
  }, [
    isTradeOfferActive,
    isTradeRequestActive,
    myParty,
    renderError,
    selectedCharacterParty,
    setMyClassValue,
    setOtherClassValue,
    tradeOffers,
    tradeRequests,
  ]);

  useEffect(() => {
    if (isOpen) {
      resetData();
    }
  }, [resetData, isOpen]);

  const partyCharacters = useMemo(() => {
    if (!(character && selectedCharacter)) return null;

    return {
      [character.id]: myParty
        ? myParty.map(m => m.character)
        : [character, character, character],
      [selectedCharacter.id]: selectedCharacterParty
        ? selectedCharacterParty.map(s => s.character)
        : [selectedCharacter, selectedCharacter, selectedCharacter],
    };
  }, [character, myParty, selectedCharacter, selectedCharacterParty]);

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

  const onMakeOffer = useCallback(async () => {
    setIsPending(true);

    try {
      if (!(address && selectedCharacter && character)) {
        throw new Error('Missing address, character, or selectedCharacter');
      }

      if (!(mySelectedCard && otherSelectedCard)) {
        throw new Error('Missing mySelectedCard or otherSelectedCard');
      }

      if (
        !(
          partyCharacters &&
          partyCharacters[character.id] &&
          partyCharacters[selectedCharacter.id]
        )
      ) {
        throw new Error('Missing partyCharacters');
      }

      const offeredCard = partyCharacters[character.id][mySelectedCard - 1];
      const requestedCard =
        partyCharacters[selectedCharacter.id][otherSelectedCard - 1];

      const success = await makeOffer(
        address,
        selectedCharacter.player,
        offeredCard.player,
        requestedCard.player,
      );

      if (!success) {
        throw new Error('Error making offer');
      }

      renderSuccess('Trade offer made!');
      onClose();
    } catch (e) {
      renderError(e, 'Error making offer');
    } finally {
      setIsPending(false);
    }
  }, [
    address,
    character,
    makeOffer,
    mySelectedCard,
    onClose,
    otherSelectedCard,
    partyCharacters,
    renderError,
    renderSuccess,
    selectedCharacter,
  ]);

  const onAcceptOffer = useCallback(async () => {
    setIsPending(true);

    try {
      if (!(address && selectedCharacter)) {
        throw new Error('Missing address or selectedCharacter');
      }

      const success = await acceptOffer(selectedCharacter.player, address);

      if (!success) {
        throw new Error('Error making offer');
      }

      renderSuccess('Trade accepted!');

      onClose();
    } catch (e) {
      renderError(e, 'Error accepting offer');
    } finally {
      setIsPending(false);
    }
  }, [
    acceptOffer,
    address,
    onClose,
    renderError,
    renderSuccess,
    selectedCharacter,
  ]);

  const onCancelOffer = useCallback(async () => {
    setIsPending(true);

    try {
      if (!(address && selectedCharacter)) {
        throw new Error('Missing address or selectedCharacter');
      }

      const success = await cancelOffer(address, selectedCharacter.player);

      if (!success) {
        throw new Error('Error canceling offer');
      }

      renderSuccess('Trade canceled!');

      onClose();
    } catch (e) {
      renderError(e, 'Error canceling offer');
    } finally {
      setIsPending(false);
    }
  }, [
    address,
    cancelOffer,
    onClose,
    renderError,
    renderSuccess,
    selectedCharacter,
  ]);

  const onRejectOffer = useCallback(async () => {
    setIsRejecting(true);

    try {
      if (!(address && selectedCharacter)) {
        throw new Error('Missing address or selectedCharacter');
      }

      const success = await rejectOffer(selectedCharacter.player, address);

      if (!success) {
        throw new Error('Error rejecting offer');
      }

      renderSuccess('Trade rejected!');

      onClose();
    } catch (e) {
      renderError(e, 'Error rejecting offer');
    } finally {
      setIsRejecting(false);
    }
  }, [
    address,
    onClose,
    rejectOffer,
    renderError,
    renderSuccess,
    selectedCharacter,
  ]);

  const myLockButtonDetails = useMemo(() => {
    if (!(character && myParty && selectedCharacterParty))
      return {
        isDisabled: true,
        text: 'Loading...',
      };
    if (
      myParty[mySelectedCard - 1].character.id ===
        selectedCharacterParty[1]?.character.id ||
      myParty[mySelectedCard - 1]?.character.id ===
        selectedCharacterParty[2]?.character.id
    ) {
      return {
        isDisabled: true,
        text: 'You cannot offer a card that the other party already has.',
      };
    }

    if (mySelectedCard === 1 && myCharacterCardCounter === 1) {
      return {
        isDisabled: true,
        text: 'You cannot trade your last personal card.',
      };
    }
    if (!!lockedCards[0]) {
      return {
        isDisabled: false,
        text: `You have ${character.name} locked for a trade.`,
      };
    }
    return {
      isDisabled: false,
      text: `Lock ${character.name} to make trade offer.`,
    };
  }, [
    character,
    lockedCards,
    myCharacterCardCounter,
    myParty,
    mySelectedCard,
    selectedCharacterParty,
  ]);

  const otherLockButtonDetails = useMemo(() => {
    if (!(myParty && selectedCharacter && selectedCharacterParty)) {
      return {
        isDisabled: true,
        text: 'Loading...',
      };
    }
    if (
      selectedCharacterParty[otherSelectedCard - 1].character.id ===
        myParty[1]?.character.id ||
      selectedCharacterParty[otherSelectedCard - 1].character.id ===
        myParty[2]?.character.id
    ) {
      return {
        isDisabled: true,
        text: 'You cannot request a card that you already have.',
      };
    }
    if (
      otherSelectedCard === 1 &&
      selectedCharacterCardCounter === 1 &&
      selectedCharacter
    ) {
      return {
        isDisabled: true,
        text: `${selectedCharacter.name} cannot trade their last personal card.`,
      };
    }
    if (!!lockedCards[1]) {
      return {
        isDisabled: false,
        text: `You have ${selectedCharacter.name} locked for a trade.`,
      };
    }
    return {
      isDisabled: false,
      text: `Lock ${selectedCharacter.name} to make trade offer.`,
    };
  }, [
    lockedCards,
    otherSelectedCard,
    myParty,
    selectedCharacter,
    selectedCharacterParty,
    selectedCharacterCardCounter,
  ]);

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
      <ModalContent h="100vh" m={0} maxH="100vh" minW="100%" w="100%">
        <ModalHeader>
          <Text textAlign="left" textTransform="initial" fontWeight="500">
            Trade Table
          </Text>
          <ModalCloseButton size="lg" />
        </ModalHeader>
        <ModalBody>
          {!pauseControls && (
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
                  {selectedCharacter.name} is locked in for trade. Please select
                  a card from your party.
                </Text>
              )}
              {!!lockedCards[0] && !!lockedCards[1] && (
                <Text textAlign="center">
                  {character.name} and {selectedCharacter.name} are locked in
                  for a trade.
                </Text>
              )}
              {isLastTradeCanceled && (
                <Text align="center" color="orange" fontSize="sm">
                  Your last trade was canceled. You can make a new offer.
                </Text>
              )}
              {isLastTradeRejected && (
                <Text align="center" color="orange" fontSize="sm">
                  Your last trade was rejected. You can make a new offer.
                </Text>
              )}
              <Button
                isDisabled={!(lockedCards[0] && lockedCards[1]) || isPending}
                isLoading={isPending}
                loadingText="Making Offer..."
                onClick={onMakeOffer}
                size="sm"
              >
                Make Offer
              </Button>
            </VStack>
          )}
          {isTradeRequestActive && (
            <VStack mb={8} spacing={4}>
              <Text textAlign="center">
                You can accept or reject this trade offer.
              </Text>
              <HStack>
                <Button
                  isDisabled={isRejecting}
                  isLoading={isRejecting}
                  loadingText="Rejecting Offer..."
                  onClick={onRejectOffer}
                  size="xs"
                >
                  Reject
                </Button>
                <Button
                  isDisabled={isPending}
                  isLoading={isPending}
                  loadingText="Accepting Offer..."
                  onClick={onAcceptOffer}
                  size="sm"
                  variant="solid"
                >
                  Accept
                </Button>
              </HStack>
            </VStack>
          )}
          {isTradeOfferActive && (
            <VStack mb={8} spacing={4}>
              <Text textAlign="center">
                Trade is active, but you can cancel by clicking below.
              </Text>
              <Button
                isDisabled={isPending}
                isLoading={isPending}
                loadingText="Cancelling Offer..."
                onClick={onCancelOffer}
                size="sm"
              >
                Cancel
              </Button>
            </VStack>
          )}
          <HStack alignItems="flex-start" spacing={24}>
            <Box w="100%">
              <Text>Your party:</Text>
              <Grid gap={4} mt={4} templateColumns="repeat(3, 1fr)">
                {partyCharacters[character.id].map((character, i) => (
                  <Box
                    key={`${character.id}-${i}`}
                    onClick={() =>
                      !!lockedCards[0] ? undefined : setMySelectedCard(i + 1)
                    }
                    w="100%"
                  >
                    <CharacterCardSmall
                      cardCount={i === 0 ? myCharacterCardCounter : undefined}
                      character={character}
                      isSelected={i + 1 === mySelectedCard}
                      locked={!!lockedCards[0] && lockedCards[0] !== i + 1}
                      selectedClassId={myParty ? myParty[i]?.class : '-1'}
                    />
                  </Box>
                ))}
                {partyCharacters[character.id] &&
                  partyCharacters[character.id].length < 3 &&
                  new Array(3 - (partyCharacters[character.id]?.length ?? 0))
                    .fill(0)
                    .map((_, i) => (
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
              {!pauseControls && (
                <VStack my={8} spacing={4}>
                  <Text>{myLockButtonDetails.text}</Text>
                  <Button
                    isDisabled={myLockButtonDetails.isDisabled}
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
              )}
              <Text mt={pauseControls ? 8 : 0}>
                {character.name}&apos;s classes:
              </Text>
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
              <Text>{selectedCharacter.name}&apos;s party:</Text>
              <Grid gap={4} mt={4} templateColumns="repeat(3, 1fr)">
                {partyCharacters[selectedCharacter.id].map((character, i) => (
                  <Box
                    key={`${character.id}-${i}`}
                    onClick={() =>
                      !!lockedCards[1] ? undefined : setOtherSelectedCard(i + 1)
                    }
                    w="100%"
                  >
                    <CharacterCardSmall
                      cardCount={
                        i === 0 ? selectedCharacterCardCounter : undefined
                      }
                      character={character}
                      isSelected={i + 1 === otherSelectedCard}
                      locked={!!lockedCards[1] && lockedCards[1] !== i + 1}
                      selectedClassId={
                        selectedCharacterParty
                          ? selectedCharacterParty[i]?.class
                          : '-1'
                      }
                    />
                  </Box>
                ))}
                {partyCharacters[selectedCharacter.id] &&
                  partyCharacters[selectedCharacter.id].length < 3 &&
                  new Array(
                    3 - (partyCharacters[selectedCharacter.id]?.length ?? 0),
                  )
                    .fill(0)
                    .map((_, i) => (
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
              {!pauseControls && (
                <VStack my={8} spacing={4}>
                  <Text>{otherLockButtonDetails.text}</Text>
                  <Button
                    isDisabled={otherLockButtonDetails.isDisabled}
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
              )}
              <Text mt={pauseControls ? 8 : 0}>
                {selectedCharacter.name}&apos;s classes:
              </Text>
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
