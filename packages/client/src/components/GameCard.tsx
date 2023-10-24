import {
  AspectRatio,
  Heading,
  HStack,
  Image,
  Link,
  Text,
  VStack,
} from "@chakra-ui/react";
import React from "react";

import { GameTotals } from "../components/GameTotals";
import { EXPLORER_URLS } from "../utils/constants";
import { shortenAddress, shortenText } from "../utils/helpers";
import { GameMeta } from "../utils/types";
import { useNavigate } from "react-router-dom";

type GameCardProps = GameMeta & {
  chainId: number;
};

export const GameCard: React.FC<GameCardProps> = ({
  chainId,
  characters,
  description,
  experience,
  id,
  image,
  items,
  name,
}) => {
  const navigate = useNavigate();

  return (
    <HStack
      bg="cardBG"
      justify="space-between"
      p={8}
      spacing={12}
      transition="background 0.3s ease"
      w="100%"
    >
      <AspectRatio maxW="12rem" ratio={1} w="100%">
        <Image
          alt="game emblem"
          background="gray.400"
          h="100%"
          objectFit="cover"
          onClick={() => navigate(`/${id}`)}
          src={image}
          w="100%"
          _hover={{
            cursor: "pointer",
          }}
        />
      </AspectRatio>
      <VStack align="flex-start" flex={1} spacing={4}>
        <Heading
          display="inline-block"
          fontSize="40px"
          fontWeight="normal"
          lineHeight="40px"
          onClick={() => navigate(`/${id}`)}
          _hover={{
            color: "accent",
            cursor: "pointer",
          }}
        >
          {name}
        </Heading>
        <Text fontSize="xl" fontWeight={200} mb={2}>
          {shortenText(description, 60)}
        </Text>
        <Link
          fontSize="sm"
          fontWeight={300}
          href={`${EXPLORER_URLS[chainId]}/address/${id}`}
          isExternal
          mb={3}
          textDecoration={"underline"}
        >
          {shortenAddress(id)}
        </Link>
      </VStack>

      <GameTotals
        characters={characters}
        experience={experience}
        items={items}
      />
    </HStack>
  );
};
