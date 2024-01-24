import { Box, Button, Grid, GridItem, HStack, Text } from '@chakra-ui/react';
import { useMemo, useState } from 'react';

import { useGame } from '../../contexts/GameContext';
// import { useAccount } from 'wagmi';
// import { useGame } from '../../contexts/GameContext';
import { useRaidParty } from '../../contexts/RaidPartyContext';
import { CharacterCardSmall } from '../CharacterCard';
import { CharacterStats } from '../CharacterStats';
import { MolochCardSmall } from '../MolochCard';

export const BattleModal: React.FC = () => {
  // const { address } = useAccount();
  const { character } = useGame();
  const {
    equippedWeapons,
    equippedWearable,
    getCharacterStats,
    isBattleModalOpen: isOpen,
    myParty,
    onCloseBattleModal: onClose,
    // selectedCharacter,
    // selectedCharacterParty,
    wearableBonuses,
  } = useRaidParty();

  const [selectedCard, setSelectedCard] = useState(1);

  const cardClass = useMemo(() => {
    if (!(myParty && myParty[selectedCard - 1])) return null;

    return myParty[selectedCard - 1].class;
  }, [myParty, selectedCard]);

  const characterStats = useMemo(() => {
    if (!(cardClass && character)) return null;

    return {
      [character.id]: getCharacterStats(character, cardClass),
    };
  }, [cardClass, character, getCharacterStats]);

  if (
    !(
      isOpen &&
      cardClass &&
      character &&
      characterStats &&
      equippedWeapons &&
      equippedWearable &&
      wearableBonuses
    )
  )
    return <div>Test</div>;

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
        mb={8}
        textAlign="center"
        textTransform="initial"
      >
        BATTLE
      </Text>
      <Grid gap={6} templateColumns="repeat(5, 1fr)">
        <GridItem colSpan={3}>
          <Text>Your character cards:</Text>
          <HStack alignItems="flex-start" mt={4} spacing={4}>
            {myParty?.map(({ character }, i) => (
              <Box
                key={`${character.id}-${i}`}
                onClick={() => setSelectedCard(i + 1)}
                w="250px"
              >
                <CharacterCardSmall
                  character={character}
                  isSelected={i + 1 === selectedCard}
                  primary={i === 0}
                  selectedClassId={myParty ? myParty[i].class : '-1'}
                />
              </Box>
            ))}
          </HStack>
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
              <Button variant="solid" w="100%">
                Attack
              </Button>
            </Box>
            <Box
              bottom={0}
              left="50%"
              pos="absolute"
              transform="translateX(-50%)"
            >
              <Button fontSize="xs" onClick={onClose}>
                Run
              </Button>
            </Box>
          </Box>
        </GridItem>
        <GridItem colSpan={1}>
          <Text>Moloch Soldier:</Text>
          <HStack alignItems="flex-start" mt={4} spacing={4}>
            <Box w="250px">
              <MolochCardSmall />
            </Box>
          </HStack>
        </GridItem>
      </Grid>

      <CharacterStats
        avatarClassId={cardClass}
        characterStats={characterStats[character.id]}
        equippedWearable={equippedWearable[character.id]}
        wearableBonuses={wearableBonuses[character.id]}
      />
    </Box>
  );
};
