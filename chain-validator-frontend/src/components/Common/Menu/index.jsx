import PropTypes from 'prop-types';
import { Menu as MuiMenu } from '@mui/material';

const Menu = ({ children, slotProps: callerSlotProps, ...props }) => {
  return (
    <MuiMenu
      slotProps={{
        paper: {
          style: { width: 155 },
          ...callerSlotProps?.paper,
        },
      }}
      {...props}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
      transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      sx={{
        '& .MuiPaper-root': {
          backgroundColor: '#292929',
          border: '1px solid #363636',
        },
        '& .MuiMenu-list': {
          paddingTop: '0px',
          paddingBottom: '0px',
          '& :hover': {
            backgroundColor: (theme) => `${theme.palette.blue.main} !important`,
          },
        },
        '& .MuiMenuItem-root': {
          padding: '12px 15px',
          borderBottom: '1px solid #363636',
          fontSize: '12px',
          justifyContent: 'center',

          '&:last-child': {
            border: '0',
          },
        },
      }}
    >
      {children}
    </MuiMenu>
  );
};

Menu.propTypes = {
  children: PropTypes.node,
  slotProps: PropTypes.shape({
    paper: PropTypes.object,
  }),
};

export default Menu;
