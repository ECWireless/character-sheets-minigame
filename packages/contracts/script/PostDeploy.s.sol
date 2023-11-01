// SPDX-License-Identifier: MIT
pragma solidity >=0.8.21;

import { Script } from "forge-std/Script.sol";
import { console } from "forge-std/console.sol";
import { IWorld } from "../src/codegen/world/IWorld.sol";
import { MapConfig, Health, MolochSoldier, Obstruction, Position } from "../src/codegen/index.sol";
import { TerrainType } from "../src/codegen/common.sol";
import { positionToEntityKey } from "../src/lib/positionToEntityKey.sol";

contract PostDeploy is Script {
  function run(address worldAddress) external {
    console.log("Deployed world: ", worldAddress);
    IWorld world = IWorld(worldAddress);
    
    // Load the private key from the `PRIVATE_KEY` environment variable (in .env)
    uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");

    // Start broadcasting transactions from the deployer account
    vm.startBroadcast(deployerPrivateKey);

    TerrainType O = TerrainType.None;
    TerrainType T = TerrainType.Tree;
    TerrainType B = TerrainType.Boulder;
    TerrainType W = TerrainType.Water;
    TerrainType X = TerrainType.MolochSoldier;

    TerrainType[20][20] memory map = [
      [O, O, O, O, O, O, T, O, O, O, O, O, O, O, O, O, O, O, O, O],
      [O, O, T, O, O, X, O, O, T, O, O, O, O, B, O, O, O, O, O, O],
      [O, T, T, T, T, O, O, O, O, O, O, O, O, O, O, T, T, O, O, O],
      [O, O, T, T, T, T, O, O, O, O, B, O, O, O, O, O, T, O, O, O],
      [O, O, O, O, T, T, O, O, O, O, O, O, O, O, O, O, O, T, O, O],
      [O, O, O, B, B, O, O, O, O, O, O, O, O, O, O, O, X, O, O, O],
      [O, T, O, O, O, B, B, O, O, O, O, T, O, O, O, O, O, B, O, O],
      [O, O, T, T, O, O, O, O, O, T, O, B, O, O, T, O, B, O, O, O],
      [O, O, T, O, O, O, O, T, T, T, O, B, B, O, O, O, O, O, O, O],
      [O, O, X, O, O, O, O, T, T, T, O, B, T, O, T, T, O, O, O, O],
      [O, B, O, O, O, B, O, O, T, T, O, B, O, O, T, T, O, O, O, O],
      [O, O, B, O, O, O, T, O, T, T, O, O, B, T, T, T, O, O, O, O],
      [O, O, B, B, O, O, O, O, T, O, O, O, B, O, T, O, O, O, O, O],
      [O, O, O, B, B, O, O, O, O, O, O, O, O, B, O, T, O, O, O, O],
      [O, O, O, O, B, O, O, O, O, O, O, O, O, O, O, O, O, O, O, O],
      [W, W, O, O, O, O, O, O, O, O, B, B, O, O, T, O, O, O, O, O],
      [O, O, W, O, W, O, O, O, T, B, O, O, O, T, T, O, B, O, O, O],
      [O, O, O, W, O, W, T, T, X, O, O, O, O, T, O, O, O, O, O, O],
      [O, O, O, T, T, T, W, O, O, O, O, T, O, O, O, T, O, O, O, O],
      [O, O, O, O, O, T, O, W, O, O, O, O, O, O, O, O, O, O, O, O]
    ];

    uint32 height = uint32(map.length);
    uint32 width = uint32(map[0].length);
    bytes memory terrain = new bytes(width * height);
 
    for (uint32 y = 0; y < height; y++) {
      for (uint32 x = 0; x < width; x++) {
        TerrainType terrainType = map[y][x];
        if (terrainType == TerrainType.None) continue;
 
        terrain[(y * width) + x] = bytes1(uint8(terrainType));

        bytes32 entity = positionToEntityKey(x, y);
        if (terrainType == TerrainType.Boulder || terrainType == TerrainType.Tree || terrainType == TerrainType.Water) {
          Position.set(world, entity, x, y, x, y);
          Obstruction.set(world, entity, true);
        }

        if (terrainType == TerrainType.MolochSoldier) {
          MolochSoldier.set(world, entity, true);
          Position.set(world, entity, x, y, x, y);
          Obstruction.set(world, entity, true);
          Health.set(world, entity, 1);
        }
      }
    }

    MapConfig.set(world, width, height, terrain);

    vm.stopBroadcast();
  }
}
