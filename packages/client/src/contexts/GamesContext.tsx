import { createContext, useContext, useMemo } from 'react';
import { useAccount } from 'wagmi';

import { useGames } from '../hooks/useGames';
import { RAIDGUILD_GAME_ADDRESS } from '../utils/constants';
import { GameMeta } from '../utils/types';

type GamesContextType = {
  allGames: GameMeta[] | null;
  myGames: GameMeta[] | null;
  loading: boolean;
  error: Error | undefined;
  reload: () => void;
};

const GamesContext = createContext<GamesContextType>({
  allGames: null,
  myGames: null,
  loading: false,
  error: undefined,
  reload: () => {},
});

export const useGamesContext = (): GamesContextType => useContext(GamesContext);

export const GamesProvider: React.FC<React.PropsWithChildren> = ({
  children,
}) => {
  const { address } = useAccount();

  const { games: allGames, error, loading, reload } = useGames();

  const myGames = useMemo(() => {
    if (!allGames || !address) return null;
    return allGames.filter(
      g =>
        g.owner === address.toLowerCase() ||
        g.admins.includes(address.toLowerCase()) ||
        g.masters.includes(address.toLowerCase()) ||
        g.players.includes(address.toLowerCase()),
    );
  }, [allGames, address]);

  return (
    <GamesContext.Provider
      value={{
        allGames: allGames?.filter(g => g.id === RAIDGUILD_GAME_ADDRESS) ?? [],
        myGames: myGames?.filter(g => g.id === RAIDGUILD_GAME_ADDRESS) ?? [],
        loading,
        error,
        reload,
      }}
    >
      {children}
    </GamesContext.Provider>
  );
};
