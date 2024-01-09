// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;
import { System } from "@latticexyz/world/src/System.sol";
import { addressToEntityKey } from "../lib/addressToEntityKey.sol";
import { positionToEntityKey } from "../lib/positionToEntityKey.sol";
import { AvatarClass, CharacterSheetInfo, Health, MapConfig, MolochSoldier, Movable, Obstruction, Player, Position, SpawnInfo } from "../codegen/index.sol";

contract MapSystem is System {
  function attack(address playerAddress, uint32 x, uint32 y) public {
    bytes32 player = addressToEntityKey(playerAddress);
    bytes32 molochSoldier = positionToEntityKey(x, y);
    require(Player.get(player), "not a player");
    require(MolochSoldier.get(molochSoldier), "not a moloch soldier");

    (address burnerAddress,) = SpawnInfo.get(player);
    require(burnerAddress == address(_msgSender()), "not the burner address for this character");

    // (uint32 playerX, uint32 playerY, ,) = Position.get(player);
    // (uint32 molochSoldierX, uint32 molochSoldierY, ,) = Position.get(molochSoldier);
    
    // require(distance(playerX, playerY, molochSoldierX, molochSoldierY) == 1, "can only attack adjacent spaces");

    uint32 molochSoldierHealth = Health.get(molochSoldier);
    require(molochSoldierHealth > 0, "moloch soldier is already dead");

    Health.set(molochSoldier, molochSoldierHealth - 1);
  }

  function logout(address playerAddress) public {
    bytes32 player = addressToEntityKey(playerAddress);
    require(Player.get(player), "not logged in");

    Player.set(player, false);
    Movable.set(player, false);
  }

  function move(address playerAddress, uint32 x, uint32 y) public {
    bytes32 player = addressToEntityKey(playerAddress);
    require(Movable.get(player), "not movable");

    (address burnerAddress,) = SpawnInfo.get(player);
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

  function updateBurnerWallet (address playerAddress, bytes calldata signature) public {
    bytes32 player = addressToEntityKey(playerAddress);
    require(Player.get(player), "not spawned");

    (, uint256 nonce) = SpawnInfo.get(player);
    uint256 newSpawnNonce = nonce + 1;
    
    require(verifyEIP712Signature(playerAddress, signature, playerAddress, address(_msgSender()), newSpawnNonce), "invalid signature");

    SpawnInfo.set(player, address(_msgSender()), nonce);
  }

  function removeAvatarClass(address playerAddress) public {
    bytes32 player = addressToEntityKey(playerAddress);
    AvatarClass.deleteRecord(player);
  }

  function setAvatarClass(address playerAddress,  uint256 classId) public {
    bytes32 player = addressToEntityKey(playerAddress);
    AvatarClass.set(player, classId);
  }

  function spawn(uint256 chainId, address gameAddress, address playerAddress, uint32 x, uint32 y, bytes calldata signature) public {
    bytes32 player = addressToEntityKey(playerAddress);
    require(!Player.get(player), "already spawned");

    (, uint256 nonce) = SpawnInfo.get(player);
    uint256 newSpawnNonce = nonce + 1;

    require(verifyEIP712Signature(playerAddress, signature, playerAddress, address(_msgSender()), newSpawnNonce), "invalid signature");

    // Constrain position to map size, wrapping around if necessary
    (uint32 width, uint32 height, ) = MapConfig.get();
    x = (x + width) % width;
    y = (y + height) % height;

    bytes32 position = positionToEntityKey(x, y);
    require(!Obstruction.get(position), "this space is obstructed");
 
    Player.set(player, true);
    Position.set(player, x, y, x, y);
    Movable.set(player, true);
    SpawnInfo.set(player, address(_msgSender()), newSpawnNonce);
    CharacterSheetInfo.set(player, chainId, gameAddress, playerAddress);
  }

  function distance(uint32 fromX, uint32 fromY, uint32 toX, uint32 toY) internal pure returns (uint32) {
    uint32 deltaX = fromX > toX ? fromX - toX : toX - fromX;
    uint32 deltaY = fromY > toY ? fromY - toY : toY - fromY;
    return deltaX + deltaY;
  }

  function verifyEIP712Signature(address signer, bytes calldata signature, address playerAddress, address burnerAddress, uint256 nonce) internal pure returns (bool) {
    bytes32 structHash = keccak256(
      abi.encode(
        keccak256(
          "SpawnRequest(address playerAddress,address burnerAddress,uint256 nonce)"
        ),
        playerAddress,
        burnerAddress,
        nonce
      )
    );

    bytes32 domainSeparator = keccak256(
      abi.encode(
        keccak256(
          "EIP712Domain(string name,uint256 chainId)"
        ),
        keccak256(bytes("CharacterSheets - Minigame")),
        100
      )
    );

    bytes32 digest = keccak256(
        abi.encodePacked("\x19\x01", domainSeparator, structHash)
    );

    (uint8 v, bytes32 r, bytes32 s) = extractVRS(signature);

    return signer == ecrecover(digest, v, r, s);
  }

  function extractVRS(bytes memory signature) public pure returns (uint8 v, bytes32 r, bytes32 s) {
    require(signature.length == 65, "Invalid signature length");
    assembly {
      r := mload(add(signature, 32))
      s := mload(add(signature, 64))
      v := and(mload(add(signature, 65)), 255)
    }
    if (v < 27) v += 27;
  }
}
