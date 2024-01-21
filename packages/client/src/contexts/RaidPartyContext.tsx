import { useDisclosure, useToast } from '@chakra-ui/react';
import { useComponentValue } from '@latticexyz/react';
import { getComponentValue } from '@latticexyz/recs';
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

type Slot = {
  character: Character;
  class: string;
};

type RaidPartyContextType = {
  isMyCharacterSelected: boolean;
  isRaidPartyModalOpen: boolean;
  isTradeTableModalOpen: boolean;
  myParty: [Slot, Slot, Slot] | null;
  onCloseRaidPartyModal: () => void;
  onCloseTradeTableModal: () => void;
  onOpenRaidPartyModal: (character: Character | null) => void;
  onOpenTradeTableModal: (character: Character) => void;
  selectedCharacter: Character | null;
  selectedCharacterParty: [Slot, Slot, Slot] | null;
};

const RaidPartyContext = createContext<RaidPartyContextType>({
  isMyCharacterSelected: false,
  isRaidPartyModalOpen: false,
  isTradeTableModalOpen: false,
  myParty: null,
  onCloseRaidPartyModal: () => {},
  onCloseTradeTableModal: () => {},
  onOpenRaidPartyModal: () => {},
  onOpenTradeTableModal: () => {},
  selectedCharacter: null,
  selectedCharacterParty: null,
});

export const useRaidParty = (): RaidPartyContextType =>
  useContext(RaidPartyContext);

export const RaidPartyProvider: React.FC<React.PropsWithChildren> = ({
  children,
}) => {
  const { address } = useAccount();
  const {
    components: { PartyInfo },
  } = useMUD();
  const { character, game } = useGame();
  const toast = useToast();

  const raidPartyModalControls = useDisclosure();
  const tradeTableModalControls = useDisclosure();

  const [selectedCharacter, setSelectedCharacter] = useState<Character | null>(
    null,
  );

  const gamePlayers = useMemo(() => {
    const characters = game?.characters.map(c => c) ?? [];
    return characters.map(c => c.player.toLowerCase());
  }, [game]);

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
  const selectedCharacterEntity = useMemo(() => {
    return getPlayerEntity(selectedCharacter?.player);
  }, [selectedCharacter]);

  const partyInfo = useComponentValue(PartyInfo, playerEntity);

  const myParty = useMemo(() => {
    if (!(character && playerEntity)) return null;

    const defaultSlot = { character: character, class: '-1' };
    if (!partyInfo)
      return [defaultSlot, defaultSlot, defaultSlot] as [Slot, Slot, Slot];

    const allGameCharacters = game?.characters.map(c => c) ?? [];

    const slotOneCharacter = allGameCharacters.find(
      c => c.player.toLowerCase() === partyInfo.slotOne.toLowerCase(),
    );
    const slotOneClass = partyInfo ? partyInfo.slotOneClass.toString() : '-1';

    const slotTwoCharacter = allGameCharacters.find(
      c => c.player.toLowerCase() === partyInfo.slotTwo.toLowerCase(),
    );
    const slotTwoClass = partyInfo ? partyInfo.slotTwoClass.toString() : '-1';

    const slotThreeCharacter = allGameCharacters.find(
      c => c.player.toLowerCase() === partyInfo.slotThree.toLowerCase(),
    );
    const slotThreeClass = partyInfo
      ? partyInfo.slotThreeClass.toString()
      : '-1';

    const party = [];
    if (slotOneCharacter) {
      party.push({
        character: slotOneCharacter,
        class: slotOneClass,
      });
    }
    if (slotTwoCharacter) {
      party.push({
        character: slotTwoCharacter,
        class: slotTwoClass,
      });
    }
    if (slotThreeCharacter) {
      party.push({
        character: slotThreeCharacter,
        class: slotThreeClass,
      });
    }

    if (party.length !== 3) return null;

    return party as [Slot, Slot, Slot];
  }, [character, game, partyInfo, playerEntity]);

  const selectedCharacterParty = useMemo(() => {
    if (!(selectedCharacter && selectedCharacterEntity)) return null;

    const partyInfo = getComponentValue(PartyInfo, selectedCharacterEntity);
    if (!partyInfo) return null;

    const allGameCharacters = game?.characters.map(c => c) ?? [];

    const slotOneCharacter = allGameCharacters.find(
      c => c.player.toLowerCase() === partyInfo.slotOne.toLowerCase(),
    );
    const slotOneClass = partyInfo ? partyInfo.slotOneClass.toString() : '-1';

    const slotTwoCharacter = allGameCharacters.find(
      c => c.player.toLowerCase() === partyInfo.slotTwo.toLowerCase(),
    );
    const slotTwoClass = partyInfo ? partyInfo.slotTwoClass.toString() : '-1';

    const slotThreeCharacter = allGameCharacters.find(
      c => c.player.toLowerCase() === partyInfo.slotThree.toLowerCase(),
    );
    const slotThreeClass = partyInfo
      ? partyInfo.slotThreeClass.toString()
      : '-1';

    const party = [];
    if (slotOneCharacter) {
      party.push({
        character: slotOneCharacter,
        class: slotOneClass,
      });
    }
    if (slotTwoCharacter) {
      party.push({
        character: slotTwoCharacter,
        class: slotTwoClass,
      });
    }
    if (slotThreeCharacter) {
      party.push({
        character: slotThreeCharacter,
        class: slotThreeClass,
      });
    }

    if (party.length !== 3) return null;

    return party as [Slot, Slot, Slot];
  }, [game, PartyInfo, selectedCharacter, selectedCharacterEntity]);

  const onOpenTradeTableModal = useCallback(
    (_character: Character) => {
      setSelectedCharacter(_character);
      raidPartyModalControls.onClose();
      tradeTableModalControls.onOpen();
    },
    [raidPartyModalControls, tradeTableModalControls],
  );

  return (
    <RaidPartyContext.Provider
      value={{
        isMyCharacterSelected,
        isRaidPartyModalOpen: raidPartyModalControls.isOpen,
        isTradeTableModalOpen: tradeTableModalControls.isOpen,
        myParty,
        onCloseRaidPartyModal: raidPartyModalControls.onClose,
        onCloseTradeTableModal: tradeTableModalControls.onClose,
        onOpenRaidPartyModal,
        onOpenTradeTableModal,
        selectedCharacter,
        selectedCharacterParty,
      }}
    >
      {children}
    </RaidPartyContext.Provider>
  );
};
