import { Box, styled } from '@mui/material';
import { useCallback, useState } from 'react';

const LinkDropdown = ({ children, trigger }) => {
  const [isOpen, setIsOpen] = useState(false);
  const toggleDropdown = useCallback(() => {
    setIsOpen(!isOpen);
  }, [isOpen]);

  return (
    <>
      <Box onClick={toggleDropdown} width="100%">
        {trigger}
      </Box>
      {isOpen && <Wrapper>{children}</Wrapper>}
    </>
  );
};

export default LinkDropdown;

const Wrapper = styled(Box)(() => ({
  paddingLeft: '100px',
  '>:not(:first-of-type)': {
    marginTop: '12px',
  },
  a: {
    textDecoration: 'none',
    color: 'inherit',
    padding: '10px',
    display: 'block',
  },
}));
