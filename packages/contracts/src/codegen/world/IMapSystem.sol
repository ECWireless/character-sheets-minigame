// SPDX-License-Identifier: MIT
pragma solidity >=0.8.21;

/* Autogenerated file. Do not edit manually. */

/**
 * @title IMapSystem
 * @dev This interface is automatically generated from the corresponding system contract. Do not edit manually.
 */
interface IMapSystem {
  function attack(address playerAddress, uint32 x, uint32 y) external;

  function initiateTrade(address initiatedWith) external;

  function logout(address playerAddress) external;

  function move(address playerAddress, uint32 x, uint32 y) external;

  function removeAvatarClass(address playerAddress) external;

  function setAvatarClass(address playerAddress, uint256 classId) external;

  function spawn(
    uint256 chainId,
    address gameAddress,
    address playerAddress,
    uint32 x,
    uint32 y,
    bytes calldata signature
  ) external;

  function updateBurnerWallet(address playerAddress, bytes calldata signature) external;
}
