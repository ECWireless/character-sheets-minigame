// SPDX-License-Identifier: MIT
pragma solidity >=0.8.21;

function addressToEntityKey(address addr) pure returns (bytes32) {
  return bytes32(uint256(uint160(addr)));
}

function addressesToEntityKey(address addr1, address addr2) pure returns (bytes32) {
  return keccak256(abi.encode(addr1, addr2));
}
