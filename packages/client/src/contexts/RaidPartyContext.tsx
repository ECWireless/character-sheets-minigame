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

type RaidPartyContextType = {
  isMyCharacterSelected: boolean;
  isRaidPartyModalOpen: boolean;
  isTradeTableModalOpen: boolean;
  myAvatarClassId: string;
  myPartyCharacters: [Character, Character, Character] | null;
  onCloseRaidPartyModal: () => void;
  onCloseTradeTableModal: () => void;
  onOpenRaidPartyModal: (character: Character | null) => void;
  onOpenTradeTableModal: () => void;
  selectedCharacter: Character | null;
  selectedCharacterAvatarClassId: string;
  selectedCharacterPartyCharacters: [Character, Character, Character] | null;
};

const RaidPartyContext = createContext<RaidPartyContextType>({
  isMyCharacterSelected: false,
  isRaidPartyModalOpen: false,
  isTradeTableModalOpen: false,
  myAvatarClassId: '-1',
  myPartyCharacters: null,
  onCloseRaidPartyModal: () => {},
  onCloseTradeTableModal: () => {},
  onOpenRaidPartyModal: () => {},
  onOpenTradeTableModal: () => {},
  selectedCharacter: null,
  selectedCharacterAvatarClassId: '-1',
  selectedCharacterPartyCharacters: null,
});

export const useRaidParty = (): RaidPartyContextType =>
  useContext(RaidPartyContext);

export const RaidPartyProvider: React.FC<React.PropsWithChildren> = ({
  children,
}) => {
  const { address } = useAccount();
  const {
    components: { AvatarClass, PartyInfo },
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

  const myAvatarClassId =
    useComponentValue(AvatarClass, playerEntity)?.value?.toString() ?? '-1';
  const selectedCharacterAvatarClassId =
    useComponentValue(
      AvatarClass,
      selectedCharacterEntity,
    )?.value?.toString() ?? '-1';

  const myPartyCharacters = useMemo(() => {
    if (!(character && playerEntity)) return null;

    const partyInfo = getComponentValue(PartyInfo, playerEntity);
    if (!partyInfo) return null;

    const allGameCharacters = game?.characters.map(c => c) ?? [];
    const slotOneCharacter = allGameCharacters.find(
      c => c.player === partyInfo.slotOne,
    );
    const slotTwoCharacter = allGameCharacters.find(
      c => c.player === partyInfo.slotTwo,
    );
    const slotThreeCharacter = allGameCharacters.find(
      c => c.player === partyInfo.slotThree,
    );

    const party = [];
    if (slotOneCharacter) party.push(slotOneCharacter);
    if (slotTwoCharacter) party.push(slotTwoCharacter);
    if (slotThreeCharacter) party.push(slotThreeCharacter);

    if (party.length !== 3) return null;

    return party as [Character, Character, Character];
  }, [character, game, PartyInfo, playerEntity]);

  const selectedCharacterPartyCharacters = useMemo(() => {
    if (!(selectedCharacter && selectedCharacterEntity)) return null;

    const partyInfo = getComponentValue(PartyInfo, selectedCharacterEntity);
    if (!partyInfo) return null;

    const allGameCharacters = game?.characters.map(c => c) ?? [];
    const slotOneCharacter = allGameCharacters.find(
      c => c.player === partyInfo.slotOne,
    );
    const slotTwoCharacter = allGameCharacters.find(
      c => c.player === partyInfo.slotTwo,
    );
    const slotThreeCharacter = allGameCharacters.find(
      c => c.player === partyInfo.slotThree,
    );

    const party = [];
    if (slotOneCharacter) party.push(slotOneCharacter);
    if (slotTwoCharacter) party.push(slotTwoCharacter);
    if (slotThreeCharacter) party.push(slotThreeCharacter);

    if (party.length !== 3) return null;

    return party as [Character, Character, Character];
  }, [game, PartyInfo, selectedCharacter, selectedCharacterEntity]);

  const onOpenTradeTableModal = useCallback(() => {
    raidPartyModalControls.onClose();
    tradeTableModalControls.onOpen();
  }, [raidPartyModalControls, tradeTableModalControls]);

  return (
    <RaidPartyContext.Provider
      value={{
        isMyCharacterSelected,
        isRaidPartyModalOpen: raidPartyModalControls.isOpen,
        isTradeTableModalOpen: tradeTableModalControls.isOpen,
        myAvatarClassId,
        myPartyCharacters,
        onCloseRaidPartyModal: raidPartyModalControls.onClose,
        onCloseTradeTableModal: tradeTableModalControls.onClose,
        onOpenRaidPartyModal,
        onOpenTradeTableModal,
        selectedCharacter,
        selectedCharacterAvatarClassId,
        selectedCharacterPartyCharacters,
      }}
    >
      {children}
    </RaidPartyContext.Provider>
  );
};
