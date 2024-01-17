import { HStack, Image, Text, VStack } from '@chakra-ui/react';
import { useEntityQuery } from '@latticexyz/react';
import { getComponentValueStrict, Has, HasValue } from '@latticexyz/recs';
import { useMemo } from 'react';
import { useAccount } from 'wagmi';

import { useGame } from '../contexts/GameContext';
import { useMUD } from '../contexts/MUDContext';
import { useRaidParty } from '../contexts/RaidPartyContext';
import { Character } from '../utils/types';

export const TradeOffers: React.FC = () => {
  const { address } = useAccount();
  const { game } = useGame();
  const {
    components: { TradeInfo },
  } = useMUD();
  const myTradeOffers = useEntityQuery([
    Has(TradeInfo),
    HasValue(TradeInfo, { active: true }),
    HasValue(TradeInfo, { initiatedBy: address }),
  ]).map(entity => {
    const tradeInfo = getComponentValueStrict(TradeInfo, entity);
    return tradeInfo;
  });

  const myTradeRequests = useEntityQuery([
    Has(TradeInfo),
    HasValue(TradeInfo, { active: true }),
    HasValue(TradeInfo, { initiatedWith: address }),
  ]).map(entity => {
    const tradeInfo = getComponentValueStrict(TradeInfo, entity);
    return tradeInfo;
  });

  const offeredToCharacter = useMemo(() => {
    const gameCharacters = game?.characters ?? [];
    const offeredToCharacters = myTradeOffers.map(offer => {
      const character = gameCharacters.find(
        c => c.player.toLowerCase() === offer.initiatedWith.toLowerCase(),
      );
      return character;
    });
    return offeredToCharacters.filter(c => !!c) as Character[];
  }, [game, myTradeOffers]);

  const requestedFromCharacter = useMemo(() => {
    const gameCharacters = game?.characters ?? [];
    const requestedFromCharacters = myTradeRequests.map(offer => {
      const character = gameCharacters.find(
        c => c.player.toLowerCase() === offer.initiatedBy.toLowerCase(),
      );
      return character;
    });
    return requestedFromCharacters.filter(c => !!c) as Character[];
  }, [game, myTradeRequests]);

  return (
    <VStack
      border="2px solid white"
      minH="400px"
      position="fixed"
      right={4}
      spacing={0}
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
        Trade Offers
      </Text>
      {offeredToCharacter.length === 0 &&
        requestedFromCharacter.length === 0 && (
          <Text fontSize="sm" mt={4}>
            No active trades
          </Text>
        )}
      {offeredToCharacter.map((c, i) => {
        return <TradeButton character={c} offer key={`offer-name-${i}`} />;
      })}
      {requestedFromCharacter.map((c, i) => {
        return <TradeButton character={c} key={`request-name-${i}`} />;
      })}
    </VStack>
  );
};

type TradeButtonProps = {
  character: Character;
  offer?: boolean;
};

const TradeButton: React.FC<TradeButtonProps> = ({ character, offer }) => {
  const { onOpenTradeTableModal } = useRaidParty();

  const { name, image } = character;

  return (
    <HStack
      as="button"
      borderBottom="2px solid white"
      onClick={() => onOpenTradeTableModal(character)}
      p={3}
      justify="flex-start"
      w="100%"
      _hover={{
        bg: 'gray.700',
        cursor: 'pointer',
      }}
    >
      <Image alt={name} h="2rem" objectFit="cover" src={image} w="2rem" />
      {offer ? (
        <Text fontSize="xs">Your offer to {name}</Text>
      ) : (
        <Text fontSize="xs">{name}&apos;s offer to you</Text>
      )}
    </HStack>
  );
};
