import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { CombinedError } from "urql";

import { useGetGamesQuery } from "../graphql/autogen/types";
import { formatGameMeta } from "../utils/helpers";
import { GameMeta } from "../utils/types";

type GamesContextType = {
  activeGame: GameMeta | null;
  error: CombinedError | undefined;
  games: GameMeta[] | null;
  loading: boolean;
  reload: () => void;
  setActiveGame: (game: GameMeta | null) => void;
};

const GamesContext = createContext<GamesContextType>({
  activeGame: null,
  error: undefined,
  games: null,
  loading: false,
  reload: () => undefined,
  setActiveGame: () => undefined,
});

export const useGamesContext = (): GamesContextType => useContext(GamesContext);

export const GamesProvider = ({ children }: { children: JSX.Element }) => {
  const [games, setGames] = useState<GameMeta[] | null>(null);
  const [activeGame, setActiveGame] = useState<GameMeta | null>(null);
  const [isFormatting, setIsFormatting] = useState(false);
  const [isRefetching, setIsRefetching] = useState(false);

  const [{ data, fetching, error }, reload] = useGetGamesQuery({
    requestPolicy: "cache-and-network",
    variables: {
      limit: 100,
      skip: 0,
    },
  });

  const onSetActiveGame = useCallback(
    (game: GameMeta | null) => {
      setActiveGame(game);
    },
    [setActiveGame]
  );

  const formatGames = useCallback(async () => {
    setIsFormatting(true);
    const formattedGames = await Promise.all(
      data?.games.map((g) => formatGameMeta(g)) ?? []
    );
    setGames(formattedGames);
    setIsFormatting(false);
    setIsRefetching(false);
  }, [data]);

  const refetch = useCallback(async () => {
    setIsRefetching(true);
    reload();
  }, [reload]);

  useEffect(() => {
    if (data?.games) {
      formatGames();
    }
  }, [data, formatGames]);

  return (
    <GamesContext.Provider
      value={{
        activeGame,
        error,
        games,
        loading: fetching || isFormatting || isRefetching,
        reload: refetch,
        setActiveGame: onSetActiveGame,
      }}
    >
      {children}
    </GamesContext.Provider>
  );
};
