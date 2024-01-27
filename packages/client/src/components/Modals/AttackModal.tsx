import {
  HStack,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  Spinner,
  Text,
  VStack,
} from '@chakra-ui/react';
import { useCallback, useState } from 'react';
import { useAccount } from 'wagmi';

import { useMUD } from '../../contexts/MUDContext';
import { useToast } from '../../hooks/useToast';
import {
  MOLOCH_SOLDIER_STATS,
  POWER_TYPE,
  WEAPON_STATS,
} from '../../utils/constants';
import { EquippedItem, Stats } from '../../utils/types';

const calculateDamage = (
  itemId: string,
  characterStats: Stats,
  wearableBonuses: Omit<Stats, 'health'>,
) => {
  const { power, type } = WEAPON_STATS[itemId];

  if (type === POWER_TYPE.ATTACK) {
    const attackStat = characterStats['attack'];
    const attackBonus = wearableBonuses['attack'];
    const molochDefense = MOLOCH_SOLDIER_STATS['attack'];

    const damage = attackStat + attackBonus + Number(power) - molochDefense;
    return damage > 0 ? damage : 0;
  } else if (type === POWER_TYPE.SPECIAL_ATTACK) {
    const attackStat = characterStats['specialAttack'];
    const attackBonus = wearableBonuses['specialAttack'];
    const molochDefense = MOLOCH_SOLDIER_STATS['specialAttack'];

    const damage = attackStat + attackBonus + Number(power) - molochDefense;
    return damage > 0 ? damage : 0;
  } else {
    return 0;
  }
};

type AttackModalProps = {
  characterStats: Stats;
  equippedWeapons: EquippedItem[];
  isOpen: boolean;
  onClose: () => void;
  wearableBonuses: Omit<Stats, 'health'>;
};

export const AttackModal: React.FC<AttackModalProps> = ({
  characterStats,
  equippedWeapons,
  isOpen,
  onClose,
  wearableBonuses,
}) => {
  const { address } = useAccount();
  const {
    systemCalls: { attack },
  } = useMUD();
  const { renderError, renderSuccess } = useToast();

  const [isAttacking, setIsAttacking] = useState(false);

  const onAttack = useCallback(
    async (itemId: string) => {
      try {
        if (!address) throw new Error('No address found');

        setIsAttacking(true);

        const damage = calculateDamage(itemId, characterStats, wearableBonuses);

        const success = await attack(address, damage);
        if (!success) {
          throw new Error('Attack failed');
        }

        renderSuccess('Moloch Soldier hit with ' + damage + ' damage!');
        onClose();
      } catch (e) {
        renderError(e, 'Error attacking Moloch Soldier!');
      } finally {
        setIsAttacking(false);
      }
    },
    [
      address,
      attack,
      characterStats,
      onClose,
      renderError,
      renderSuccess,
      wearableBonuses,
    ],
  );

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
            {isAttacking ? (
              <VStack spacing={8}>
                <Text>Attacking...</Text>
                <Spinner size="xl" />
              </VStack>
            ) : (
              equippedWeapons.map(e => {
                return (
                  <VStack
                    align="flex-start"
                    as="button"
                    border="2px solid rgba(219, 211, 139, 0.75)"
                    key={e.id}
                    onClick={() =>
                      isAttacking ? undefined : onAttack(e.itemId)
                    }
                    p={4}
                    _hover={
                      isAttacking
                        ? {
                            cursor: 'not-allowed',
                          }
                        : {
                            cursor: 'pointer',
                            border: '2px solid white',
                          }
                    }
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
              })
            )}
          </HStack>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};
