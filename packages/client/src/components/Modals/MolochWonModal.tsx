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

type MolochWonModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

export const MolochWonModal: React.FC<MolochWonModalProps> = ({
  isOpen,
  onClose,
}) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent mt={{ base: 0, md: '84px' }}>
        <ModalHeader>
          <Text fontWeight={500} textAlign="left" textTransform="initial">
            Moloch Soldier Won
          </Text>
          <ModalCloseButton size="lg" />
        </ModalHeader>
        <ModalBody>
          <VStack spacing="24px">
            <Text fontSize="lg" textAlign="center">
              Sorry, it looks like Moloch got the best of you this time. Change
              your party classes or trade cards with another player to improve
              your chances of winning!
            </Text>
            <Button onClick={() => window.location.reload()}>Close</Button>
          </VStack>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};
