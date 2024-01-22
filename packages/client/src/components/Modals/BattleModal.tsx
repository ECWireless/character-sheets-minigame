import {
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  Text,
} from '@chakra-ui/react';

export const BattleModal: React.FC = () => {
  return (
    <Modal
      closeOnEsc
      closeOnOverlayClick
      isOpen={true}
      onClose={() => undefined}
    >
      <ModalOverlay />
      <ModalContent h="100vh" m={0} maxH="100vh" minW="100%" w="100%">
        <ModalHeader>
          <Text textAlign="left" textTransform="initial" fontWeight="500">
            Battle
          </Text>
          <ModalCloseButton size="lg" />
        </ModalHeader>
        <ModalBody></ModalBody>
      </ModalContent>
    </Modal>
  );
};
