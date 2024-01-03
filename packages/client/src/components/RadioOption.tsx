import { Box, useRadio, UseRadioProps } from '@chakra-ui/react';

type RadioOptionProps = UseRadioProps & {
  children: React.ReactNode;
};

export const RadioOption: React.FC<RadioOptionProps> = props => {
  const { getInputProps, getRadioProps } = useRadio(props);

  const input = getInputProps();
  const checkbox = getRadioProps();

  return (
    <Box as="label">
      <input {...input} />
      <Box
        {...checkbox}
        borderBottom="2px solid transparent"
        borderTop="2px solid transparent"
        cursor="pointer"
        _checked={{
          color: 'white',
          background: 'black',
          borderBottom: '2px solid white',
          borderTop: '2px solid white',
        }}
      >
        {props.children}
      </Box>
    </Box>
  );
};
