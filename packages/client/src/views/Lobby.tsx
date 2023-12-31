import { Heading, VStack } from '@chakra-ui/react';

import { GameCard } from '../components/GameCard';
import { useGamesContext } from '../contexts/GamesContext';

export const LobbyView: React.FC = () => {
  const { allGames } = useGamesContext();

  return (
    <VStack py={12} spacing={8}>
      <Heading>All Games</Heading>
      <VStack spacing={10} w="80%">
        {allGames?.map(game => <GameCard key={game.id} {...game} />)}
      </VStack>
    </VStack>
  );
};

export default LobbyView;
