import { Heading, VStack } from '@chakra-ui/react';

import { GameCard } from '../components/GameCard';
import { useGamesContext } from '../contexts/GamesContext';
import { DEFAULT_CHAIN } from '../lib/web3';

export const LobbyView: React.FC = () => {
  const { games } = useGamesContext();

  return (
    <VStack py={12} spacing={8}>
      <Heading>All Games</Heading>
      <VStack spacing={10} w="80%">
        {games?.map(game => (
          <GameCard
            key={game.id}
            // TODO: Use wagma chainId
            // chainId={chain?.id ?? DEFAULT_CHAIN.id}
            chainId={DEFAULT_CHAIN.id}
            {...game}
          />
        ))}
      </VStack>
    </VStack>
  );
};

export default LobbyView;
