import React from "react";
import Button from "@mui/material/Button";
import styles from "./style";

const CommonBtn = ({ children, onClick, variant = "contained", color = "primary", size = "medium", disabled = false, fullWidth = false, startIcon = null, endIcon = null, sx = {}, ...rest }) => {
  const customStyles = color === "primary" ? styles.primaryButton : styles.secondaryButton;

  return (
    <Button variant={variant} color={color} size={size} onClick={onClick} disabled={disabled} fullWidth={fullWidth} startIcon={startIcon} endIcon={endIcon} sx={{ ...customStyles, ...sx }} {...rest}>
      {children}
    </Button>
  );
};

export default CommonBtn;
