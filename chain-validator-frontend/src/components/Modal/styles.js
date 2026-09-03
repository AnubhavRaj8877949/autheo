import { Button, Dialog, styled, Backdrop } from "@mui/material";

export const StyledDialog = styled(Dialog)(({ theme }) => ({
  zIndex: 20000,
  backgroundColor: "rgba(11, 12, 23, 0.55)",
  backdropFilter: "blur(5px)",
  "& .MuiPaper-root": {
    minWidth: 320,
    maxWidth: "460px",
    padding: "30px 24px",
    background: "var(--surface-raised)",
    border: "1px solid var(--border-default)",
    backdropFilter: "blur(10px)",
    borderRadius: "var(--radius-2xl)",
  },
}));

export const OkButton = styled(Button)(() => ({
  width: 150,
  backgroundColor: "var(--brand-primary)",
  border: "none",
  color: "var(--brand-on-primary)",
  textTransform: "capitalize",
  borderRadius: "var(--radius-lg)",
  fontWeight: "var(--font-weight-semibold)",
  "&:hover": {
    backgroundColor: "var(--brand-primary-strong)",
    border: "none",
  },
}));

export const CancelButton = styled(Button)(() => ({
  width: 150,
  backgroundColor: "transparent",
  border: "1px solid var(--border-default)",
  color: "var(--text-primary)",
  textTransform: "capitalize",
  borderRadius: "var(--radius-lg)",
  "&:hover": {
    backgroundColor: "var(--surface-overlay)",
    border: "1px solid var(--border-strong)",
  },
}));
