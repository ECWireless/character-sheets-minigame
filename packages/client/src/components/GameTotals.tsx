import { HStack, Image, Text, VStack } from "@chakra-ui/react";
import React from "react";

import xpBoxLeftSvg from "../assets/xp-box-left.svg";
import xpSvg from "../assets/xp.svg";
import usersSvg from "../assets/users.svg";
import itemsSvg from "../assets/items.svg";
import { GameMeta } from "../utils/types";

type GameTotalsProps = Pick<GameMeta, "experience" | "characters" | "items">;

export const GameTotals: React.FC<GameTotalsProps> = ({
  experience,
  characters,
  items,
}) => {
  return (
    <VStack align="flex-start" spacing={4}>
      <Text
        fontFamily="mono"
        fontSize="sm"
        letterSpacing="1px"
        textTransform="uppercase"
      >
        Game Totals
      </Text>
      <HStack align="stretch" spacing={0}>
        <Image alt="xp-box-left" h="100%" src={xpBoxLeftSvg} w="12px" />
        <HStack
          borderTop="2px solid"
          borderBottom="2px solid"
          borderColor="rgba(219, 211, 139, 0.75)"
          color="softyellow"
          mx="-1px"
          px={4}
          spacing={4}
        >
          <Text fontSize="lg" fontWeight="700">
            {experience}
          </Text>
          <Image alt="users" height="20px" src={xpSvg} width="20px" />
        </HStack>
        <Image
          alt="xp-box-right"
          h="100%"
          src={xpBoxLeftSvg}
          transform="rotate(180deg)"
          w="12px"
        />
      </HStack>
      <HStack spacing={4}>
        <Image alt="users" height="20px" src={usersSvg} width="20px" />
        <Text fontSize="lg" fontWeight="400">
          {characters.length} characters
        </Text>
      </HStack>
      <HStack spacing={4}>
        <Image alt="users" height="20px" src={itemsSvg} width="20px" />
        <Text fontSize="lg" fontWeight="400">
          {items.length} items
        </Text>
      </HStack>
    </VStack>
  );
};
