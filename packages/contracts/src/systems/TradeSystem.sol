// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;
import { System } from "@latticexyz/world/src/System.sol";
import { addressToEntityKey, addressesToEntityKey } from "../lib/addressToEntityKey.sol";
import {
  AccountInfo,
  CardCounter,
  PartyInfo,
  Player,
  TradeInfo
} from "../codegen/index.sol";

contract TradeSystem is System {
  function acceptOffer(address initiatedBy, address initiatedWith) public {
    bytes32 player = addressToEntityKey(initiatedWith);
    require(Player.get(player), "not a player");

    bytes32 initiatedByPlayer = addressToEntityKey(initiatedBy);
    require(Player.get(initiatedByPlayer), "initiatedBy is not a player");

    (address burnerAddress,,) = AccountInfo.get(player);
    require(burnerAddress == address(_msgSender()), "not the burner address for this character");

    bytes32 tradeEntity = addressesToEntityKey(initiatedBy, initiatedWith);
    if (initiatedBy > initiatedWith) {
      tradeEntity = addressesToEntityKey(initiatedWith, initiatedBy);
    }

    (bool active,,, address offeredCardPlayer, address requestedCardPlayer,,) = TradeInfo.get(tradeEntity);
    require(active, "no trade initiated");


    initiatedByChecks(initiatedBy, offeredCardPlayer, requestedCardPlayer);
    initiatedWithChecks(initiatedWith, requestedCardPlayer, offeredCardPlayer);

    updateInitiatedByPartyAfterTrade(initiatedBy, offeredCardPlayer, requestedCardPlayer);
    updateInitiatedWithPartyAfterTrade(initiatedWith, offeredCardPlayer, requestedCardPlayer);

    TradeInfo.set(tradeEntity, false, initiatedBy, initiatedWith, offeredCardPlayer, requestedCardPlayer, false, false);
  }

  function cancelOffer(address initiatedBy, address initiatedWith) public {
    bytes32 player = addressToEntityKey(initiatedBy);
    require(Player.get(player), "not a player");

    bytes32 initiatedWithPlayer = addressToEntityKey(initiatedWith);
    require(Player.get(initiatedWithPlayer), "initiatedWith is not a player");

    (address burnerAddress,,) = AccountInfo.get(player);
    require(burnerAddress == address(_msgSender()), "not the burner address for this character");

    bytes32 tradeEntity = addressesToEntityKey(initiatedBy, initiatedWith);
    if (initiatedBy > initiatedWith) {
      tradeEntity = addressesToEntityKey(initiatedWith, initiatedBy);
    }

    (bool active,,, address offeredCardPlayer, address requestedCardPlayer,,) = TradeInfo.get(tradeEntity);
    require(active, "no trade initiated");

    TradeInfo.set(tradeEntity, false, initiatedBy, initiatedWith, offeredCardPlayer, requestedCardPlayer, true, false);
  }

  function makeOffer(address initiatedBy, address initiatedWith, address offeredCardPlayer, address requestedCardPlayer) public {
    bytes32 tradeEntity = addressesToEntityKey(initiatedBy, initiatedWith);
    if (initiatedBy > initiatedWith) {
      tradeEntity = addressesToEntityKey(initiatedWith, initiatedBy);
    }

    initiatedByChecks(initiatedBy, offeredCardPlayer, requestedCardPlayer);
    initiatedWithChecks(initiatedWith, requestedCardPlayer, offeredCardPlayer);

    TradeInfo.set(tradeEntity, true, initiatedBy, initiatedWith, offeredCardPlayer, requestedCardPlayer, false, false);
  }

  function rejectOffer(address initiatedBy, address initiatedWith) public {
    bytes32 player = addressToEntityKey(initiatedWith);
    require(Player.get(player), "not a player");

    bytes32 initiatedByPlayer = addressToEntityKey(initiatedBy);
    require(Player.get(initiatedByPlayer), "initiatedBy is not a player");

    (address burnerAddress,,) = AccountInfo.get(player);
    require(burnerAddress == address(_msgSender()), "not the burner address for this character");

    bytes32 tradeEntity = addressesToEntityKey(initiatedBy, initiatedWith);
    if (initiatedBy > initiatedWith) {
      tradeEntity = addressesToEntityKey(initiatedWith, initiatedBy);
    }

    (bool active,,, address offeredCardPlayer, address requestedCardPlayer,,) = TradeInfo.get(tradeEntity);
    require(active, "no trade initiated");

    TradeInfo.set(tradeEntity, false, initiatedBy, initiatedWith, offeredCardPlayer, requestedCardPlayer, false, true);
  }

  /**
    INTERNAL FUNCTIONS
  */

  function initiatedByChecks(address initiatedBy, address offeredCardPlayer, address requestedCardPlayer) internal {
    bytes32 player = addressToEntityKey(initiatedBy);
    require(Player.get(player), "not a player");

    (address playerSlotOne,, address playerSlotTwo,, address playerSlotThree,) = PartyInfo.get(player);

    uint8 personalCardCount = CardCounter.get(player);
    if (personalCardCount == 0) {
      personalCardCount = 3;
    }

    require(playerSlotTwo != requestedCardPlayer && playerSlotThree != requestedCardPlayer, "you already have this card");
    require(personalCardCount > 1 || offeredCardPlayer != initiatedBy, "cannot offer last personal card");
    require(playerSlotOne == offeredCardPlayer || playerSlotTwo == offeredCardPlayer || playerSlotThree == offeredCardPlayer, "you don't have this card");

    if (playerSlotOne == address(0)) {
      PartyInfo.set(player, initiatedBy, -1, address(0), -1, address(0), -1);
      CardCounter.set(player, 3);
    }
  }

  function initiatedWithChecks(address initiatedWith, address requestedCardPlayer, address offeredCardPlayer) internal {
    bytes32 initiatedWithPlayer = addressToEntityKey(initiatedWith);
    require(Player.get(initiatedWithPlayer), "initiatedWith is not a player");

    (address initiatedWithSlotOne,, address initiatedWithSlotTwo,, address initiatedWithSlotThree,) = PartyInfo.get(initiatedWithPlayer);

    uint8 initiatedWithPersonalCardCount = CardCounter.get(initiatedWithPlayer);
    if (initiatedWithPersonalCardCount == 0) {
      initiatedWithPersonalCardCount = 3;
    }

    require(initiatedWithSlotTwo != offeredCardPlayer && initiatedWithSlotThree != offeredCardPlayer, "they already have this card");
    require(initiatedWithPersonalCardCount > 1 || requestedCardPlayer != initiatedWith, "cannot request last personal card");
    require(initiatedWithSlotOne == requestedCardPlayer || initiatedWithSlotTwo == requestedCardPlayer || initiatedWithSlotThree == requestedCardPlayer, "they don't have this card");

    if (initiatedWithSlotOne == address(0)) {
      PartyInfo.set(initiatedWithPlayer, initiatedWith, -1, address(0), -1, address(0), -1);
      CardCounter.set(initiatedWithPlayer, 3);
    }
  }

  function updateInitiatedByPartyAfterTrade(address initiatedBy, address offeredCardPlayer, address requestedCardPlayer) internal {
    bytes32 initiatedByPlayer = addressToEntityKey(initiatedBy);

    (address initiatedBySlotOne, int256 initiatedBySlotOneClass, address initiatedBySlotTwo, int256 initiatedBySlotTwoClass, address initiatedBySlotThree, int256 initiatedBySlotThreeClass) = PartyInfo.get(initiatedByPlayer);

    if (initiatedBySlotThree == offeredCardPlayer) {
      if (initiatedBy == requestedCardPlayer) {
        PartyInfo.set(initiatedByPlayer, initiatedBySlotOne, initiatedBySlotOneClass, initiatedBySlotTwo, initiatedBySlotTwoClass, address(0), -1);
      } else {
        PartyInfo.set(initiatedByPlayer, initiatedBySlotOne, initiatedBySlotOneClass, initiatedBySlotTwo, initiatedBySlotTwoClass, requestedCardPlayer, -1);
      }
    } else if (initiatedBySlotTwo == offeredCardPlayer) {
      if (initiatedBy == requestedCardPlayer) {
        PartyInfo.set(initiatedByPlayer, initiatedBySlotOne, initiatedBySlotOneClass, initiatedBySlotThree, initiatedBySlotThreeClass, address(0), -1);
      } else {
        PartyInfo.set(initiatedByPlayer, initiatedBySlotOne, initiatedBySlotOneClass, requestedCardPlayer, -1, initiatedBySlotThree, initiatedBySlotThreeClass);
      }
    } else if (initiatedBySlotOne == offeredCardPlayer) {
      if (initiatedBy == requestedCardPlayer) {
        PartyInfo.set(initiatedByPlayer, initiatedBySlotTwo, initiatedBySlotTwoClass, initiatedBySlotTwo, initiatedBySlotTwoClass, initiatedBySlotThree, initiatedBySlotThreeClass);
      } else {
        if (initiatedBySlotTwo == address(0)) {
          PartyInfo.set(initiatedByPlayer, initiatedBySlotOne, initiatedBySlotOneClass, requestedCardPlayer, -1, initiatedBySlotThree, initiatedBySlotThreeClass);
        } else {
          PartyInfo.set(initiatedByPlayer, initiatedBySlotOne, initiatedBySlotOneClass, initiatedBySlotTwo, initiatedBySlotTwoClass, requestedCardPlayer, -1);
        }
      }
    }

    uint8 personalCardCount = CardCounter.get(initiatedByPlayer);
    if (offeredCardPlayer == initiatedBy) {
      personalCardCount = personalCardCount - 1;
    } else if (requestedCardPlayer == initiatedBy) {
      personalCardCount = personalCardCount + 1;
    }
    CardCounter.set(initiatedByPlayer, personalCardCount);
  }

  function updateInitiatedWithPartyAfterTrade(address initiatedWith, address offeredCardPlayer, address requestedCardPlayer) internal {
    bytes32 initiatedWithPlayer = addressToEntityKey(initiatedWith);

    (address initiatedWithSlotOne, int256 initiatedWithSlotOneClass, address initiatedWithSlotTwo, int256 initiatedWithSlotTwoClass, address initiatedWithSlotThree, int256 initiatedWithSlotThreeClass) = PartyInfo.get(initiatedWithPlayer);

    if (initiatedWithSlotThree == requestedCardPlayer) {
      if (initiatedWith == offeredCardPlayer) {
        PartyInfo.set(initiatedWithPlayer, initiatedWithSlotOne, initiatedWithSlotOneClass, initiatedWithSlotTwo, initiatedWithSlotTwoClass, address(0), -1);
      } else {
        PartyInfo.set(initiatedWithPlayer, initiatedWithSlotOne, initiatedWithSlotOneClass, initiatedWithSlotTwo, initiatedWithSlotTwoClass, offeredCardPlayer, -1);
      }
    } else if (initiatedWithSlotTwo == requestedCardPlayer) {
      if (initiatedWith == offeredCardPlayer) {
        PartyInfo.set(initiatedWithPlayer, initiatedWithSlotOne, initiatedWithSlotOneClass, initiatedWithSlotThree, initiatedWithSlotThreeClass, address(0), -1);
      } else {
        PartyInfo.set(initiatedWithPlayer, initiatedWithSlotOne, initiatedWithSlotOneClass, offeredCardPlayer, -1, initiatedWithSlotThree, initiatedWithSlotThreeClass);
      }
    } else if (initiatedWithSlotOne == requestedCardPlayer) {
      if (initiatedWith == offeredCardPlayer) {
        PartyInfo.set(initiatedWithPlayer, initiatedWithSlotTwo, initiatedWithSlotTwoClass, initiatedWithSlotTwo, initiatedWithSlotTwoClass, initiatedWithSlotThree, initiatedWithSlotThreeClass);
      } else {
        if (initiatedWithSlotTwo == address(0)) {
          PartyInfo.set(initiatedWithPlayer, initiatedWithSlotOne, initiatedWithSlotOneClass, offeredCardPlayer, -1, initiatedWithSlotThree, initiatedWithSlotThreeClass);
        } else {
          PartyInfo.set(initiatedWithPlayer, initiatedWithSlotOne, initiatedWithSlotOneClass, initiatedWithSlotTwo, initiatedWithSlotTwoClass, offeredCardPlayer, -1);
        }
      }
    }

    uint8 initiatedWithPersonalCardCount = CardCounter.get(initiatedWithPlayer);
    if (requestedCardPlayer == initiatedWith) {
      initiatedWithPersonalCardCount = initiatedWithPersonalCardCount - 1;
    } else if (offeredCardPlayer == initiatedWith) {
      initiatedWithPersonalCardCount = initiatedWithPersonalCardCount + 1;
    }
    CardCounter.set(initiatedWithPlayer, initiatedWithPersonalCardCount);
  }
}
