import { useCallback, useEffect, useState } from "react";
import { CombinedError } from "urql";
import { Character } from "../utils/types";
import { formatCharacter } from "../utils/helpers";

import {
  useGetCharactersByGameAddressQuery,
  useGetCharactersByPlayerAddressQuery,
} from "../graphql/autogen/types";

export const useCharacter = (
  playerAddress: string | undefined,
  gameAddress: string | undefined
): {
  character: Character | null;
  loading: boolean;
  error: CombinedError | undefined;
  reload: () => void;
} => {
  const [character, setCharacter] = useState<Character | null>(null);
  const [isFormatting, setIsFormatting] = useState(false);

  const [{ data, fetching, error }, reload] =
    useGetCharactersByPlayerAddressQuery({
      variables: {
        playerAddress: playerAddress?.toLowerCase(),
        gameAddress: gameAddress?.toLowerCase() ?? "",
        limit: 100,
        skip: 0,
      },
    });

  const handleFormatCharacter = useCallback(async () => {
    if (!data?.characters[0]) return;
    setIsFormatting(true);
    const formattedCharacter = await formatCharacter(data.characters[0]);
    setCharacter(formattedCharacter);
    setIsFormatting(false);
  }, [data]);

  useEffect(() => {
    if (data?.characters[0]) {
      handleFormatCharacter();
    }
  }, [data, handleFormatCharacter]);

  if (!data?.characters) {
    return { character: null, loading: fetching, error, reload };
  }

  return {
    character,
    loading: fetching || isFormatting,
    error,
    reload,
  };
};

export const useCharacters = (
  gameAddress: string | undefined
): {
  characters: Character[] | null;
  loading: boolean;
  error: CombinedError | undefined;
  reload: () => void;
} => {
  const [characters, setCharacters] = useState<Character[] | null>(null);
  const [isFormatting, setIsFormatting] = useState(false);

  const [{ data, fetching, error }, reload] =
    useGetCharactersByGameAddressQuery({
      variables: {
        gameAddress: gameAddress?.toLowerCase() ?? "",
        limit: 100,
        skip: 0,
      },
    });

  const handleFormatCharacter = useCallback(async () => {
    if (!data?.characters[0]) return;
    setIsFormatting(true);
    const formattedCharacters = await Promise.all(
      data.characters.map((c) => formatCharacter(c))
    );
    setCharacters(formattedCharacters);
    setIsFormatting(false);
  }, [data]);

  useEffect(() => {
    if (data?.characters[0]) {
      handleFormatCharacter();
    }
  }, [data, handleFormatCharacter]);

  if (!data?.characters) {
    return { characters: null, loading: fetching, error, reload };
  }

  return {
    characters,
    loading: fetching || isFormatting,
    error,
    reload,
  };
};
