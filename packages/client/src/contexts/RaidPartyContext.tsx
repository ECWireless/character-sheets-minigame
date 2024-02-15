import { useDisclosure } from '@chakra-ui/react';
import { useComponentValue } from '@latticexyz/react';
import { getComponentValue, getComponentValueStrict } from '@latticexyz/recs';
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
import { useToast } from '../hooks/useToast';
import {
  CLASS_STATS,
  DEFAULT_CHARACTER_HEALTH,
  WEARABLE_STATS,
} from '../utils/constants';
import { getPlayerEntity } from '../utils/helpers';
import { Character, EquippableTraitType, Stats } from '../utils/types';

type Slot = {
  character: Character;
  class: string;
};

type RaidPartyContextType = {
  battleInfo: {
    active: boolean;
    healthBySlots: [number, number, number];
    molochId: string;
    molochHealth: number;
    molochDefeated: boolean;
  } | null;
  equippedWeapons: {
    [characterId: string]: Character['equippedItems'];
  } | null;
  equippedWearable: {
    [characterId: string]: Character['equippedItems'][0] | null;
  } | null;
  getCharacterStats: (character: Character, classValue: string) => Stats;
  isBattleInitiationModalOpen: boolean;
  isBattleModalOpen: boolean;
  isInitiatingBattle: boolean;
  isMyCharacterSelected: boolean;
  isMyTurn: boolean;
  isRaidPartyModalOpen: boolean;
  isRunning: boolean;
  isTradeTableModalOpen: boolean;
  myCharacterCardCounter: number;
  myParty: Slot[] | null;
  onCloseBattleInitiationModal: () => void;
  onCloseBattleModal: () => void;
  onCloseRaidPartyModal: () => void;
  onCloseTradeTableModal: () => void;
  onInitiateBattle: () => void;
  onOpenBattleInitiationModal: () => void;
  onOpenBattleModal: (character: Character | null) => void;
  onOpenRaidPartyModal: (character: Character | null) => void;
  onOpenTradeTableModal: (character: Character) => void;
  onRunFromBattle: () => void;
  resetSelectedCharacter: () => void;
  selectedCharacter: Character | null;
  selectedCharacterCardCounter: number;
  selectedCharacterParty: Slot[] | null;
  wearableBonuses: {
    [characterId: string]: Omit<Stats, 'health'>;
  } | null;
};

const RaidPartyContext = createContext<RaidPartyContextType>({
  battleInfo: null,
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
  isBattleInitiationModalOpen: false,
  isInitiatingBattle: false,
  isMyCharacterSelected: false,
  isMyTurn: false,
  isRaidPartyModalOpen: false,
  isRunning: false,
  isTradeTableModalOpen: false,
  myCharacterCardCounter: 3,
  myParty: null,
  onCloseBattleInitiationModal: () => {},
  onCloseBattleModal: () => {},
  onCloseRaidPartyModal: () => {},
  onCloseTradeTableModal: () => {},
  onInitiateBattle: () => {},
  onOpenBattleInitiationModal: () => {},
  onOpenBattleModal: () => {},
  onOpenRaidPartyModal: () => {},
  onOpenTradeTableModal: () => {},
  onRunFromBattle: () => {},
  resetSelectedCharacter: () => {},
  selectedCharacter: null,
  selectedCharacterCardCounter: 3,
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
    components: { BattleCounter, BattleInfo, CardCounter, PartyInfo, Position },
    systemCalls: { initiateBattle, runFromBattle },
  } = useMUD();
  const { character, game } = useGame();
  const { renderError, renderWarning } = useToast();

  const battleInitiationModalControls = useDisclosure();
  const battleModalControls = useDisclosure();
  const raidPartyModalControls = useDisclosure();
  const tradeTableModalControls = useDisclosure();

  const [selectedCharacter, setSelectedCharacter] = useState<Character | null>(
    null,
  );
  const [isInitiatingBattle, setIsInitiatingBattle] = useState(false);
  const [isRunning, setIsRunning] = useState(false);

  const gamePlayers = useMemo(() => {
    const characters = game?.characters.map(c => c) ?? [];
    return characters.map(c => c.player.toLowerCase());
  }, [game]);

  const onOpenBattleModal = useCallback(
    (_character: Character | null) => {
      if (!_character) return;
      setSelectedCharacter(_character);
      battleModalControls.onOpen();
    },
    [battleModalControls],
  );

  const onOpenRaidPartyModal = useCallback(
    (_character: Character | null) => {
      if (!(address && gamePlayers.includes(address.toLowerCase()))) {
        renderWarning(`You aren't a part of this game!`);
        return;
      }

      if (!_character) {
        setSelectedCharacter(character);
      } else {
        setSelectedCharacter(_character);
      }
      raidPartyModalControls.onOpen();
    },
    [address, character, gamePlayers, raidPartyModalControls, renderWarning],
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

    return party;
  }, [character, game, partyInfo, playerEntity]);

  const myCharacterCardCounter =
    useComponentValue(CardCounter, playerEntity)?.value ?? 3;

  const selectedCharacterParty = useMemo(() => {
    const isModalOpen =
      raidPartyModalControls.isOpen || tradeTableModalControls.isOpen;

    if (!(isModalOpen && selectedCharacter && selectedCharacterEntity))
      return null;

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

    return party;
  }, [
    game,
    PartyInfo,
    raidPartyModalControls.isOpen,
    selectedCharacter,
    selectedCharacterEntity,
    tradeTableModalControls.isOpen,
  ]);

  const selectedCharacterCardCounter =
    useComponentValue(CardCounter, selectedCharacterEntity)?.value ?? 3;

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
    if (!(myParty && selectedCharacter)) return null;

    const _equippedWeapons = {} as {
      [characterId: string]: Character['equippedItems'];
    };

    myParty.forEach(slot => {
      if (slot?.character) {
        _equippedWeapons[slot.character.id] = getEquippedWeapons(
          slot.character,
        );
      }
    });

    return {
      ..._equippedWeapons,
      [selectedCharacter.id]: getEquippedWeapons(selectedCharacter),
    };
  }, [getEquippedWeapons, myParty, selectedCharacter]);

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
    if (!(character && myParty && selectedCharacter)) return null;

    const _equippedWearable = {} as {
      [characterId: string]: Character['equippedItems'][0] | null;
    };

    myParty.forEach(slot => {
      if (slot?.character) {
        _equippedWearable[slot.character.id] = getEquippedWearable(
          slot.character,
        );
      }
    });

    return {
      ..._equippedWearable,
      [selectedCharacter.id]: getEquippedWearable(selectedCharacter),
    };
  }, [character, getEquippedWearable, myParty, selectedCharacter]);

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
    if (!(character && myParty && selectedCharacter)) return null;

    const _wearableBonuses = {} as {
      [characterId: string]: Omit<Stats, 'health'>;
    };

    myParty.forEach(slot => {
      if (slot?.character) {
        _wearableBonuses[slot.character.id] = getWearableBonuses(
          slot.character,
        );
      }
    });

    return {
      ..._wearableBonuses,
      [selectedCharacter.id]: getWearableBonuses(selectedCharacter),
    };
  }, [character, getWearableBonuses, myParty, selectedCharacter]);

  const getCharacterStats = useCallback(
    (_character: Character, classValue: string): Stats => {
      const selectedClass = Number(classValue);
      const classStats = CLASS_STATS[selectedClass];
      const { attack, defense, specialAttack, specialDefense } =
        classStats ?? {};

      if (wearableBonuses && wearableBonuses[_character.id] && classStats) {
        return {
          health: DEFAULT_CHARACTER_HEALTH,
          attack: attack + wearableBonuses[_character.id].attack,
          defense: defense + wearableBonuses[_character.id].defense,
          specialAttack:
            specialAttack + wearableBonuses[_character.id].specialAttack,
          specialDefense:
            specialDefense + wearableBonuses[_character.id].specialDefense,
        };
      } else if (classStats) {
        return {
          health: DEFAULT_CHARACTER_HEALTH,
          attack,
          defense,
          specialAttack,
          specialDefense,
        };
      }
      return {
        health: DEFAULT_CHARACTER_HEALTH,
        attack: 1,
        defense: 1,
        specialAttack: 1,
        specialDefense: 1,
      };
    },
    [wearableBonuses],
  );

  const onInitiateBattle = useCallback(async () => {
    try {
      setIsInitiatingBattle(true);
      if (!address) {
        throw new Error('No player address');
      }

      const playerEntity = getPlayerEntity(address);
      if (!playerEntity) {
        throw new Error('No player entity');
      }

      const playerPosition = getComponentValueStrict(Position, playerEntity);
      const { x, y, previousX } = playerPosition;

      if (x > previousX) {
        const success = await initiateBattle(address, x + 1, y);

        if (!success) {
          throw new Error('Initiate battle transaction failed');
        }
      } else if (x < previousX) {
        const success = await initiateBattle(address, x - 1, y);

        if (!success) {
          throw new Error('Initiate battle transaction failed');
        }
      }

      battleInitiationModalControls.onClose();
    } catch (e) {
      renderError(e, 'Error initiating battle!');
    } finally {
      setIsInitiatingBattle(false);
    }
  }, [
    address,
    battleInitiationModalControls,
    initiateBattle,
    Position,
    renderError,
  ]);

  const onRunFromBattle = useCallback(async () => {
    try {
      setIsRunning(true);

      if (!address) {
        throw new Error('No player address');
      }

      const playerEntity = getPlayerEntity(address);
      if (!playerEntity) {
        throw new Error('No player entity');
      }

      const success = await runFromBattle(address);
      if (!success) {
        throw new Error('Run from battle transaction failed');
      }

      battleModalControls.onClose();
    } catch (e) {
      renderError(e, 'Error running from battle!');
    } finally {
      setIsRunning(false);
    }
  }, [address, battleModalControls, renderError, runFromBattle]);

  const _battleInfo = useComponentValue(BattleInfo, playerEntity);

  const battleInfo = useMemo(() => {
    if (!playerEntity) return null;
    if (!_battleInfo) return null;

    const {
      active,
      slotOneHealth,
      slotTwoHealth,
      slotThreeHealth,
      molochId,
      molochHealth,
      molochDefeated,
    } = _battleInfo;

    return {
      active,
      healthBySlots: [slotOneHealth, slotTwoHealth, slotThreeHealth] as [
        number,
        number,
        number,
      ],
      molochId,
      molochHealth,
      molochDefeated,
    };
  }, [playerEntity, _battleInfo]);

  const battleCounter = useComponentValue(BattleCounter, playerEntity);

  const isMyTurn = useMemo(() => {
    if (!battleCounter) return false;
    return battleCounter.value % 2 === 1;
  }, [battleCounter]);

  return (
    <RaidPartyContext.Provider
      value={{
        battleInfo,
        equippedWeapons,
        equippedWearable,
        getCharacterStats,
        isBattleInitiationModalOpen: battleInitiationModalControls.isOpen,
        isBattleModalOpen: battleModalControls.isOpen,
        isInitiatingBattle,
        isMyCharacterSelected,
        isMyTurn,
        isRaidPartyModalOpen: raidPartyModalControls.isOpen,
        isRunning,
        isTradeTableModalOpen: tradeTableModalControls.isOpen,
        myCharacterCardCounter,
        myParty,
        onCloseBattleInitiationModal: battleInitiationModalControls.onClose,
        onCloseBattleModal: battleModalControls.onClose,
        onCloseRaidPartyModal: raidPartyModalControls.onClose,
        onCloseTradeTableModal: tradeTableModalControls.onClose,
        onInitiateBattle,
        onOpenBattleInitiationModal: battleInitiationModalControls.onOpen,
        onOpenBattleModal,
        onOpenRaidPartyModal,
        onOpenTradeTableModal,
        onRunFromBattle,
        resetSelectedCharacter,
        selectedCharacter,
        selectedCharacterCardCounter,
        selectedCharacterParty,
        wearableBonuses,
      }}
    >
      {children}
    </RaidPartyContext.Provider>
  );
};
