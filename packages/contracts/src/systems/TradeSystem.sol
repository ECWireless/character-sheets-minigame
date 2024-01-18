// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;
import { System } from "@latticexyz/world/src/System.sol";
import { addressToEntityKey, addressesToEntityKey } from "../lib/addressToEntityKey.sol";
import {
  AccountInfo,
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

    updatePartiesAfterTrade(initiatedBy, initiatedWith, offeredCardPlayer, requestedCardPlayer);
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

    offerInitiatedByChecks(initiatedBy, offeredCardPlayer);
    offerInitiatedWithChecks(initiatedWith, requestedCardPlayer);

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

  function offerInitiatedByChecks(address initiatedBy, address offeredCardPlayer) internal {
    bytes32 player = addressToEntityKey(initiatedBy);
    require(Player.get(player), "not a player");

    (address burnerAddress,,) = AccountInfo.get(player);
    require(burnerAddress == address(_msgSender()), "not the burner address for this character");

    (address playerSlotOne, address playerSlotTwo, address playerSlotThree) = PartyInfo.get(player);

    uint8 personalCardCount = 0;
    if (playerSlotOne == initiatedBy) {
      personalCardCount++;
    }
    if (playerSlotTwo == initiatedBy) {
      personalCardCount++;
    }
    if (playerSlotThree == initiatedBy) {
      personalCardCount++;
    }

    require(personalCardCount > 1 || offeredCardPlayer != initiatedBy, "cannot offer last personal card");
    require(playerSlotOne == offeredCardPlayer || playerSlotTwo == offeredCardPlayer || playerSlotThree == offeredCardPlayer, "you don't have this card");

    if (playerSlotOne == address(0)) {
      PartyInfo.set(player, initiatedBy, initiatedBy, initiatedBy);
    }
  }

  function offerInitiatedWithChecks(address initiatedWith, address requestedCardPlayer) internal {
    bytes32 initiatedWithPlayer = addressToEntityKey(initiatedWith);
    require(Player.get(initiatedWithPlayer), "initiatedWith is not a player");

    (address initiatedWithSlotOne, address initiatedWithSlotTwo, address initiatedWithSlotThree) = PartyInfo.get(initiatedWithPlayer);

    uint8 initiatedWithPersonalCardCount = 0;
    if (initiatedWithSlotOne == initiatedWith) {
      initiatedWithPersonalCardCount++;
    }
    if (initiatedWithSlotTwo == initiatedWith) {
      initiatedWithPersonalCardCount++;
    }
    if (initiatedWithSlotThree == initiatedWith) {
      initiatedWithPersonalCardCount++;
    }

    require(initiatedWithPersonalCardCount > 1 || requestedCardPlayer != initiatedWith, "cannot request last personal card");
    require(initiatedWithSlotOne == requestedCardPlayer || initiatedWithSlotTwo == requestedCardPlayer || initiatedWithSlotThree == requestedCardPlayer, "they don't have this card");

    if (initiatedWithSlotOne == address(0)) {
      PartyInfo.set(initiatedWithPlayer, initiatedWith, initiatedWith, initiatedWith);
    }
  }

  function updatePartiesAfterTrade(address initiatedBy, address initiatedWith, address offeredCardPlayer, address requestedCardPlayer) internal {
    bytes32 initiatedByPlayer = addressToEntityKey(initiatedBy);
    bytes32 initiatedWithPlayer = addressToEntityKey(initiatedWith);

    (address initiatedBySlotOne, address initiatedBySlotTwo, address initiatedBySlotThree) = PartyInfo.get(initiatedByPlayer);
    (address initiatedWithSlotOne, address initiatedWithSlotTwo, address initiatedWithSlotThree) = PartyInfo.get(initiatedWithPlayer);

    if (initiatedBySlotThree == offeredCardPlayer) {
      PartyInfo.set(initiatedByPlayer, initiatedBySlotOne, initiatedBySlotTwo, requestedCardPlayer);
    } else if (initiatedBySlotTwo == offeredCardPlayer) {
      PartyInfo.set(initiatedByPlayer, initiatedBySlotOne, requestedCardPlayer, initiatedBySlotThree);
    } else if (initiatedBySlotOne == offeredCardPlayer) {
      PartyInfo.set(initiatedByPlayer, requestedCardPlayer, initiatedBySlotTwo, initiatedBySlotThree);
    }

    if (initiatedWithSlotThree == requestedCardPlayer) {
      PartyInfo.set(initiatedWithPlayer, initiatedWithSlotOne, initiatedWithSlotTwo, offeredCardPlayer);
    } else if (initiatedWithSlotTwo == requestedCardPlayer) {
      PartyInfo.set(initiatedWithPlayer, initiatedWithSlotOne, offeredCardPlayer, initiatedWithSlotThree);
    } else if (initiatedWithSlotOne == requestedCardPlayer) {
      PartyInfo.set(initiatedWithPlayer, offeredCardPlayer, initiatedWithSlotTwo, initiatedWithSlotThree);
    }
  }
}
