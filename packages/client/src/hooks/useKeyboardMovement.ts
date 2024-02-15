import {
  Entity,
  getComponentValue,
  getComponentValueStrict,
  Has,
  HasValue,
  runQuery,
} from '@latticexyz/recs';
import { useCallback, useEffect, useState } from 'react';

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
  'rogue',
  'paladin',
  'monk',
  'hunter',
  'healer',
  'dwarf',
  'cleric',
  'archer',
];

export const useKeyboardMovement = (
  playerAddress: string | undefined,
  characterClass: string,
): {
  actionRunning: boolean;
} => {
  const {
    components: { BattleInfo, MolochSoldier, Position },
    systemCalls: { moveBy },
  } = useMUD();
  const { character } = useGame();
  const { onOpenBattleInitiationModal } = useRaidParty();
  const { renderWarning } = useToast();

  const [actionRunning, setActionRunning] = useState(false);

  const getIsMolochSoldierDead = useCallback(
    (molochEntity: Entity) => {
      const battlesWithThisMoloch = runQuery([
        Has(BattleInfo),
        HasValue(BattleInfo, {
          molochId: molochEntity,
        }),
      ]);

      const battlesWithThisMolochArray = Array.from(battlesWithThisMoloch);
      if (battlesWithThisMolochArray.length > 0) {
        const battleInfo = getComponentValueStrict(
          BattleInfo,
          battlesWithThisMolochArray[0],
        );

        if (battleInfo.molochDefeated) {
          return true;
        }
      }

      return false;
    },
    [BattleInfo],
  );

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

      if (e.key === 'e' || e.key === 'Enter') {
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

          const battleInfo = getComponentValue(BattleInfo, playerEntity);

          if (battleInfo?.molochDefeated) {
            renderWarning(
              'You have already defeated at least one Moloch Soldier.',
            );
            return;
          }

          const isMolochSoldierDead = getIsMolochSoldierDead(
            Array.from(molochSoldierEntities)[0],
          );
          if (isMolochSoldierDead) {
            renderWarning('This Moloch Soldier has already been defeated.');
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

          const battleInfo = getComponentValue(BattleInfo, playerEntity);

          if (battleInfo?.molochDefeated) {
            renderWarning(
              'You have already defeated at least one Moloch Soldier.',
            );
            return;
          }

          const isMolochSoldierDead = getIsMolochSoldierDead(
            Array.from(molochSoldierEntities)[0],
          );
          if (isMolochSoldierDead) {
            renderWarning('This Moloch Soldier has already been defeated.');
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
    BattleInfo,
    character,
    characterClass,
    getIsMolochSoldierDead,
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
