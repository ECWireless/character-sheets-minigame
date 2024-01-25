import {
  getComponentValueStrict,
  Has,
  HasValue,
  runQuery,
} from '@latticexyz/recs';
import { useEffect, useState } from 'react';

import { useGame } from '../contexts/GameContext';
import { useMUD } from '../contexts/MUDContext';
import { useRaidParty } from '../contexts/RaidPartyContext';
import { getPlayerEntity } from '../utils/helpers';
import { useToast } from './useToast';

const classesWithAttackAbility = [
  'warrior',
  'wizard',
  'tavern keeper',
  'scribe',
  'paladin',
  'monk',
  'healer',
  'archer',
];

export const useKeyboardMovement = (
  playerAddress: string | undefined,
  characterClass: string,
): {
  actionRunning: boolean;
} => {
  const {
    components: { MolochSoldier, Position },
    systemCalls: { moveBy },
  } = useMUD();
  const { character } = useGame();
  const { onOpenBattleInitiationModal } = useRaidParty();
  const { renderWarning } = useToast();

  const [actionRunning, setActionRunning] = useState(false);

  useEffect(() => {
    const listener = (e: KeyboardEvent) => {
      if (!playerAddress) return;
      if (e.key === 'w') {
        moveBy(playerAddress, 0, -1);
      }
      if (e.key === 's') {
        moveBy(playerAddress, 0, 1);
      }
      if (e.key === 'a') {
        moveBy(playerAddress, -1, 0);
      }
      if (e.key === 'd') {
        moveBy(playerAddress, 1, 0);
      }

      if (e.key === 'ArrowUp') {
        moveBy(playerAddress, 0, -1);
      }
      if (e.key === 'ArrowDown') {
        moveBy(playerAddress, 0, 1);
      }
      if (e.key === 'ArrowLeft') {
        moveBy(playerAddress, -1, 0);
      }
      if (e.key === 'ArrowRight') {
        moveBy(playerAddress, 1, 0);
      }

      if (e.key === 'e') {
        const playerEntity = getPlayerEntity(playerAddress);
        if (!playerEntity) return;

        const playerPosition = getComponentValueStrict(Position, playerEntity);
        const { x, y, previousX } = playerPosition;

        if (x > previousX) {
          const molochSoldierEntities = runQuery([
            Has(MolochSoldier),
            HasValue(Position, { x: x + 1, y }),
          ]);

          if (molochSoldierEntities.size === 0) {
            return;
          }
        } else if (x < previousX) {
          const molochSoldierEntities = runQuery([
            Has(MolochSoldier),
            HasValue(Position, { x: x - 1, y }),
          ]);

          if (molochSoldierEntities.size === 0) {
            return;
          }
        }
        if (!classesWithAttackAbility.includes(characterClass)) {
          renderWarning('You must select a non-villager class to attack.');
          return;
        }
        setActionRunning(true);

        setTimeout(() => {
          onOpenBattleInitiationModal();
        }, 500);
      }
    };

    window.addEventListener('keydown', listener);
    return () => window.removeEventListener('keydown', listener);
  }, [
    character,
    characterClass,
    MolochSoldier,
    moveBy,
    onOpenBattleInitiationModal,
    playerAddress,
    Position,
    renderWarning,
  ]);

  useEffect(() => {
    if (!actionRunning) return;
    setTimeout(() => {
      setActionRunning(false);
    }, 500);
  });

  return { actionRunning };
};
