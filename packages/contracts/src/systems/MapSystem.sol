// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;
import { System } from "@latticexyz/world/src/System.sol";
import { addressToEntityKey, addressesToEntityKey } from "../lib/addressToEntityKey.sol";
import { positionToEntityKey } from "../lib/positionToEntityKey.sol";
import { verifyEIP712Signature } from "../lib/signature.sol";
import {
  AvatarClass,
  CharacterSheetInfo,
  Health,
  MapConfig,
  MolochSoldier,
  Movable,
  Obstruction,
  PartyInfo,
  Player,
  Position,
  SpawnInfo,
  TradeInfo
} from "../codegen/index.sol";

contract MapSystem is System {
  function acceptOffer(address initiatedBy, address initiatedWith) public {
    bytes32 player = addressToEntityKey(initiatedWith);
    require(Player.get(player), "not a player");

    bytes32 initiatedByPlayer = addressToEntityKey(initiatedBy);
    require(Player.get(initiatedByPlayer), "initiatedBy is not a player");

    (address burnerAddress,,) = SpawnInfo.get(player);
    require(burnerAddress == address(_msgSender()), "not the burner address for this character");

    bytes32 tradeEntity = addressesToEntityKey(initiatedBy, initiatedWith);
    if (initiatedBy > initiatedWith) {
      tradeEntity = addressesToEntityKey(initiatedWith, initiatedBy);
    }

    (bool active,,, address offeredCardPlayer, address requestedCardPlayer,,) = TradeInfo.get(tradeEntity);
    require(active, "no trade initiated");

    updatePartiesAfterTrade(initiatedBy, initiatedWith, offeredCardPlayer, requestedCardPlayer);
    TradeInfo.set(tradeEntity, false, initiatedBy, initiatedWith, offeredCardPlayer, requestedCardPlayer, false, false);
  }

  function cancelOffer(address initiatedBy, address initiatedWith) public {
    bytes32 player = addressToEntityKey(initiatedBy);
    require(Player.get(player), "not a player");

    bytes32 initiatedWithPlayer = addressToEntityKey(initiatedWith);
    require(Player.get(initiatedWithPlayer), "initiatedWith is not a player");

    (address burnerAddress,,) = SpawnInfo.get(player);
    require(burnerAddress == address(_msgSender()), "not the burner address for this character");

    bytes32 tradeEntity = addressesToEntityKey(initiatedBy, initiatedWith);
    if (initiatedBy > initiatedWith) {
      tradeEntity = addressesToEntityKey(initiatedWith, initiatedBy);
    }

    (bool active,,, address offeredCardPlayer, address requestedCardPlayer,,) = TradeInfo.get(tradeEntity);
    require(active, "no trade initiated");

    TradeInfo.set(tradeEntity, false, initiatedBy, initiatedWith, offeredCardPlayer, requestedCardPlayer, true, false);
  }

  function updatePartiesAfterTrade(address initiatedBy, address initiatedWith, address offeredCardPlayer, address requestedCardPlayer) internal {
    bytes32 initiatedByPlayer = addressToEntityKey(initiatedBy);
    bytes32 initiatedWithPlayer = addressToEntityKey(initiatedWith);

    (address initiatedBySlotOne, address initiatedBySlotTwo, address initiatedBySlotThree) = PartyInfo.get(initiatedByPlayer);
    (address initiatedWithSlotOne, address initiatedWithSlotTwo, address initiatedWithSlotThree) = PartyInfo.get(initiatedWithPlayer);

    if (initiatedBySlotThree == offeredCardPlayer) {
      PartyInfo.set(initiatedByPlayer, initiatedBySlotOne, initiatedBySlotTwo, requestedCardPlayer);
    } else if (initiatedBySlotTwo == offeredCardPlayer) {
      PartyInfo.set(initiatedByPlayer, initiatedBySlotOne, requestedCardPlayer, initiatedBySlotThree);
    } else if (initiatedBySlotOne == offeredCardPlayer) {
      PartyInfo.set(initiatedByPlayer, requestedCardPlayer, initiatedBySlotTwo, initiatedBySlotThree);
    }

    if (initiatedWithSlotThree == requestedCardPlayer) {
      PartyInfo.set(initiatedWithPlayer, initiatedWithSlotOne, initiatedWithSlotTwo, offeredCardPlayer);
    } else if (initiatedWithSlotTwo == requestedCardPlayer) {
      PartyInfo.set(initiatedWithPlayer, initiatedWithSlotOne, offeredCardPlayer, initiatedWithSlotThree);
    } else if (initiatedWithSlotOne == requestedCardPlayer) {
      PartyInfo.set(initiatedWithPlayer, offeredCardPlayer, initiatedWithSlotTwo, initiatedWithSlotThree);
    }
  }

  function attack(address playerAddress, uint32 x, uint32 y) public {
    bytes32 player = addressToEntityKey(playerAddress);
    bytes32 molochSoldier = positionToEntityKey(x, y);
    require(Player.get(player), "not a player");
    require(MolochSoldier.get(molochSoldier), "not a moloch soldier");

    (address burnerAddress,,) = SpawnInfo.get(player);
    require(burnerAddress == address(_msgSender()), "not the burner address for this character");

    // (uint32 playerX, uint32 playerY, ,) = Position.get(player);
    // (uint32 molochSoldierX, uint32 molochSoldierY, ,) = Position.get(molochSoldier);
    
    // require(distance(playerX, playerY, molochSoldierX, molochSoldierY) == 1, "can only attack adjacent spaces");

    uint32 molochSoldierHealth = Health.get(molochSoldier);
    require(molochSoldierHealth > 0, "moloch soldier is already dead");

    Health.set(molochSoldier, molochSoldierHealth - 1);
  }

  function distance(uint32 fromX, uint32 fromY, uint32 toX, uint32 toY) internal pure returns (uint32) {
    uint32 deltaX = fromX > toX ? fromX - toX : toX - fromX;
    uint32 deltaY = fromY > toY ? fromY - toY : toY - fromY;
    return deltaX + deltaY;
  }

  function logout(address playerAddress) public {
    bytes32 player = addressToEntityKey(playerAddress);
    require(Player.get(player), "not logged in");

    Player.set(player, false);
    Movable.set(player, false);
  }

  function makeOffer(address initiatedBy, address initiatedWith, address offeredCardPlayer, address requestedCardPlayer) public {
    bytes32 tradeEntity = addressesToEntityKey(initiatedBy, initiatedWith);
    if (initiatedBy > initiatedWith) {
      tradeEntity = addressesToEntityKey(initiatedWith, initiatedBy);
    }

    offerInitiatedByChecks(initiatedBy, offeredCardPlayer);
    offerInitiatedWithChecks(initiatedWith, requestedCardPlayer);

    TradeInfo.set(tradeEntity, true, initiatedBy, initiatedWith, offeredCardPlayer, requestedCardPlayer, false, false);
  }

  function offerInitiatedByChecks(address initiatedBy, address offeredCardPlayer) internal {
    bytes32 player = addressToEntityKey(initiatedBy);
    require(Player.get(player), "not a player");

    (address burnerAddress,,) = SpawnInfo.get(player);
    require(burnerAddress == address(_msgSender()), "not the burner address for this character");

    (address playerSlotOne, address playerSlotTwo, address playerSlotThree) = PartyInfo.get(player);

    uint8 personalCardCount = 0;
    if (playerSlotOne == initiatedBy) {
      personalCardCount++;
    }
    if (playerSlotTwo == initiatedBy) {
      personalCardCount++;
    }
    if (playerSlotThree == initiatedBy) {
      personalCardCount++;
    }

    require(personalCardCount > 1 || offeredCardPlayer != initiatedBy, "cannot offer last personal card");
    require(playerSlotOne == offeredCardPlayer || playerSlotTwo == offeredCardPlayer || playerSlotThree == offeredCardPlayer, "you don't have this card");

    if (playerSlotOne == address(0)) {
      PartyInfo.set(player, initiatedBy, initiatedBy, initiatedBy);
    }
  }

  function offerInitiatedWithChecks(address initiatedWith, address requestedCardPlayer) internal {
    bytes32 initiatedWithPlayer = addressToEntityKey(initiatedWith);
    require(Player.get(initiatedWithPlayer), "initiatedWith is not a player");

    (address initiatedWithSlotOne, address initiatedWithSlotTwo, address initiatedWithSlotThree) = PartyInfo.get(initiatedWithPlayer);

    uint8 initiatedWithPersonalCardCount = 0;
    if (initiatedWithSlotOne == initiatedWith) {
      initiatedWithPersonalCardCount++;
    }
    if (initiatedWithSlotTwo == initiatedWith) {
      initiatedWithPersonalCardCount++;
    }
    if (initiatedWithSlotThree == initiatedWith) {
      initiatedWithPersonalCardCount++;
    }

    require(initiatedWithPersonalCardCount > 1 || requestedCardPlayer != initiatedWith, "cannot request last personal card");
    require(initiatedWithSlotOne == requestedCardPlayer || initiatedWithSlotTwo == requestedCardPlayer || initiatedWithSlotThree == requestedCardPlayer, "they don't have this card");

    if (initiatedWithSlotOne == address(0)) {
      PartyInfo.set(initiatedWithPlayer, initiatedWith, initiatedWith, initiatedWith);
    }
  }

  function move(address playerAddress, uint32 x, uint32 y) public {
    bytes32 player = addressToEntityKey(playerAddress);
    require(Movable.get(player), "not movable");

    (address burnerAddress,,) = SpawnInfo.get(player);
    require(burnerAddress == address(_msgSender()), "not the burner address for this character");

    (uint32 previousX, uint32 previousY, ,) = Position.get(player);
    // require(distance(fromX, fromY, x, y) == 1, "can only move to adjacent spaces");

    // Constrain position to map size, wrapping around if necessary
    (uint32 width, uint32 height, ) = MapConfig.get();
    x = (x + width) % width;
    y = (y + height) % height;

    bytes32 position = positionToEntityKey(x, y);
    require(!Obstruction.get(position), "this space is obstructed");

    Position.set(player, x, y, previousX, previousY);
  }

  function removeAvatarClass(address playerAddress) public {
    bytes32 player = addressToEntityKey(playerAddress);
    AvatarClass.deleteRecord(player);
  }

  function rejectOffer(address initiatedBy, address initiatedWith) public {
    bytes32 player = addressToEntityKey(initiatedWith);
    require(Player.get(player), "not a player");

    bytes32 initiatedByPlayer = addressToEntityKey(initiatedBy);
    require(Player.get(initiatedByPlayer), "initiatedBy is not a player");

    (address burnerAddress,,) = SpawnInfo.get(player);
    require(burnerAddress == address(_msgSender()), "not the burner address for this character");

    bytes32 tradeEntity = addressesToEntityKey(initiatedBy, initiatedWith);
    if (initiatedBy > initiatedWith) {
      tradeEntity = addressesToEntityKey(initiatedWith, initiatedBy);
    }

    (bool active,,, address offeredCardPlayer, address requestedCardPlayer,,) = TradeInfo.get(tradeEntity);
    require(active, "no trade initiated");

    TradeInfo.set(tradeEntity, false, initiatedBy, initiatedWith, offeredCardPlayer, requestedCardPlayer, false, true);
  }

  function setAvatarClass(address playerAddress,  uint256 classId) public {
    bytes32 player = addressToEntityKey(playerAddress);
    AvatarClass.set(player, classId);
  }

  function spawn(uint256 chainId, address gameAddress, address playerAddress, uint32 x, uint32 y, bytes calldata signature) public {
    bytes32 player = addressToEntityKey(playerAddress);
    require(!Player.get(player), "already spawned");

    (,, uint256 nonce) = SpawnInfo.get(player);
    nonce = nonce + 1;

    require(verifyEIP712Signature(playerAddress, signature, playerAddress, address(_msgSender()), nonce, chainId), "invalid signature");

    // Constrain position to map size, wrapping around if necessary
    (uint32 width, uint32 height, ) = MapConfig.get();
    x = (x + width) % width;
    y = (y + height) % height;

    bytes32 position = positionToEntityKey(x, y);
    require(!Obstruction.get(position), "this space is obstructed");
 
    Player.set(player, true);
    Position.set(player, x, y, x, y);
    Movable.set(player, true);
    SpawnInfo.set(player, address(_msgSender()), chainId, nonce);
    CharacterSheetInfo.set(player, chainId, gameAddress, playerAddress);
    PartyInfo.set(player, playerAddress, playerAddress, playerAddress);
  }

  function updateBurnerWallet (address playerAddress, bytes calldata signature) public {
    bytes32 player = addressToEntityKey(playerAddress);
    require(Player.get(player), "not spawned");

    (,uint256 chainId,uint256 nonce) = SpawnInfo.get(player);
    uint256 newSpawnNonce = nonce + 1;
    
    require(verifyEIP712Signature(playerAddress, signature, playerAddress, address(_msgSender()), newSpawnNonce, chainId), "invalid signature");

    SpawnInfo.set(player, address(_msgSender()), chainId, nonce);
  }
}
