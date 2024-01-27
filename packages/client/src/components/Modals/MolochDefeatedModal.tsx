import {
  Button,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  Text,
  VStack,
} from '@chakra-ui/react';

type MolochDefeatedModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

export const MolochDefeatedModal: React.FC<MolochDefeatedModalProps> = ({
  isOpen,
  onClose,
}) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent mt={{ base: 0, md: '84px' }}>
        <ModalHeader>
          <Text fontWeight={500} textAlign="left" textTransform="initial">
            Moloch Soldier Defeated
          </Text>
          <ModalCloseButton size="lg" />
        </ModalHeader>
        <ModalBody>
          <VStack spacing="24px">
            <Text fontSize="lg" textAlign="center">
              Congrats! You defeated Moloch! You have have claimed your place on
              the leaderboard.
            </Text>
            <Button onClick={() => window.location.reload()}>Close</Button>
          </VStack>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};
