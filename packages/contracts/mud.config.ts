import { mudConfig } from "@latticexyz/world/register";

export default mudConfig({
  enums: {
    TerrainType: ["None", "Tree", "Boulder", "Water"],
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
    MapConfig: {
      keySchema: {},
      dataStruct: false,
      valueSchema: {
        height: "uint32",
        width: "uint32",
        terrain: "bytes",
      },
    },
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
  },
});
