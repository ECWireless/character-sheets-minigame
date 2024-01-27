import { HStack, Image, Text, VStack } from '@chakra-ui/react';
import { useEntityQuery } from '@latticexyz/react';
import { Has, HasValue } from '@latticexyz/recs';
import { decodeEntity } from '@latticexyz/store-sync/recs';
import { useMemo } from 'react';

import { useGame } from '../contexts/GameContext';
import { useMUD } from '../contexts/MUDContext';
import { useRaidParty } from '../contexts/RaidPartyContext';
import { Character } from '../utils/types';

export const Leaderboard: React.FC = () => {
  const { game } = useGame();
  const {
    components: { BattleInfo },
  } = useMUD();

  const battleWinnersByAddress = useEntityQuery([
    Has(BattleInfo),
    HasValue(BattleInfo, { molochDefeated: true }),
  ]).map(entity => decodeEntity({ address: 'address' }, entity).address);

  const battleWinners = useMemo(() => {
    if (!game) return [];

    const gameCharacters = game?.characters ?? [];
    const winners = battleWinnersByAddress.map(address => {
      const character = gameCharacters.find(
        c => c.player.toLowerCase() === address.toLowerCase(),
      );
      return character;
    });

    return winners.filter(c => !!c) as Character[];
  }, [battleWinnersByAddress, game]);

  return (
    <VStack
      border="2px solid white"
      left={4}
      minH="400px"
      position="fixed"
      spacing={2}
      top={40}
      w="265px"
    >
      <Text
        align="center"
        borderBottom="2px solid white"
        fontWeight={500}
        p={2}
        w="100%"
      >
        Leaderboard
      </Text>
      {battleWinners.length === 0 && (
        <Text fontSize="sm" mt={4}>
          No winners yet
        </Text>
      )}
      {battleWinners.map((c, i) => {
        return <WinnerButton character={c} key={`winner-${i}`} />;
      })}
    </VStack>
  );
};

type WinnerButtonProps = {
  character: Character;
};

const WinnerButton: React.FC<WinnerButtonProps> = ({ character }) => {
  const { onOpenRaidPartyModal } = useRaidParty();

  const { name, image } = character;

  return (
    <HStack
      as="button"
      borderBottom="2px solid white"
      onClick={() => onOpenRaidPartyModal(character)}
      p={3}
      justify="flex-start"
      w="100%"
      _hover={{
        bg: 'gray.700',
        cursor: 'pointer',
      }}
    >
      <Image alt={name} h="2rem" objectFit="cover" src={image} w="2rem" />
      <Text fontSize="sm">{name}</Text>
    </HStack>
  );
};
