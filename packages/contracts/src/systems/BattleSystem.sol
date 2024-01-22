// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;
import { System } from "@latticexyz/world/src/System.sol";
import { addressToEntityKey } from "../lib/addressToEntityKey.sol";
import { positionToEntityKey } from "../lib/positionToEntityKey.sol";
import {
  AccountInfo,
  BattleInfo,
  MolochSoldier,
  Player
} from "../codegen/index.sol";

contract BattleSystem is System {
  function attack(address playerAddress, bytes32 molochSoldier, uint32 power) public {
    bytes32 player = addressToEntityKey(playerAddress);
    require(attackChecks(player, molochSoldier), "attack checks failed");

    (, uint32 playerHealth, uint32 playerPower, uint32 playerDefense,, uint32 molochHealth,) = BattleInfo.get(player);

    BattleInfo.set(player, true, playerHealth, playerPower, playerDefense, molochSoldier, molochHealth - power, molochHealth - power <= 0);
  }

  function attackChecks(bytes32 player, bytes32 molochSoldier) internal view returns (bool) {
    require(Player.get(player), "not a player");
    require(MolochSoldier.get(molochSoldier), "not a moloch soldier");

    (address burnerAddress,,) = AccountInfo.get(player);
    require(burnerAddress == address(_msgSender()), "not the burner address for this character");

    (bool active,,,, bytes32 molochId,, bool molochDefeated) = BattleInfo.get(player);
    require(active, "battle not active");
    require(molochId == molochSoldier, "moloch ID does not match moloch soldier");
    require(!molochDefeated, "moloch already defeated");

    return true;
  }

  function initiateBattle(address playerAddress, uint32 x, uint32 y) public {
    bytes32 player = addressToEntityKey(playerAddress);
    bytes32 molochSoldier = positionToEntityKey(x, y);
    require(Player.get(player), "not a player");
    require(MolochSoldier.get(molochSoldier), "not a moloch soldier");

    (address burnerAddress,,) = AccountInfo.get(player);
    require(burnerAddress == address(_msgSender()), "not the burner address for this character");

    // (uint32 playerX, uint32 playerY, ,) = Position.get(player);
    // (uint32 molochSoldierX, uint32 molochSoldierY, ,) = Position.get(molochSoldier);
    
    // require(distance(playerX, playerY, molochSoldierX, molochSoldierY) == 1, "can only initiate battle with adjacent molochs");

    (bool active,,,, bytes32 molochId,, bool molochDefeated) = BattleInfo.get(player);
    require(molochId == molochSoldier, "moloch ID does not match moloch soldier");
    require(!active, "battle already active");
    require(!molochDefeated, "moloch already defeated");
    
    BattleInfo.set(player, true, 10, 10, 10, molochSoldier, 20, false);
  }
}