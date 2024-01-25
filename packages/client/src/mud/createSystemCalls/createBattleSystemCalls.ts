import { getComponentValue, Has, HasValue, runQuery } from '@latticexyz/recs';
import { Address } from 'viem';

import { getPlayerEntity } from '../../utils/helpers';
import { ClientComponents } from '../createClientComponents';
import { SetupNetworkResult } from '../setupNetwork';

export const createBattleSystemCalls = (
  { worldContract, waitForTransaction }: SetupNetworkResult,
  { BattleInfo, MolochSoldier, Position }: ClientComponents,
  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
) => {
  const attack = async (playerAddress: string, power: number) => {
    try {
      const playerEntity = getPlayerEntity(playerAddress);
      if (!playerEntity) {
        throw new Error('No player entity');
      }

      const battleInfo = getComponentValue(BattleInfo, playerEntity);
      if (!battleInfo?.active) {
        throw new Error('No active battle');
      }

      if (battleInfo?.molochHealth === 0 || battleInfo?.molochDefeated) {
        throw new Error('Moloch soldier already dead');
      }

      const tx = await worldContract.write.attack([
        playerAddress as Address,
        battleInfo.molochId as Address,
        power,
      ]);
      await waitForTransaction(tx);
      return true;
    } catch (e) {
      console.error(e);
      return false;
    }
  };

  const initiateBattle = async (
    playerAddress: string,
    x: number,
    y: number,
  ) => {
    try {
      const playerEntity = getPlayerEntity(playerAddress);
      if (!playerEntity) {
        throw new Error('No player entity');
      }

      const molochSoldierEntities = runQuery([
        Has(MolochSoldier),
        HasValue(Position, { x, y }),
      ]);

      const molochSoldierEntity = Array.from(molochSoldierEntities)[0];
      if (!molochSoldierEntity) {
        throw new Error('No moloch soldier to attack');
      }

      const battleInfo = getComponentValue(BattleInfo, playerEntity);
      if (battleInfo?.active) {
        throw new Error('Battle already active');
      }

      if (battleInfo?.molochHealth === 0 || battleInfo?.molochDefeated) {
        throw new Error('Moloch soldier already dead');
      }

      const tx = await worldContract.write.initiateBattle([
        playerAddress as Address,
        x,
        y,
      ]);
      await waitForTransaction(tx);
      return true;
    } catch (e) {
      console.error(e);
      return false;
    }
  };

  const runFromBattle = async (playerAddress: string) => {
    try {
      const playerEntity = getPlayerEntity(playerAddress);
      if (!playerEntity) {
        throw new Error('No player entity');
      }

      const battleInfo = getComponentValue(BattleInfo, playerEntity);
      if (!battleInfo?.active) {
        throw new Error('No active battle');
      }

      const tx = await worldContract.write.runFromBattle([
        playerAddress as Address,
      ]);
      await waitForTransaction(tx);
      return true;
    } catch (e) {
      console.error(e);
      return false;
    }
  };

  return {
    attack,
    initiateBattle,
    runFromBattle,
  };
};
