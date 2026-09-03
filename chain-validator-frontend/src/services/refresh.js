/*eslint-disable*/
import { makeStyles } from '@mui/styles';
export const useStyles = makeStyles(() => ({
  refresh: {
    marginTop: '20px',
    cursor: 'pointer',
    margin: 'auto',
    '&.spin': {
      animation: '$spin 1s 1',
      pointerEvents: 'none',
    },
  },
  '@keyframes spin': {
    '0%': {
      transform: 'rotate(0deg)',
    },
    '100%': {
      transform: 'rotate(360deg)',
    },
  },
}));
