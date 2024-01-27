import { Address } from 'viem';

import { getPlayerEntity } from '../../utils/helpers';
import { SetupNetworkResult } from '../setupNetwork';

export const createTradeSystemCalls = (
  { worldContract, waitForTransaction }: SetupNetworkResult,
  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
) => {
  const acceptOffer = async (initiatedBy: string, initiatedWith: string) => {
    const playerEntity = getPlayerEntity(initiatedBy);
    if (!playerEntity) {
      throw new Error('No player entity');
    }

    const initiatedWithEntity = getPlayerEntity(initiatedWith);
    if (!initiatedWithEntity) {
      throw new Error('No initiatedWith player entity');
    }

    try {
      const tx = await worldContract.write.acceptOffer([
        initiatedBy as Address,
        initiatedWith as Address,
      ]);
      await waitForTransaction(tx);
      return true;
    } catch (e) {
      console.error(e);
      return false;
    }
  };

  const cancelOffer = async (initiatedBy: string, initiatedWith: string) => {
    const playerEntity = getPlayerEntity(initiatedBy);
    if (!playerEntity) {
      throw new Error('No player entity');
    }

    const initiatedWithEntity = getPlayerEntity(initiatedWith);
    if (!initiatedWithEntity) {
      throw new Error('No initiatedWith player entity');
    }

    try {
      const tx = await worldContract.write.cancelOffer([
        initiatedBy as Address,
        initiatedWith as Address,
      ]);
      await waitForTransaction(tx);
      return true;
    } catch (e) {
      console.error(e);
      return false;
    }
  };

  const rejectOffer = async (initiatedBy: string, initiatedWith: string) => {
    const playerEntity = getPlayerEntity(initiatedWith);
    if (!playerEntity) {
      throw new Error('No player entity');
    }

    const initiatedByEntity = getPlayerEntity(initiatedBy);
    if (!initiatedByEntity) {
      throw new Error('No initiatedBy player entity');
    }

    try {
      const tx = await worldContract.write.rejectOffer([
        initiatedBy as Address,
        initiatedWith as Address,
      ]);
      await waitForTransaction(tx);
      return true;
    } catch (e) {
      console.error(e);
      return false;
    }
  };

  return {
    acceptOffer,
    cancelOffer,
    moveTo,
    moveBy,
    rejectOffer,
  };
};
