/* eslint-disable no-unused-vars */
import { Button, Dialog, styled, Box } from "@mui/material";

export const StyledDialog = styled(Dialog)(({ theme }) => ({
  zIndex: 20000,
  background: "rgba(11, 12, 23, 0.65)",
  backdropFilter: "blur(2px)",
  textAlign: "center",
  "& .MuiPaper-root": {
    minWidth: 320,
    maxWidth: 457,
    width: "100%",
    padding: "26px 26px 68px",
    background: "var(--theme-bg-modal)",
    color: "var(--theme-text-primary)",
    border: `1px solid ${theme.palette.blue.main}`,
    backdropFilter: "blur(10px)",
    borderRadius: "20px",
    transition: "background-color 0.3s ease, color 0.3s ease",
  },
}));

export const OkButton = styled(Button)(({ theme }) => ({
  width: 150,
  backgroundColor: theme.palette.blue.main,
  border: "none",
  color: theme.palette.white.main,
  textTransform: "capitalize",
  borderRadius: "6px",
  "&:hover": {
    backgroundColor: theme.palette.blue.main,
    border: "none",
  },
}));

export const CancelIconWrapper = styled(Box)(({ theme }) => ({
  display: "flex",
  width: "100%",
  justifyContent: "flex-end",
  svg: {
    cursor: "pointer",
  },
}));

export const DialogContent = styled(Box)({
  h3: {
    margin: "20px 0",
  },
  img: {
    maxWidth: 400,
    width: "100%",
  },
});

export const BackButton = styled(Button)(({ theme }) => ({
  color: theme.palette.blue.main,
  textAlign: "center",
  marginTop: 2.6,
  textTransform: "none",
  borderBottom: `1px solid ${theme.palette.blue.main}`,
  borderRadius: "0px",
  margin: "auto",
  padding: "10.5px 0px",
}));
