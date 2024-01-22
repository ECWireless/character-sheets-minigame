// SPDX-License-Identifier: MIT
pragma solidity >=0.8.21;

function verifyEIP712Signature(address signer, bytes calldata signature, address playerAddress, address burnerAddress, uint256 nonce, uint256 chainId) pure returns (bool) {
  bytes32 structHash = keccak256(
    abi.encode(
      keccak256(
        "LoginRequest(address playerAddress,address burnerAddress,uint256 nonce)"
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
      chainId
    )
  );

  bytes32 digest = keccak256(
      abi.encodePacked("\x19\x01", domainSeparator, structHash)
  );

  (uint8 v, bytes32 r, bytes32 s) = extractVRS(signature);

  return signer == ecrecover(digest, v, r, s);
}

function extractVRS(bytes memory signature) pure returns (uint8 v, bytes32 r, bytes32 s) {
  require(signature.length == 65, "Invalid signature length");
  assembly {
    r := mload(add(signature, 32))
    s := mload(add(signature, 64))
    v := and(mload(add(signature, 65)), 255)
  }
  if (v < 27) v += 27;
}
