import {
  Button,
  HStack,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  Text,
} from '@chakra-ui/react';

import { useRaidParty } from '../../contexts/RaidPartyContext';

export const BattleInitiationModal: React.FC = () => {
  const {
    isBattleInitiationModalOpen: isOpen,
    isInitiatingBattle,
    onCloseBattleInitiationModal: onClose,
    onInitiateBattle,
  } = useRaidParty();

  return (
    <Modal closeOnEsc closeOnOverlayClick isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent mt={{ base: 0, md: '84px' }}>
        <ModalHeader>
          <Text textAlign="left" textTransform="initial" fontWeight="500">
            Initiate Battle
          </Text>
          <ModalCloseButton size="lg" />
        </ModalHeader>
        <ModalBody>
          <Text>You are about to initiate a battle with a Moloch Soldier.</Text>
          <HStack mt="4">
            <Button isDisabled={isInitiatingBattle} onClick={onClose}>
              Cancel
            </Button>
            <Button
              isDisabled={isInitiatingBattle}
              isLoading={isInitiatingBattle}
              loadingText="Confirming..."
              onClick={onInitiateBattle}
              variant="solid"
            >
              Confirm
            </Button>
          </HStack>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};
