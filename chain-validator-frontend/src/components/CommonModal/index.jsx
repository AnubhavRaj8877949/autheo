import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import useMediaQuery from "@mui/material/useMediaQuery";
import { useTheme } from "@mui/material/styles";
import "./style.css";
import { UNBONDING_PERIOD } from "../../constants";
import CommonBtn from "../Common/CommonBtn/CommonBtn";

const CommonModal = ({ open, setOpen, title, children, message, hideActions, extra_padding }) => {
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down("md"));

  return (
    <div>
      <Dialog
        className={`messageModal ${extra_padding ? "extra_padding" : ""}`}
        fullScreen={fullScreen}
        open={open}
        onClose={() => setOpen(false)}
        aria-labelledby="responsive-dialog-title"
        // PaperProps={{
        //   sx: {
        //     backgroundColor: "var(--theme-bg-card)",
        //     border: "1px solid var(--theme-border-primary)",
        //     borderRadius: "20px",
        //     backgroundImage: "none",
        //   }
        // }}
      >
        {title && (
          <DialogTitle
            sx={{
              color: "var(--theme-text-primary)",
              textAlign: "center",
              fontSize: "1.5rem",
              fontWeight: "bold",
              padding: "1rem",
            }}
          >
            {title}
          </DialogTitle>
        )}
        <DialogContent>
          {message && (
            <DialogContentText
              sx={{
                color: "var(--brand-primary)",
                textAlign: "center",
                fontSize: "1rem",
                fontWeight: "bold",
                padding: "1rem",
              }}
            >
              {message}
            </DialogContentText>
          )}
          {children}
        </DialogContent>
        {!hideActions && (
          <DialogActions sx={{ justifyContent: "center", pb: 2 }}>
            <CommonBtn
              children="Confirm"
              onClick={() => setOpen(false)}
              color="primary"
            />
          </DialogActions>
        )}
      </Dialog>
    </div>
  );
};
export default CommonModal;
