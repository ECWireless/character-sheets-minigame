import {
  AspectRatio,
  Button,
  Heading,
  HStack,
  Image,
  Link,
  Text,
  VStack,
} from '@chakra-ui/react';
import React from 'react';
import { useNavigate } from 'react-router-dom';

import { GameTotals } from '../components/GameTotals';
import { CHAIN_ID_TO_LABEL, EXPLORER_URLS } from '../lib/web3';
import { shortenAddress, shortenText } from '../utils/helpers';
import { GameMeta } from '../utils/types';

type GameCardProps = GameMeta & {
  chainId: number;
};

export const GameCard: React.FC<GameCardProps> = ({
  chainId,
  characters,
  experience,
  id,
  image,
  items,
  name,
  description,
}) => {
  const navigate = useNavigate();

  return (
    <HStack
      bg="cardBG"
      justify="space-between"
      p={8}
      transition="background 0.3s ease"
      w="100%"
      spacing={12}
    >
      <AspectRatio ratio={1} w="100%" maxW="12rem">
        <Image
          alt="game emblem"
          objectFit="cover"
          src={image}
          w="100%"
          h="100%"
        />
      </AspectRatio>
      <VStack spacing={4} align="flex-start" flex={1}>
        <Heading
          display="inline-block"
          fontSize="40px"
          fontWeight="normal"
          lineHeight="40px"
        >
          {name}
        </Heading>
        <VStack spacing={2} align="flex-start">
          <Text fontWeight={200} mb={2}>
            {shortenText(description, 60)}
          </Text>
          <Link
            fontSize="sm"
            href={`${EXPLORER_URLS[chainId]}/address/${id}`}
            isExternal
            fontWeight={300}
            mb={3}
            textDecoration={'underline'}
          >
            {shortenAddress(id)}
          </Link>
        </VStack>
        <Button
          onClick={() => navigate(`/${CHAIN_ID_TO_LABEL[chainId]}/${id}`)}
          variant="play"
        >
          play
        </Button>
      </VStack>

      <GameTotals
        experience={experience}
        characters={characters}
        items={items}
      />
    </HStack>
  );
};
