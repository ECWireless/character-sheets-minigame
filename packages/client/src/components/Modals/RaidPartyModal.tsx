import {
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  Text,
} from '@chakra-ui/react';

type RaidPartyModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

export const RaidPartyModal: React.FC<RaidPartyModalProps> = ({
  isOpen,
  onClose,
}) => {
  return (
    <Modal closeOnEsc closeOnOverlayClick isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent mt={{ base: 0, md: '84px' }}>
        <ModalHeader>
          <Text textAlign="left" textTransform="initial" fontWeight="500">
            Raid Party
          </Text>
          <ModalCloseButton size="lg" />
        </ModalHeader>
        <ModalBody>
          <Text>Raid Party</Text>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};
