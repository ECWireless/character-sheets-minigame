import {
  Box,
  Button,
  Grid,
  GridItem,
  HStack,
  Text,
  useDisclosure,
  VStack,
} from '@chakra-ui/react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useAccount } from 'wagmi';

import { useGame } from '../../contexts/GameContext';
import { useMUD } from '../../contexts/MUDContext';
import { useRaidParty } from '../../contexts/RaidPartyContext';
import { useToast } from '../../hooks/useToast';
import {
  DEFAULT_MOLOCH_HEALTH,
  MOLOCH_SOLDIER_MOVES,
  MOLOCH_SOLDIER_STATS,
  POWER_TYPE,
} from '../../utils/constants';
import { generateRandomNumber } from '../../utils/helpers';
import { Stats } from '../../utils/types';
import { CharacterCardSmall } from '../CharacterCard';
import { CharacterStats } from '../CharacterStats';
import { HealthBar } from '../HealthBar';
import { MolochCardSmall } from '../MolochCard';
import { AttackModal } from './AttackModal';
import { MolochDefeatedModal } from './MolochDefeatedModal';
import { MolochWonModal } from './MolochWonModal';

const calculatePlayerDamage = (
  cardStats: Stats,
  moveId: number,
  wearableBonuses: Omit<Stats, 'health'>,
) => {
  const move = MOLOCH_SOLDIER_MOVES[moveId];
  if (!move) return 0;

  const { power, type } = move;

  if (type === POWER_TYPE.ATTACK) {
    const attackStat = MOLOCH_SOLDIER_STATS['attack'];
    const cardDefense = cardStats['attack'];
    const wearableBonus = wearableBonuses['attack'];

    const damage = attackStat + Number(power) - cardDefense - wearableBonus;
    return damage > 0 ? damage : 0;
  } else if (type === POWER_TYPE.SPECIAL_ATTACK) {
    const attackStat = MOLOCH_SOLDIER_STATS['specialAttack'];
    const cardDefense = cardStats['specialAttack'];
    const wearableBonus = wearableBonuses['specialAttack'];

    const damage = attackStat + Number(power) - cardDefense - wearableBonus;
    return damage > 0 ? damage : 0;
  } else {
    return 0;
  }
};

export const BattleModal: React.FC = () => {
  const { address } = useAccount();
  const {
    systemCalls: { molochAttack },
  } = useMUD();

  const { character } = useGame();
  const {
    battleInfo,
    equippedWeapons,
    equippedWearable,
    getCharacterStats,
    isBattleModalOpen: isOpen,
    isMyTurn,
    isRunning,
    myCharacterCardCounter,
    myParty,
    onRunFromBattle,
    wearableBonuses,
  } = useRaidParty();

  const {
    isOpen: isAttackModalOpen,
    onClose: onCloseAttackModal,
    onOpen: onOpenAttackModal,
  } = useDisclosure();
  const molochDefeatedModalControls = useDisclosure();
  const molochWonModalControls = useDisclosure();

  const { renderError, renderWarning } = useToast();

  const [isMolochAttacking, setIsMolochAttacking] = useState(false);
  const [selectedCard, setSelectedCard] = useState(1);

  const cardClass = useMemo(() => {
    if (!(myParty && myParty[selectedCard - 1])) return null;

    return myParty[selectedCard - 1]?.class;
  }, [myParty, selectedCard]);

  const characterStats = useMemo(() => {
    if (!(cardClass && myParty)) return null;

    const _characterStats = {} as Record<string, Stats>;

    myParty.forEach(({ character }) => {
      _characterStats[character.id] = getCharacterStats(character, cardClass);
    });

    return _characterStats;
  }, [cardClass, getCharacterStats, myParty]);

  const onMolochAttack = useCallback(async () => {
    try {
      if (!address) throw new Error('No address found');
      if (!battleInfo) throw new Error('No battle info found');
      if (!myParty) throw new Error('No party found');
      if (!characterStats) throw new Error('No character stats found');
      if (!wearableBonuses) throw new Error('No wearable bonuses found');

      setIsMolochAttacking(true);

      const moveId = generateRandomNumber(1, 4);
      let slotIndex = generateRandomNumber(0, 2);

      while (
        battleInfo.healthBySlots[slotIndex] === 0 ||
        !characterStats[myParty[slotIndex]?.character.id]
      ) {
        slotIndex = generateRandomNumber(0, 2);
      }

      const damage = calculatePlayerDamage(
        characterStats[myParty[slotIndex].character.id],
        moveId,
        wearableBonuses[myParty[slotIndex].character.id],
      );

      const success = await molochAttack(address, slotIndex, damage);
      if (!success) {
        throw new Error('Attack failed');
      }

      renderWarning(
        `Moloch Soldier used ${MOLOCH_SOLDIER_MOVES[moveId].name}! You received ${damage} damage!`,
      );
    } catch (e) {
      renderError(e, 'Error with Moloch Soldier attack!');
    } finally {
      setIsMolochAttacking(false);
    }
  }, [
    address,
    battleInfo,
    characterStats,
    molochAttack,
    myParty,
    renderError,
    renderWarning,
    wearableBonuses,
  ]);

  useEffect(() => {
    if (!(battleInfo && isOpen)) return;

    const molochHealth = battleInfo.molochHealth ?? 0;
    const totalSlotsHealth = battleInfo.healthBySlots.reduce(
      (acc, curr) => acc + curr,
      0,
    );

    if (molochHealth <= 0 && !battleInfo.active) {
      molochDefeatedModalControls.onOpen();
    }

    if (totalSlotsHealth <= 0 && !battleInfo.active) {
      molochWonModalControls.onOpen();
    } else {
      setSelectedCard(prev => {
        if (battleInfo.healthBySlots[prev - 1] <= 0 && prev === 1) {
          return 2;
        }
        if (battleInfo.healthBySlots[prev - 1] <= 0 && prev === 2) {
          return 3;
        }
        if (battleInfo.healthBySlots[prev - 1] <= 0 && prev === 3) {
          return 1;
        }
        return prev;
      });
    }
  }, [battleInfo, isOpen, molochDefeatedModalControls, molochWonModalControls]);

  if (
    !(
      isOpen &&
      cardClass &&
      character &&
      characterStats &&
      equippedWeapons &&
      equippedWearable &&
      myParty &&
      wearableBonuses
    )
  )
    return null;

  const isDisabled = isRunning || isMolochAttacking;

  return (
    <Box
      background="cardBG"
      h="100%"
      minH="100vh"
      p={10}
      pos="absolute"
      top={0}
      w="100%"
      zIndex={1000}
    >
      <Text
        fontSize="2xl"
        fontWeight="500"
        textAlign="center"
        textTransform="initial"
      >
        BATTLE
      </Text>
      <Text color="orange" mb={8} textAlign="center">
        It is {!isMyTurn && 'not'} your turn
      </Text>
      <Grid gap={6} templateColumns="repeat(5, 1fr)">
        <GridItem colSpan={3}>
          <Text>Your character cards:</Text>
          <Grid gap={6} mt={4} templateColumns="repeat(3, 1fr)">
            {myParty?.map(({ character }, i) => {
              const locked = battleInfo?.healthBySlots[i] === 0;
              return (
                <GridItem key={`${character.id}-${i}`}>
                  <VStack
                    onClick={() =>
                      locked ? undefined : setSelectedCard(i + 1)
                    }
                    w="250px"
                  >
                    <HealthBar
                      currentHealth={battleInfo?.healthBySlots[i] ?? 0}
                      startingHealth={characterStats[character.id]?.health ?? 0}
                    />
                    <CharacterCardSmall
                      cardCount={i === 0 ? myCharacterCardCounter : undefined}
                      character={character}
                      isSelected={i + 1 === selectedCard}
                      locked={locked}
                      selectedClassId={myParty ? myParty[i].class : '-1'}
                    />
                  </VStack>
                </GridItem>
              );
            })}
            {myParty &&
              myParty.length < 3 &&
              new Array(3 - (myParty?.length ?? 0)).fill(0).map((_, i) => (
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
        </GridItem>
        <GridItem colSpan={1}>
          <Box h="100%" pos="relative">
            <Text
              color="rgba(219, 211, 139, 0.75)"
              fontSize="4xl"
              fontWeight={500}
              left="50%"
              pos="absolute"
              top="50%"
              transform="translate(-50%, -50%)"
            >
              VS
            </Text>
            <Box
              left="50%"
              pos="absolute"
              top={10}
              transform="translateX(-50%)"
              w="100%"
            >
              {isMyTurn ? (
                <Button
                  isDisabled={isDisabled}
                  onClick={onOpenAttackModal}
                  variant="solid"
                  w="100%"
                >
                  Attack
                </Button>
              ) : (
                <Button
                  isDisabled={isDisabled}
                  isLoading={isMolochAttacking}
                  loadingText="Moloch attacking..."
                  onClick={onMolochAttack}
                  variant="solid"
                  w="100%"
                >
                  Next
                </Button>
              )}
            </Box>
            <Box
              bottom={0}
              left="50%"
              pos="absolute"
              transform="translateX(-50%)"
            >
              <Button
                fontSize="xs"
                isDisabled={isDisabled}
                isLoading={isRunning}
                loadingText="Running..."
                onClick={onRunFromBattle}
              >
                Run
              </Button>
            </Box>
          </Box>
        </GridItem>
        <GridItem colSpan={1}>
          <Text>Moloch Soldier:</Text>
          <HStack alignItems="flex-start" mt={4} spacing={4}>
            <VStack w="250px">
              <HealthBar
                currentHealth={battleInfo?.molochHealth ?? 0}
                startingHealth={DEFAULT_MOLOCH_HEALTH}
              />
              <MolochCardSmall />
            </VStack>
          </HStack>
        </GridItem>
      </Grid>

      <CharacterStats
        avatarClassId={cardClass}
        characterStats={characterStats[myParty[selectedCard - 1]?.character.id]}
        equippedWearable={
          equippedWearable[myParty[selectedCard - 1]?.character.id]
        }
        wearableBonuses={
          wearableBonuses[myParty[selectedCard - 1]?.character.id]
        }
      />

      <AttackModal
        characterStats={characterStats[myParty[selectedCard - 1]?.character.id]}
        equippedWeapons={
          equippedWeapons[myParty[selectedCard - 1]?.character.id]
        }
        isOpen={isAttackModalOpen}
        onClose={onCloseAttackModal}
        wearableBonuses={
          wearableBonuses[myParty[selectedCard - 1]?.character.id]
        }
      />

      <MolochDefeatedModal
        isOpen={molochDefeatedModalControls.isOpen}
        onClose={molochDefeatedModalControls.onClose}
      />

      <MolochWonModal
        isOpen={molochWonModalControls.isOpen}
        onClose={molochWonModalControls.onClose}
      />
    </Box>
  );
};
