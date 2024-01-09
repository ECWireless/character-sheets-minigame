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
            Defeat Moloch! There are 3 moloch soldiers roaming the map. You can
            go fast by playing alone, or you can form a raid party with other
            characters, and go far.
          </Text>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};
