// SPDX-License-Identifier: MIT
pragma solidity >=0.8.21;

/* Autogenerated file. Do not edit manually. */

/**
 * @title IMapSystem
 * @dev This interface is automatically generated from the corresponding system contract. Do not edit manually.
 */
interface IMapSystem {
  function login(uint256 chainId, address gameAddress, address playerAddress, bytes calldata signature) external;

  function logout(address playerAddress) external;

  function move(address playerAddress, uint32 x, uint32 y) external;

  function setPartyClasses(address playerAddress, int256[] calldata classIds) external;

  function spawn(address playerAddress, uint32 x, uint32 y) external;

  function updateBurnerWallet(address playerAddress, bytes calldata signature) external;
}
