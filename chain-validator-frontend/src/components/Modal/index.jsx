import { DialogActions, DialogContent, Typography } from "@mui/material";
import { StyledDialog, OkButton } from "./styles";

const LogoutModal = ({ isOpen, handleClose }) => {
  return (
    <StyledDialog
      open={isOpen}
      onClose={handleClose}
      aria-labelledby="logout-dialog-title"
      aria-describedby="logout-dialog-description"
    >
      <Typography variant="h1" color="text.primary" textAlign="center">
        Notification
      </Typography>
      <DialogContent sx={{ padding: "12px 0 24px" }}>
        <Typography variant="h6" color="text.primary" textAlign="center">
          Your node is not connected
        </Typography>
      </DialogContent>
      <DialogActions sx={{ justifyContent: "center" }}>
        <OkButton variant="contained" onClick={handleClose}>
          Ok
        </OkButton>
      </DialogActions>
    </StyledDialog>
  );
};

export default LogoutModal;
