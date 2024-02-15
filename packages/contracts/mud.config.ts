import { mudConfig } from "@latticexyz/world/register";

export default mudConfig({
  enums: {
    TerrainType: ["None", "Tree", "Boulder", "Water", "MolochSoldier"],
  },
  tables: {
    AccountInfo: {
      dataStruct: false,
      valueSchema: {
        burnerAddress: "address",
        chainId: "uint256",
        nonce: "uint256",
      },
    },
    BattleCounter: "uint32",
    BattleInfo: {
      dataStruct: false,
      valueSchema: {
        active: "bool",
        // TODO: Not sure how to handle battle logic using cross-chain data
        // In the future, maybe use a server to check cross-chain data
        slotOneHealth: "uint32",
        slotTwoHealth: "uint32",
        slotThreeHealth: "uint32",
        molochId: "bytes32",
        molochHealth: "uint32",
        molochDefeated: "bool",
      },
    },
    CardCounter: "uint8",
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
    MolochSoldier: "bool",
    Movable: "bool",
    Obstruction: "bool",
    PartyInfo: {
      dataStruct: false,
      valueSchema: {
        slotOne: "address",
        slotOneClass: "int256",
        slotTwo: "address",
        slotTwoClass: "int256",
        slotThree: "address",
        slotThreeClass: "int256",
      },
    },
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
    TradeInfo: {
      dataStruct: false,
      valueSchema: {
        active: "bool",
        initiatedBy: "address",
        initiatedWith: "address",
        offeredCardPlayer: "address",
        requestedCardPlayer: "address",
        canceled: "bool",
        rejected: "bool",
      },
    },
  },
});
