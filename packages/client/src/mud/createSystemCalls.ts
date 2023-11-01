/*
 * Create the system calls that the client can use to ask
 * for changes in the World state (using the System contracts).
 */

import { Has, HasValue, getComponentValue, runQuery } from "@latticexyz/recs";
import { singletonEntity } from "@latticexyz/store-sync/recs";
import { uuid } from "@latticexyz/utils";
import { Address } from "viem";
import { ClientComponents } from "./createClientComponents";
import { SetupNetworkResult } from "./setupNetwork";

export type SystemCalls = ReturnType<typeof createSystemCalls>;

export function createSystemCalls(
  { worldContract, waitForTransaction, playerEntity }: SetupNetworkResult,
  {
    Health,
    MapConfig,
    MolochSoldier,
    Obstruction,
    Player,
    Position,
  }: ClientComponents
) {
  const attack = async (x: number, y: number) => {
    if (!playerEntity) {
      throw new Error("No player entity");
    }

    const molochSoldierEntities = runQuery([
      Has(MolochSoldier),
      HasValue(Position, { x, y }),
    ]);
    const molochSoldierEntity = Array.from(molochSoldierEntities)[0];
    if (!molochSoldierEntity) {
      console.warn("No moloch soldier to attack");
      return;
    }

    const molochHealth = getComponentValue(Health, molochSoldierEntity);
    if (molochHealth?.value === 0) {
      console.warn("Moloch soldier already dead");
      return;
    }

    const healthId = uuid();
    Health.addOverride(healthId, {
      entity: molochSoldierEntity,
      value: { value: 0 },
    });

    try {
      const tx = await worldContract.write.attack([x, y]);
      await waitForTransaction(tx);
    } finally {
      Health.removeOverride(healthId);
    }
  };

  const wrapPosition = (x: number, y: number) => {
    const mapConfig = getComponentValue(MapConfig, singletonEntity);
    if (!mapConfig) {
      throw new Error("mapConfig no yet loaded or initialized");
    }
    return [
      (x + mapConfig.width) % mapConfig.width,
      (y + mapConfig.height) % mapConfig.height,
    ];
  };

  const isObstructed = (x: number, y: number) => {
    return runQuery([Has(Obstruction), HasValue(Position, { x, y })]).size > 0;
  };

  const logout = async () => {
    if (!playerEntity) {
      throw new Error("No player entity");
    }

    const canLogout = getComponentValue(Player, playerEntity)?.value === true;
    if (!canLogout) {
      throw new Error("Not spawned");
    }

    const playerId = uuid();
    Player.addOverride(playerId, {
      entity: playerEntity,
      value: { value: false },
    });

    try {
      const tx = await worldContract.write.logout();
      await waitForTransaction(tx);
      return getComponentValue(Position, playerEntity);
    } finally {
      Player.removeOverride(playerId);
    }
  };

  const moveTo = async (
    inputX: number,
    inputY: number,
    previousX: number,
    previousY: number
  ) => {
    if (!playerEntity) {
      throw new Error("No player entity");
    }

    const [x, y] = wrapPosition(inputX, inputY);
    if (isObstructed(x, y)) {
      console.warn("cannot move to obstructed space");
      return;
    }

    const positionId = uuid();
    Position.addOverride(positionId, {
      entity: playerEntity,
      value: { x, y, previousX, previousY },
    });

    try {
      const tx = await worldContract.write.move([x, y]);
      await waitForTransaction(tx);
      return getComponentValue(Position, playerEntity);
    } finally {
      Position.removeOverride(positionId);
    }
  };

  const moveBy = async (deltaX: number, deltaY: number) => {
    if (!playerEntity) {
      throw new Error("No player entity");
    }

    const playerPosition = getComponentValue(Position, playerEntity);
    if (!playerPosition) {
      console.warn("Cannot moveBy without a player position. Not yet spawned?");
      return;
    }

    await moveTo(
      playerPosition.x + deltaX,
      playerPosition.y + deltaY,
      playerPosition.x,
      playerPosition.y
    );
  };

  const spawn = async (
    inputX: number,
    inputY: number,
    gameAddress: string,
    playerAddress: string
  ) => {
    if (!playerEntity) {
      throw new Error("No player entity");
    }

    const canSpawn = getComponentValue(Player, playerEntity)?.value !== true;
    if (!canSpawn) {
      throw new Error("already spawned");
    }

    const [x, y] = wrapPosition(inputX, inputY);
    if (isObstructed(x, y)) {
      console.warn("cannot spawn on obstructed space");
      return;
    }

    const positionId = uuid();
    Position.addOverride(positionId, {
      entity: playerEntity,
      value: { x, y },
    });

    const playerId = uuid();
    Player.addOverride(playerId, {
      entity: playerEntity,
      value: { value: true },
    });

    try {
      const tx = await worldContract.write.spawn([
        x,
        y,
        BigInt(5),
        gameAddress.toLowerCase() as Address,
        playerAddress.toLowerCase() as Address,
      ]);
      await waitForTransaction(tx);
      return getComponentValue(Position, playerEntity);
    } finally {
      Position.removeOverride(positionId);
      Player.removeOverride(playerId);
    }
  };

  return {
    attack,
    logout,
    moveTo,
    moveBy,
    spawn,
  };
}
