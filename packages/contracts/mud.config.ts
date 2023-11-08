import { mudConfig } from "@latticexyz/world/register";

export default mudConfig({
  enums: {
    TerrainType: ["None", "Tree", "Boulder", "Water", "MolochSoldier"],
  },
  tables: {
    CharacterSheetInfo: {
      dataStruct: false,
      valueSchema: {
        chainId: "uint256",
        gameAddress: "address",
        playerAddress: "address",
      },
    },
    // Game: {
    //   dataStruct: false,
    //   valueSchema: {
    //     chainId: "uint256",
    //     gameAddress: "address",
    //   },
    // },
    Health: "uint32",
    MapConfig: {
      keySchema: {},
      dataStruct: false,
      valueSchema: {
        height: "uint32",
        width: "uint32",
        terrain: "bytes",
      },
    },
    MolochSoldier: "bool",
    Movable: "bool",
    Obstruction: "bool",
    Player: "bool",
    Position: {
      dataStruct: false,
      valueSchema: {
        x: "uint32",
        y: "uint32",
        previousX: "uint32",
        previousY: "uint32",
      },
    },
    SpawnInfo: {
      dataStruct: false,
      valueSchema: {
        burnerAddress: "address",
        nonce: "uint256",
      },
    },
  },
});
