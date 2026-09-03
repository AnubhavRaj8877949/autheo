/*eslint-disable*/
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { logout } from '../../redux/reducer/auth';
import { useDispatch } from 'react-redux';
import { useGetNodeUrl } from '../../context/NodeUrl';
import { toast } from '../Common/Toast/Toast';
import { ROUTE_PATHS } from '../../constants';
const events = ['load', 'mousemove', 'mousedown', 'click', 'scroll', 'keypress'];

const AppLogout = ({ children }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { setIsNodeAdded, setNodeUrl } = useGetNodeUrl();
  let timer;

  const handleLogoutTimer = () => {
    timer = setTimeout(() => {
      resetTimer();
      Object.values(events).forEach((item) => {
        window.removeEventListener(item, resetTimer);
      });
      // logs out user
      logoutAction();
    }, 600000);
  };

  const resetTimer = () => {
    if (timer) clearTimeout(timer);
  };

  useEffect(() => {
    Object.values(events).forEach((item) => {
      window.addEventListener(item, () => {
        resetTimer();
        handleLogoutTimer();
      });
    });
  }, []);

  const logoutAction = () => {
    dispatch(logout());
    setIsNodeAdded(false);
    setNodeUrl('')
    navigate(ROUTE_PATHS.LOGIN);
  };

  return children;
};

export default AppLogout;
