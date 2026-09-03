import { toast as reactToast } from 'react-toastify';

class Toaster {
  success(message, title) {
    reactToast.success(title ? `${title}: ${message}` : message);
  }
  warning(message, title) {
    reactToast.warn(title ? `${title}: ${message}` : message);
  }
  error(message, title) {
    reactToast.error(title ? `${title}: ${message}` : message);
  }
  info(message, title, cb = () => {}) {
    reactToast.info(title ? `${title}: ${message}` : message, {
      onClose: cb
    });
  }
}

export const toast = new Toaster();
