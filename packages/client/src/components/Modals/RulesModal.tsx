import {
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  Text,
} from '@chakra-ui/react';

type RulesModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

export const RulesModal: React.FC<RulesModalProps> = ({ isOpen, onClose }) => {
  return (
    <Modal closeOnEsc closeOnOverlayClick isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent mt={{ base: 0, md: '84px' }}>
        <ModalHeader>
          <Text textAlign="left" textTransform="initial" fontWeight="500">
            Rules
          </Text>
          <ModalCloseButton size="lg" />
        </ModalHeader>
        <ModalBody>
          <Text>
            Defeat Moloch! There are 4 moloch soldiers roaming the map. You can
            go fast by playing alone, or you can form a raid party (by trading
            cards) with other players, and go far.
          </Text>
          <Text fontSize="lg" fontWeight={500} mt={8}>
            Selecting a Class
          </Text>
          <Text fontSize="sm" mt={2}>
            Each class has unique modifiers that affect your character&apos;s
            stats. To select a class, click the &quot;Raid Party&quot; button in
            the top-right corner of the screen. In the popup, you&apos;ll have
            the ability to pick a class for each of your 3 cards.
          </Text>
          <Text fontSize="lg" fontWeight={500} mt={8}>
            Trading Cards
          </Text>
          <Text fontSize="sm" mt={2}>
            To trade cards with another player, select the other player on the
            map (they must be spawned). When their party popup opens, click
            &quot;Trade Cards&quot;. When the next popup opens, lock in the
            cards you want to give and receive, then click &quot;Make
            Offer.&quot; The other player can then accept or reject your offer.
            When you receive a new card, you will have the opportunity to select
            a new class for that card.
          </Text>
          <Text fontSize="sm" mt={2}>
            Note that you start with 3 personal cards (the card representing
            your character) that you can trade with 2 other players. You must
            have at least 1 of these personal cards in your party at all times,
            and no player can hold 2 of the same cards (except for their own
            personal cards).
          </Text>
          <Text fontSize="lg" fontWeight={500} mt={8}>
            Battling Moloch
          </Text>
          <Text fontSize="sm" mt={2}>
            To battle a Moloch Soldier, make sure you are spawned on the map
            (click the map after logging in), then walk up to a living moloch
            and hit &quot;enter&quot; or &quot;e.&quot; If you run from battle
            or die, you&apos;ll reappear on the map, where you can re-battle the
            Moloch Soldier at any time.
          </Text>
          <Text fontSize="sm" mt={2}>
            Beating a Moloch Soldier grants you a place on the leaderboard. Note
            that there are only 4 Moloch Soldiers, and each player can only kill
            1 Moloch, so there is a max of 4 players on the leaderboard.
          </Text>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};
