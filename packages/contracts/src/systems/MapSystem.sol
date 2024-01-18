// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;
import { System } from "@latticexyz/world/src/System.sol";
import { addressToEntityKey } from "../lib/addressToEntityKey.sol";
import { positionToEntityKey } from "../lib/positionToEntityKey.sol";
import { verifyEIP712Signature } from "../lib/signature.sol";
import {
  AccountInfo,
  AvatarClass,
  CharacterSheetInfo,
  Health,
  MapConfig,
  MolochSoldier,
  Movable,
  Obstruction,
  PartyInfo,
  Player,
  Position
} from "../codegen/index.sol";

contract MapSystem is System {
  function attack(address playerAddress, uint32 x, uint32 y) public {
    bytes32 player = addressToEntityKey(playerAddress);
    bytes32 molochSoldier = positionToEntityKey(x, y);
    require(Player.get(player), "not a player");
    require(MolochSoldier.get(molochSoldier), "not a moloch soldier");

    (address burnerAddress,,) = AccountInfo.get(player);
    require(burnerAddress == address(_msgSender()), "not the burner address for this character");

    // (uint32 playerX, uint32 playerY, ,) = Position.get(player);
    // (uint32 molochSoldierX, uint32 molochSoldierY, ,) = Position.get(molochSoldier);
    
    // require(distance(playerX, playerY, molochSoldierX, molochSoldierY) == 1, "can only attack adjacent spaces");

    uint32 molochSoldierHealth = Health.get(molochSoldier);
    require(molochSoldierHealth > 0, "moloch soldier is already dead");

    Health.set(molochSoldier, molochSoldierHealth - 1);
  }

  function login(uint256 chainId, address gameAddress, address playerAddress, bytes calldata signature) public {
    bytes32 player = addressToEntityKey(playerAddress);

    (,, uint256 nonce) = AccountInfo.get(player);
    nonce = nonce + 1;

    require(verifyEIP712Signature(playerAddress, signature, playerAddress, address(_msgSender()), nonce, chainId), "invalid signature");

    Player.set(player, true);
    AccountInfo.set(player, address(_msgSender()), chainId, nonce);
    CharacterSheetInfo.set(player, chainId, gameAddress, playerAddress);
    PartyInfo.set(player, playerAddress, playerAddress, playerAddress);
  }

  function logout(address playerAddress) public {
    bytes32 player = addressToEntityKey(playerAddress);
    require(Player.get(player), "not logged in");

    Movable.set(player, false);
  }

  function move(address playerAddress, uint32 x, uint32 y) public {
    bytes32 player = addressToEntityKey(playerAddress);
    require(Movable.get(player), "not movable");

    (address burnerAddress,,) = AccountInfo.get(player);
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

  function setAvatarClass(address playerAddress,  uint256 classId) public {
    bytes32 player = addressToEntityKey(playerAddress);
    AvatarClass.set(player, classId);
  }

  function spawn(address playerAddress, uint32 x, uint32 y) public {
    bytes32 player = addressToEntityKey(playerAddress);
    require(!Movable.get(player), "already spawned");

    // Constrain position to map size, wrapping around if necessary
    (uint32 width, uint32 height, ) = MapConfig.get();
    x = (x + width) % width;
    y = (y + height) % height;

    bytes32 position = positionToEntityKey(x, y);
    require(!Obstruction.get(position), "this space is obstructed");
 
    Movable.set(player, true);
    Position.set(player, x, y, x, y);
  }

  function updateBurnerWallet (address playerAddress, bytes calldata signature) public {
    bytes32 player = addressToEntityKey(playerAddress);
    require(Player.get(player), "not spawned");

    (,uint256 chainId,uint256 nonce) = AccountInfo.get(player);
    uint256 newSpawnNonce = nonce + 1;
    
    require(verifyEIP712Signature(playerAddress, signature, playerAddress, address(_msgSender()), newSpawnNonce, chainId), "invalid signature");

    AccountInfo.set(player, address(_msgSender()), chainId, nonce);
  }

  /**
    INTERNAL FUNCTIONS
  */

  function distance(uint32 fromX, uint32 fromY, uint32 toX, uint32 toY) internal pure returns (uint32) {
    uint32 deltaX = fromX > toX ? fromX - toX : toX - fromX;
    uint32 deltaY = fromY > toY ? fromY - toY : toY - fromY;
    return deltaX + deltaY;
  }
}
