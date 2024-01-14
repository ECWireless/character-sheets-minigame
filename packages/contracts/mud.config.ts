import { mudConfig } from "@latticexyz/world/register";

export default mudConfig({
  enums: {
    TerrainType: ["None", "Tree", "Boulder", "Water", "MolochSoldier"],
  },
  tables: {
    AvatarClass: "uint256",
    CharacterSheetInfo: {
      dataStruct: false,
      valueSchema: {
        chainId: "uint256",
        gameAddress: "address",
        playerAddress: "address",
      },
    },
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
        chainId: "uint256",
        nonce: "uint256",
      },
    },
    TradeInfo: {
      dataStruct: false,
      valueSchema: {
        active: "bool",
        initiatedBy: "address",
        initiatedWith: "address",
        primarySignature: "bytes",
        secondarySignature: "bytes",
      },
    },
  },
});
