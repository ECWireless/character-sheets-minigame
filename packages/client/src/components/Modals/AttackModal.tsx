import {
  HStack,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  Text,
  VStack,
} from '@chakra-ui/react';

import { WEAPON_STATS } from '../../utils/constants';
import { EquippedItem } from '../../utils/types';

type AttackModalProps = {
  equippedWeapons: EquippedItem[];
  isOpen: boolean;
  onClose: () => void;
};

export const AttackModal: React.FC<AttackModalProps> = ({
  equippedWeapons,
  isOpen,
  onClose,
}) => {
  return (
    <Modal closeOnEsc closeOnOverlayClick isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent mt={{ base: 0, md: '84px' }}>
        <ModalHeader>
          <Text textAlign="left" textTransform="initial" fontWeight="500">
            Select a Move
          </Text>
          <ModalCloseButton size="lg" />
        </ModalHeader>
        <ModalBody>
          {equippedWeapons.length === 0 && (
            <Text color="orange">
              (you must equip an non-wearable item to learn a move)
            </Text>
          )}
          <HStack justify="center" mt={2} spacing={4}>
            {equippedWeapons.map(e => {
              return (
                <VStack
                  align="flex-start"
                  border="2px solid rgba(219, 211, 139, 0.75)"
                  key={e.id}
                  p={4}
                  _hover={{
                    cursor: 'pointer',
                    border: '2px solid white',
                  }}
                >
                  <Text fontSize="sm" textAlign="left">
                    {e.name}
                  </Text>
                  <Text fontSize="xs">
                    Type:{' '}
                    <Text
                      as="span"
                      color={String(WEAPON_STATS[e.itemId].color)}
                    >
                      {WEAPON_STATS[e.itemId].type}
                    </Text>
                  </Text>
                  <Text fontSize="xs">
                    Power:{' '}
                    <Text
                      as="span"
                      color="rgba(219, 211, 139, 0.75)"
                      fontWeight={500}
                    >
                      {WEAPON_STATS[e.itemId].power}
                    </Text>
                  </Text>
                </VStack>
              );
            })}
          </HStack>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};
