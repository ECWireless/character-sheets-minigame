/*
 * Create the system calls that the client can use to ask
 * for changes in the World state (using the System contracts).
 */
import { ClientComponents } from '../createClientComponents';
import { SetupNetworkResult } from '../setupNetwork';
import { createMapSystemCalls } from './createMapSystemCalls';
import { createTradeSystemCalls } from './createTradeSystemCalls';

export type SystemCalls = ReturnType<typeof createSystemCalls>;

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export function createSystemCalls(
  { worldContract, waitForTransaction }: SetupNetworkResult,
  {
    Health,
    MapConfig,
    MolochSoldier,
    Movable,
    Obstruction,
    Player,
    Position,
  }: ClientComponents,
) {
  const {
    attack,
    login,
    logout,
    makeOffer,
    moveTo,
    moveBy,
    updateBurnerWallet,
    removeAvatarClass,
    setAvatarClass,
    spawn,
  } = createMapSystemCalls(
    { worldContract, waitForTransaction } as SetupNetworkResult,
    {
      Health,
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

  return {
    acceptOffer,
    cancelOffer,
    attack,
    login,
    logout,
    makeOffer,
    moveTo,
    moveBy,
    updateBurnerWallet,
    removeAvatarClass,
    rejectOffer,
    setAvatarClass,
    spawn,
  };
}
