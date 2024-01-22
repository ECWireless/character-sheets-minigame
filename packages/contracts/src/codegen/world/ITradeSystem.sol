// SPDX-License-Identifier: MIT
pragma solidity >=0.8.21;

/* Autogenerated file. Do not edit manually. */

/**
 * @title ITradeSystem
 * @dev This interface is automatically generated from the corresponding system contract. Do not edit manually.
 */
interface ITradeSystem {
  function acceptOffer(address initiatedBy, address initiatedWith) external;

  function cancelOffer(address initiatedBy, address initiatedWith) external;

  function makeOffer(
    address initiatedBy,
    address initiatedWith,
    address offeredCardPlayer,
    address requestedCardPlayer
  ) external;

  function rejectOffer(address initiatedBy, address initiatedWith) external;
}