import { useDisclosure, useToast } from '@chakra-ui/react';
import { useComponentValue } from '@latticexyz/react';
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from 'react';
import { useAccount } from 'wagmi';

import { useGame } from '../contexts/GameContext';
import { useMUD } from '../contexts/MUDContext';
import { getPlayerEntity } from '../utils/helpers';
import { Character } from '../utils/types';

type RaidPartyContextType = {
  avatarClassId: string;
  isMyCharacterSelected: boolean;
  isRaidPartyModalOpen: boolean;
  onCloseRaidPartyModal: () => void;
  onOpenRaidPartyModal: (character: Character | null) => void;
  selectedCharacter: Character | null;
};

const RaidPartyContext = createContext<RaidPartyContextType>({
  avatarClassId: '-1',
  isMyCharacterSelected: false,
  isRaidPartyModalOpen: false,
  onCloseRaidPartyModal: () => {},
  onOpenRaidPartyModal: () => {},
  selectedCharacter: null,
});

export const useRaidParty = (): RaidPartyContextType =>
  useContext(RaidPartyContext);

export const RaidPartyProvider: React.FC<React.PropsWithChildren> = ({
  children,
}) => {
  const { address } = useAccount();
  const {
    components: { AvatarClass },
  } = useMUD();
  const { character, game } = useGame();
  const toast = useToast();

  const [selectedCharacter, setSelectedCharacter] = useState<Character | null>(
    null,
  );

  const gamePlayers = useMemo(() => {
    const characters = game?.characters.map(c => c) ?? [];
    return characters.map(c => c.player.toLowerCase());
  }, [game]);

  const raidPartyModalControls = useDisclosure();

  const onOpenRaidPartyModal = useCallback(
    (_character: Character | null) => {
      if (!(address && gamePlayers.includes(address.toLowerCase()))) {
        toast({
          title: "You aren't a part of this game!",
          status: 'warning',
          position: 'top',
          duration: 5000,
          isClosable: true,
        });
        return;
      }

      if (!_character) {
        setSelectedCharacter(character);
      } else {
        setSelectedCharacter(_character);
      }
      raidPartyModalControls.onOpen();
    },
    [address, character, gamePlayers, raidPartyModalControls, toast],
  );

  const isMyCharacterSelected = useMemo(() => {
    if (!selectedCharacter || !character) return false;
    return selectedCharacter.id === character.id;
  }, [character, selectedCharacter]);

  const playerEntity = useMemo(() => {
    return getPlayerEntity(address);
  }, [address]);

  const avatarClassId =
    useComponentValue(AvatarClass, playerEntity)?.value?.toString() ?? '-1';

  return (
    <RaidPartyContext.Provider
      value={{
        avatarClassId,
        isMyCharacterSelected,
        isRaidPartyModalOpen: raidPartyModalControls.isOpen,
        onCloseRaidPartyModal: raidPartyModalControls.onClose,
        onOpenRaidPartyModal,
        selectedCharacter,
      }}
    >
      {children}
    </RaidPartyContext.Provider>
  );
};
