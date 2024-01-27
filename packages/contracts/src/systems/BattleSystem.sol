// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;
import { System } from "@latticexyz/world/src/System.sol";
import { addressToEntityKey } from "../lib/addressToEntityKey.sol";
import { positionToEntityKey } from "../lib/positionToEntityKey.sol";
import {
  AccountInfo,
  BattleCounter,
  BattleInfo,
  MolochSoldier,
  Player
} from "../codegen/index.sol";

contract BattleSystem is System {
  function attack(address playerAddress, bytes32 molochSoldier, uint32 damage) public {
    bytes32 player = addressToEntityKey(playerAddress);
    require(attackChecks(player, molochSoldier), "attack checks failed");

    uint32 battleCounter = BattleCounter.get(player);
    require(battleCounter % 2 == 1, "it is not your turn to attack");

    (, uint32 playerHealth, uint32 playerPower, uint32 playerDefense,, uint32 molochHealth,) = BattleInfo.get(player);

    uint32 newMolochHealth = molochHealth;
    bool molochDefeated = false;
    
    if (damage >= molochHealth) {
      newMolochHealth = 0;
      molochDefeated = true;
    } else {
      newMolochHealth = molochHealth - damage;
    }
    BattleInfo.set(player, !molochDefeated, playerHealth, playerPower, playerDefense, molochSoldier, newMolochHealth, molochDefeated);
    BattleCounter.set(player, BattleCounter.get(player) + 1);
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

    (bool active,,,,,, bool molochDefeated) = BattleInfo.get(player);

    require(!active, "you already have an active battle");
    require(!molochDefeated, "you have already defeated at least one moloch soldier");
    
    BattleInfo.set(player, true, 10, 10, 10, molochSoldier, 20, false);
    BattleCounter.set(player, 1);
  }

  function molochAttack(address playerAddress, bytes32 molochSoldier, uint8 slotIndex, uint32 damage) public {
    bytes32 player = addressToEntityKey(playerAddress);
    require(attackChecks(player, molochSoldier), "attack checks failed");

    uint32 battleCounter = BattleCounter.get(player);
    require(battleCounter % 2 == 0, "it is not the moloch's turn to attack");

    (, uint32 slotOneHealth, uint32 slotTwoHealth, uint32 slotThreeHealth,, uint32 molochHealth,) = BattleInfo.get(player);

    uint32 newSlotHealth = slotOneHealth;

    if (slotIndex == 0) {
      if (slotOneHealth == 0) {
        slotIndex = 1;
      } else {
        if (damage >= slotOneHealth) {
          newSlotHealth = 0;
        } else {
          newSlotHealth = slotOneHealth - damage;
        }
        BattleInfo.set(player, true, newSlotHealth, slotTwoHealth, slotThreeHealth, molochSoldier, molochHealth, false);
      }
    }

    if (slotIndex == 1) {
      if (slotTwoHealth == 0) {
        slotIndex = 2;
      } else {
        if (damage >= slotTwoHealth) {
          newSlotHealth = 0;
        } else {
          newSlotHealth = slotTwoHealth - damage;
        }
        BattleInfo.set(player, true, slotOneHealth, newSlotHealth, slotThreeHealth, molochSoldier, molochHealth, false);
      }
    }

    if (slotIndex == 2) {
      if (slotThreeHealth == 0) {
        slotIndex = 0;
      } else {
        if (damage >= slotThreeHealth) {
          newSlotHealth = 0;
        } else {
          newSlotHealth = slotThreeHealth - damage;
        }
        BattleInfo.set(player, true, slotOneHealth, slotTwoHealth, newSlotHealth, molochSoldier, molochHealth, false);
      }
    }

    BattleCounter.set(player, BattleCounter.get(player) + 1);
  }

  function runFromBattle(address playerAddress) public {
    bytes32 player = addressToEntityKey(playerAddress);
    require(Player.get(player), "not a player");

    (address burnerAddress,,) = AccountInfo.get(player);
    require(burnerAddress == address(_msgSender()), "not the burner address for this character");

    (bool active,,,,,,) = BattleInfo.get(player);
    require(active, "battle not active");

    BattleInfo.set(player, false, 10, 10, 10, bytes32(0), 20, false);
    BattleCounter.set(player, 1);
  }
}