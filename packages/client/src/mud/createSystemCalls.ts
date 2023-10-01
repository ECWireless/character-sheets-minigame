/*
 * Create the system calls that the client can use to ask
 * for changes in the World state (using the System contracts).
 */

import { getComponentValue } from "@latticexyz/recs";
import { uuid } from "@latticexyz/utils";
import { ClientComponents } from "./createClientComponents";
import { SetupNetworkResult } from "./setupNetwork";

export type SystemCalls = ReturnType<typeof createSystemCalls>;

export function createSystemCalls(
  /*
   * The parameter list informs TypeScript that:
   *
   * - The first parameter is expected to be a
   *   SetupNetworkResult, as defined in setupNetwork.ts
   *
   * - Out of this parameter, we only care about two fields:
   *   - worldContract (which comes from createContract, see
   *     https://github.com/latticexyz/mud/blob/26dabb34321eedff7a43f3fcb46da4f3f5ba3708/templates/react/packages/client/src/mud/setupNetwork.ts#L31).
   *   - waitForTransaction (which comes from syncToRecs, see
   *     https://github.com/latticexyz/mud/blob/26dabb34321eedff7a43f3fcb46da4f3f5ba3708/templates/react/packages/client/src/mud/setupNetwork.ts#L39).
   *
   * - From the second parameter, which is a ClientComponent,
   *   we only care about Counter. This parameter comes to use
   *   through createClientComponents.ts, but it originates in
   *   syncToRecs (https://github.com/latticexyz/mud/blob/26dabb34321eedff7a43f3fcb46da4f3f5ba3708/templates/react/packages/client/src/mud/setupNetwork.ts#L39).
   */
  { worldContract, waitForTransaction, playerEntity }: SetupNetworkResult,
  { Player, Position }: ClientComponents
) {
  const moveTo = async (x: number, y: number) => {
    if (!playerEntity) {
      throw new Error("No player entity");
    }

    const positionId = uuid();
    Position.addOverride(positionId, {
      entity: playerEntity,
      value: { x, y },
    });

    try {
      const tx = await worldContract.write.move([x, y]);
      await waitForTransaction(tx);
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

    await moveTo(playerPosition.x + deltaX, playerPosition.y + deltaY);
  };

  const spawn = async (x: number, y: number) => {
    if (!playerEntity) {
      throw new Error("No player entity");
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
      const tx = await worldContract.write.spawn([x, y]);
      await waitForTransaction(tx);
    } finally {
      Position.removeOverride(positionId);
      Player.removeOverride(playerId);
    }
  };

  return {
    moveTo,
    moveBy,
    spawn,
  };
}
