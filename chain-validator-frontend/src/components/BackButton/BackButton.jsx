/*eslint-disable*/
import { Button } from "@mui/material";

const BackButton = ({ onClick, title, ...rest }) => {
  return (
    <button
      variant="contained"
      onClick={onClick}
      className="back-btns primary-btn"
      {...rest}
    >
      {title}
    </button>
  );
};

export default BackButton;
