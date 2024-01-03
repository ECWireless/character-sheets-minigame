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
  useRadioGroup,
  useToast,
  Wrap,
  WrapItem,
} from '@chakra-ui/react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useAccount } from 'wagmi';

import villagerImage from '../../assets/villager/villager.png';
import { ClassTag } from '../../components/ClassTag';
import { RadioOption } from '../../components/RadioOption';
import { useGame } from '../../contexts/GameContext';
import { useMUD } from '../../contexts/MUDContext';
import { useRaidParty } from '../../contexts/RaidPartyContext';

type RaidPartyModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

export const RaidPartyModal: React.FC<RaidPartyModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { address } = useAccount();
  const { character } = useGame();
  const {
    systemCalls: { removeAvatarClass, setAvatarClass },
  } = useMUD();
  const { avatarClassId } = useRaidParty();
  const toast = useToast();

  const [isSaving, setIsSaving] = useState(false);

  const { getRootProps, getRadioProps, setValue, value } = useRadioGroup({
    name: 'avatar class',
    defaultValue: '-1',
  });

  const { classes } = character ?? {};
  const classesWithVillager = useMemo(() => {
    if (!classes) return [];
    const villagerClass = {
      name: 'Villager',
      description: 'A simple villager',
      image: villagerImage,
      equippable_layer: null,
      attributes: [],
      id: '-1',
      classId: '-1',
      uri: '',
      claimable: false,
      holders: [],
    };

    return [villagerClass, ...classes];
  }, [classes]);

  const options = useMemo(() => {
    return classesWithVillager.map(c => c.classId);
  }, [classesWithVillager]);

  const resetData = useCallback(() => {
    setValue(avatarClassId);
  }, [avatarClassId, setValue]);

  useEffect(() => {
    if (isOpen) {
      resetData();
    }
  }, [resetData, isOpen]);

  const hasChanged = useMemo(() => {
    return avatarClassId !== value;
  }, [avatarClassId, value]);

  const onSetAvatarClass = useCallback(async () => {
    if (!(address && character && classes)) return;
    setIsSaving(true);

    try {
      if (value === '-1') {
        await removeAvatarClass(address);
      } else {
        await setAvatarClass(address, value.toString());
      }

      toast({
        title: 'Raid Party updated!',
        status: 'success',
        position: 'top',
        duration: 5000,
        isClosable: true,
      });

      onClose();
    } catch (e) {
      console.error(e);
      toast({
        title: 'Error updating Raid Party',
        status: 'error',
        position: 'top',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsSaving(false);
    }
  }, [
    address,
    character,
    classes,
    onClose,
    removeAvatarClass,
    setAvatarClass,
    toast,
    value,
  ]);

  if (!(address && character && classes)) return null;

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
          <Text>Select a class-based avatar</Text>
          <Wrap mt={2} spacing={2} {...getRootProps()}>
            {options.map(value => {
              const radio = getRadioProps({ value });
              const _class = classesWithVillager.find(c => c.classId === value);
              if (!_class) return null;

              return (
                <WrapItem key={_class.classId + _class.name}>
                  <RadioOption {...radio}>
                    <ClassTag {..._class} size="md" />
                  </RadioOption>
                </WrapItem>
              );
            })}
          </Wrap>
          <HStack justifyContent="flex-end" mt={4}>
            <Button
              isLoading={isSaving}
              loadingText="Saving..."
              isDisabled={!hasChanged}
              onClick={onSetAvatarClass}
            >
              Save
            </Button>
          </HStack>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};
