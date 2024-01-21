import { getComponentValue, Has, HasValue, runQuery } from '@latticexyz/recs';
import { singletonEntity } from '@latticexyz/store-sync/recs';
import { uuid } from '@latticexyz/utils';
import { Address } from 'viem';

import { getPlayerEntity } from '../../utils/helpers';
import { ClientComponents } from '../createClientComponents';
import { SetupNetworkResult } from '../setupNetwork';

export const createMapSystemCalls = (
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
  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
) => {
  const attack = async (playerAddress: string, x: number, y: number) => {
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
      // eslint-disable-next-line no-console
      console.warn('No moloch soldier to attack');
      return;
    }

    const molochHealth = getComponentValue(Health, molochSoldierEntity);
    if (molochHealth?.value === 0) {
      // eslint-disable-next-line no-console
      console.warn('Moloch soldier already dead');
      return;
    }

    const healthId = uuid();
    Health.addOverride(healthId, {
      entity: molochSoldierEntity,
      value: { value: 0 },
    });

    try {
      const tx = await worldContract.write.attack([
        playerAddress as Address,
        x,
        y,
      ]);
      await waitForTransaction(tx);
    } finally {
      Health.removeOverride(healthId);
    }
  };

  const isObstructed = (x: number, y: number) => {
    return runQuery([Has(Obstruction), HasValue(Position, { x, y })]).size > 0;
  };

  const login = async (
    chainId: number,
    gameAddress: string,
    playerAddress: string,
    signature: `0x${string}`,
  ) => {
    const playerEntity = getPlayerEntity(playerAddress);
    if (!playerEntity) {
      throw new Error('No player entity');
    }

    try {
      const tx = await worldContract.write.login([
        BigInt(chainId),
        gameAddress.toLowerCase() as Address,
        playerAddress.toLowerCase() as Address,
        signature,
      ]);
      await waitForTransaction(tx);
    } catch (e) {
      console.error(e);
    }
  };

  const logout = async (playerAddress: string) => {
    const playerEntity = getPlayerEntity(playerAddress);
    if (!playerEntity) {
      throw new Error('No player entity');
    }

    const canLogout = getComponentValue(Player, playerEntity)?.value === true;
    if (!canLogout) {
      throw new Error('No account created');
    }

    const playerId = uuid();
    Player.addOverride(playerId, {
      entity: playerEntity,
      value: { value: false },
    });

    try {
      const tx = await worldContract.write.logout([playerAddress as Address]);
      await waitForTransaction(tx);
      return getComponentValue(Position, playerEntity);
    } finally {
      Player.removeOverride(playerId);
    }
  };

  const makeOffer = async (
    initiatedBy: string,
    initiatedWith: string,
    offeredCardPlayer: string,
    requestedCardPlayer: string,
  ) => {
    const playerEntity = getPlayerEntity(initiatedBy);
    if (!playerEntity) {
      throw new Error('No player entity');
    }

    const initiatedWithEntity = getPlayerEntity(initiatedWith);
    if (!initiatedWithEntity) {
      throw new Error('No initiatedWith player entity');
    }

    try {
      const tx = await worldContract.write.makeOffer([
        initiatedBy as Address,
        initiatedWith as Address,
        offeredCardPlayer as Address,
        requestedCardPlayer as Address,
      ]);
      await waitForTransaction(tx);
      return true;
    } catch (e) {
      console.error(e);
      return false;
    }
  };

  const moveBy = async (
    playerAddress: string,
    deltaX: number,
    deltaY: number,
  ) => {
    const playerEntity = getPlayerEntity(playerAddress);
    if (!playerEntity) {
      throw new Error('No player entity');
    }

    const playerPosition = getComponentValue(Position, playerEntity);
    if (!playerPosition) {
      // eslint-disable-next-line no-console
      console.warn('Cannot moveBy without a player position. Not yet spawned?');
      return;
    }

    await moveTo(
      playerAddress,
      playerPosition.x + deltaX,
      playerPosition.y + deltaY,
      playerPosition.x,
      playerPosition.y,
    );
  };

  const moveTo = async (
    playerAddress: string,
    inputX: number,
    inputY: number,
    previousX: number,
    previousY: number,
  ) => {
    const playerEntity = getPlayerEntity(playerAddress);
    if (!playerEntity) {
      throw new Error('No player entity');
    }

    const [x, y] = wrapPosition(inputX, inputY);
    if (isObstructed(x, y)) {
      // eslint-disable-next-line no-console
      console.warn('cannot move to obstructed space');
      return;
    }

    const positionId = uuid();
    Position.addOverride(positionId, {
      entity: playerEntity,
      value: { x, y, previousX, previousY },
    });

    try {
      const tx = await worldContract.write.move([
        playerAddress as Address,
        x,
        y,
      ]);
      await waitForTransaction(tx);
    } finally {
      Position.removeOverride(positionId);
    }
  };

  const updateBurnerWallet = async (
    playerAddress: string,
    signature: `0x${string}`,
  ) => {
    const playerEntity = getPlayerEntity(playerAddress);
    if (!playerEntity) {
      throw new Error('No player entity');
    }

    const canChangeBurnerWallet =
      getComponentValue(Player, playerEntity)?.value === true;
    if (!canChangeBurnerWallet) {
      throw new Error('No account created');
    }

    try {
      const tx = await worldContract.write.updateBurnerWallet([
        playerAddress.toLowerCase() as Address,
        signature,
      ]);
      await waitForTransaction(tx);
    } catch (e) {
      console.error(e);
    }
  };

  const setPartyClasses = async (playerAddress: string, classIds: string[]) => {
    try {
      const tx = await worldContract.write.setPartyClasses([
        playerAddress.toLowerCase() as Address,
        classIds,
      ]);
      await waitForTransaction(tx);
      return true;
    } catch (e) {
      console.error(e);
      return false;
    }
  };

  const spawn = async (
    playerAddress: string,
    inputX: number,
    inputY: number,
  ) => {
    const playerEntity = getPlayerEntity(playerAddress);
    if (!playerEntity) {
      throw new Error('No player entity');
    }

    const canSpawn = getComponentValue(Movable, playerEntity)?.value !== true;
    if (!canSpawn) {
      throw new Error('already spawned');
    }

    const [x, y] = wrapPosition(inputX, inputY);
    if (isObstructed(x, y)) {
      // eslint-disable-next-line no-console
      console.warn('cannot spawn on obstructed space');
      return;
    }

    try {
      const tx = await worldContract.write.spawn([
        playerAddress.toLowerCase() as Address,
        x,
        y,
      ]);
      await waitForTransaction(tx);
    } catch (e) {
      console.error(e);
    }
  };

  const wrapPosition = (x: number, y: number) => {
    const mapConfig = getComponentValue(MapConfig, singletonEntity);
    if (!mapConfig) {
      throw new Error('mapConfig no yet loaded or initialized');
    }
    return [
      (x + mapConfig.width) % mapConfig.width,
      (y + mapConfig.height) % mapConfig.height,
    ];
  };

  return {
    attack,
    login,
    logout,
    makeOffer,
    moveTo,
    moveBy,
    updateBurnerWallet,
    setPartyClasses,
    spawn,
  };
};
