// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

function getRandomSlotNumber() view returns (uint8) {
  uint256 seed = uint256(keccak256(abi.encodePacked(blockhash(block.number - 1), block.timestamp)));
  uint8 randomNumber = uint8((seed % 3) + 1);
  return randomNumber;
}