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
import { CLASS_STATS, WEARABLE_STATS } from '../utils/constants';
import { getPlayerEntity } from '../utils/helpers';
import { Character, EquippableTraitType, Stats } from '../utils/types';

type Slot = {
  character: Character;
  class: string;
};

type RaidPartyContextType = {
  equippedWeapons: {
    [characterId: string]: Character['equippedItems'];
  } | null;
  equippedWearable: {
    [characterId: string]: Character['equippedItems'][0] | null;
  } | null;
  getCharacterStats: (character: Character, classValue: string) => Stats;
  isBattleModalOpen: boolean;
  isMyCharacterSelected: boolean;
  isRaidPartyModalOpen: boolean;
  isTradeTableModalOpen: boolean;
  myParty: [Slot, Slot, Slot] | null;
  onCloseBattleModal: () => void;
  onCloseRaidPartyModal: () => void;
  onCloseTradeTableModal: () => void;
  onOpenBattleModal: () => void;
  onOpenRaidPartyModal: (character: Character | null) => void;
  onOpenTradeTableModal: (character: Character) => void;
  resetSelectedCharacter: () => void;
  selectedCharacter: Character | null;
  selectedCharacterParty: [Slot, Slot, Slot] | null;
  wearableBonuses: {
    [characterId: string]: Omit<Stats, 'health'>;
  } | null;
};

const RaidPartyContext = createContext<RaidPartyContextType>({
  equippedWeapons: null,
  equippedWearable: null,
  getCharacterStats: () => ({
    health: 0,
    attack: 0,
    defense: 0,
    specialAttack: 0,
    specialDefense: 0,
  }),
  isBattleModalOpen: false,
  isMyCharacterSelected: false,
  isRaidPartyModalOpen: false,
  isTradeTableModalOpen: false,
  myParty: null,
  onCloseBattleModal: () => {},
  onCloseRaidPartyModal: () => {},
  onCloseTradeTableModal: () => {},
  onOpenBattleModal: () => {},
  onOpenRaidPartyModal: () => {},
  onOpenTradeTableModal: () => {},
  resetSelectedCharacter: () => {},
  selectedCharacter: null,
  selectedCharacterParty: null,
  wearableBonuses: null,
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

  const battleModalControls = useDisclosure();
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

  const resetSelectedCharacter = useCallback(() => {
    setSelectedCharacter(null);
  }, []);

  const onOpenTradeTableModal = useCallback(
    (_character: Character) => {
      setSelectedCharacter(_character);
      raidPartyModalControls.onClose();
      tradeTableModalControls.onOpen();
    },
    [raidPartyModalControls, tradeTableModalControls],
  );

  const getEquippedWeapons = useCallback((_character: Character) => {
    const { equippedItems } = _character;

    const equippedWeapons = equippedItems.filter(
      item =>
        item.attributes.find(
          a =>
            a.value === EquippableTraitType.EQUIPPED_ITEM_1 ||
            a.value === EquippableTraitType.EQUIPPED_ITEM_2,
        ) !== undefined,
    );

    return equippedWeapons;
  }, []);

  const equippedWeapons = useMemo(() => {
    if (!(character && selectedCharacter)) return null;

    return {
      [character.id]: getEquippedWeapons(character),
      [selectedCharacter.id]: getEquippedWeapons(selectedCharacter),
    };
  }, [character, getEquippedWeapons, selectedCharacter]);

  const getEquippedWearable = useCallback((_character: Character) => {
    const { equippedItems } = _character;

    const equippedWearable = equippedItems.find(
      item =>
        item.attributes.find(
          a => a.value === EquippableTraitType.EQUIPPED_WEARABLE,
        ) !== undefined,
    );

    return equippedWearable ?? null;
  }, []);

  const equippedWearable = useMemo(() => {
    if (!(character && selectedCharacter)) return null;

    return {
      [character.id]: getEquippedWearable(character),
      [selectedCharacter.id]: getEquippedWearable(selectedCharacter),
    };
  }, [character, getEquippedWearable, selectedCharacter]);

  const getWearableBonuses = useCallback(
    (_character: Character) => {
      const defaultValues = {
        attack: 0,
        defense: 0,
        specialAttack: 0,
        specialDefense: 0,
      };

      const { itemId } = equippedWearable?.[_character.id] ?? {};
      if (!itemId) return defaultValues;

      const numberId = Number(itemId);
      const wearable = WEARABLE_STATS[numberId];
      if (!wearable) return defaultValues;

      return {
        attack: wearable.attack,
        defense: wearable.defense,
        specialAttack: wearable.specialAttack,
        specialDefense: wearable.specialDefense,
      };
    },
    [equippedWearable],
  );

  const wearableBonuses = useMemo(() => {
    if (!(character && selectedCharacter)) return null;

    return {
      [character.id]: getWearableBonuses(character),
      [selectedCharacter.id]: getWearableBonuses(selectedCharacter),
    };
  }, [character, getWearableBonuses, selectedCharacter]);

  const getCharacterStats = useCallback(
    (_character: Character, classValue: string): Stats => {
      if (classValue === '-1') {
        return {
          health: 0,
          attack: 0,
          defense: 0,
          specialAttack: 0,
          specialDefense: 0,
        };
      }

      const selectedClass = Number(classValue);
      const classStats = CLASS_STATS[selectedClass];
      const { attack, defense, specialAttack, specialDefense } = classStats;

      if (wearableBonuses && wearableBonuses[_character.id]) {
        return {
          health: 10,
          attack: attack + wearableBonuses[_character.id].attack,
          defense: defense + wearableBonuses[_character.id].defense,
          specialAttack:
            specialAttack + wearableBonuses[_character.id].specialAttack,
          specialDefense:
            specialDefense + wearableBonuses[_character.id].specialDefense,
        };
      } else {
        return {
          health: 10,
          attack,
          defense,
          specialAttack,
          specialDefense,
        };
      }
    },
    [wearableBonuses],
  );

  return (
    <RaidPartyContext.Provider
      value={{
        equippedWeapons,
        equippedWearable,
        getCharacterStats,
        isBattleModalOpen: battleModalControls.isOpen,
        isMyCharacterSelected,
        isRaidPartyModalOpen: raidPartyModalControls.isOpen,
        isTradeTableModalOpen: tradeTableModalControls.isOpen,
        myParty,
        onCloseBattleModal: battleModalControls.onClose,
        onCloseRaidPartyModal: raidPartyModalControls.onClose,
        onCloseTradeTableModal: tradeTableModalControls.onClose,
        onOpenBattleModal: battleModalControls.onOpen,
        onOpenRaidPartyModal,
        onOpenTradeTableModal,
        resetSelectedCharacter,
        selectedCharacter,
        selectedCharacterParty,
        wearableBonuses,
      }}
    >
      {children}
    </RaidPartyContext.Provider>
  );
};
