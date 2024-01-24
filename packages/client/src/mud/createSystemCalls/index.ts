/*
 * Create the system calls that the client can use to ask
 * for changes in the World state (using the System contracts).
 */
import { ClientComponents } from '../createClientComponents';
import { SetupNetworkResult } from '../setupNetwork';
import { createBattleSystemCalls } from './createBattleSystemCalls';
import { createMapSystemCalls } from './createMapSystemCalls';
import { createTradeSystemCalls } from './createTradeSystemCalls';

export type SystemCalls = ReturnType<typeof createSystemCalls>;

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export function createSystemCalls(
  { worldContract, waitForTransaction }: SetupNetworkResult,
  {
    BattleInfo,
    MapConfig,
    MolochSoldier,
    Movable,
    Obstruction,
    Player,
    Position,
  }: ClientComponents,
) {
  const {
    login,
    logout,
    makeOffer,
    moveTo,
    moveBy,
    updateBurnerWallet,
    setPartyClasses,
    spawn,
  } = createMapSystemCalls(
    { worldContract, waitForTransaction } as SetupNetworkResult,
    {
      MapConfig,
      MolochSoldier,
      Movable,
      Obstruction,
      Player,
      Position,
    } as ClientComponents,
  );

  const { acceptOffer, cancelOffer, rejectOffer } = createTradeSystemCalls({
    worldContract,
    waitForTransaction,
  } as SetupNetworkResult);

  const { initiateBattle, runFromBattle } = createBattleSystemCalls(
    { worldContract, waitForTransaction } as SetupNetworkResult,
    {
      BattleInfo,
      MapConfig,
      MolochSoldier,
      Movable,
      Obstruction,
      Player,
      Position,
    } as ClientComponents,
  );

  return {
    acceptOffer,
    cancelOffer,
    initiateBattle,
    login,
    logout,
    makeOffer,
    moveTo,
    moveBy,
    updateBurnerWallet,
    rejectOffer,
    runFromBattle,
    setPartyClasses,
    spawn,
  };
}
