import { Box, styled } from "@mui/material";
import { Link } from "react-router-dom";

export const Wrapper = styled(Box)(({ isopen, theme }) => ({
  position: "relative",
  minHeight: "100vh",
  // width: "20%",
  padding: "0",
  display: "flex",
  flexDirection: "column",
  flexShrink: "0",
  zIndex: "20",
  justifyContent: "start",
  overflowY: "auto",
  [theme.breakpoints.down(1440)]: {
    width: "25%",
  },

  [theme.breakpoints.down("md")]: {
    width: "300px",
    position: "fixed",
    left: 0,
    transform: isopen === "true" ? "translateX(0%)" : "translateX(-100%)",
    top: 0,
    transition: "all .5s",

    ".close-btn": {
      position: "absolute",
      right: "15px",
      top: "10px",

      ".MuiSvgIcon-fontSizeMedium": {
        fontSize: "24px",
      },
    },
  },

  ".sidebar-logo": {
    justifyContent: "center",
    borderBottom: "1px solid var(--border-subtle)",
    padding: "20px 50px",

    [theme.breakpoints.down(767)]: {
      padding: "20px",
      justifyContent: "flex-start",
      img: {
        maxWidth: "150px",
      },
    },
  },

  ".nav-item-list": {
    maxHeight: "300px",
    overflowY: "auto",
  },
}));

export const WalletDetails = styled(Box)(({ theme }) => ({
  padding: "30px",
  paddingLeft: "50px",
  background: "var(--surface-elevated)",
  display: "flex",
  alignItems: "start",
  flexDirection: "column",

  ".wallet-name": {
    fontSize: "20px",
    marginBottom: "12px",
    textTransform: "capitalize",
  },
  ".wallet-balance": {
    display: "flex",
    alignItems: "center",
    fontSize: "13px",
    marginBottom: "7px",
    textTransform: "capitalize",

    "&__amount": {
      fontSize: "24px",
      fontWeight: "700",
      wordBreak: "break-all",
    },
  },
  ".MuiSvgIcon-root": {
    fill: "transparent",
    flexShrink: "0",
  },

  [theme.breakpoints.down(1440)]: {
    ".wallet-name": {
      fontSize: "15px",
      marginBottom: "7px",
    },
    ".wallet-balance": {
      fontSize: "13px",

      "&__amount": {
        fontSize: "22px",
      },
    },
  },
  [theme.breakpoints.down(767)]: {
    br: {
      display: "none",
    },
    padding: "20px",
    ".wallet-balance": {
      marginBottom: "0",
      fontSize: "11px",

      "&__amount": {
        fontSize: "18px",
      },
    },
  },
}));

export const NavItem = styled(Link)(({ theme, active }) => ({
  display: "flex",
  alignItems: "center",
  padding: "15px 50px",
  textDecoration: "none",
  color:
    active === "true" ? theme.palette.blue.main : theme.palette.text.secondary,

  ".MuiTypography-root": {
    fontSize: "18px",
  },
  ".MuiSvgIcon-root": {
    flexShrink: "0",
    fontSize: "20px",
    path: {
      fill:
        active === "true"
          ? theme.palette.blue.main
          : theme.palette.text.secondary,
    },
  },
  [theme.breakpoints.down(1440)]: {
    padding: "10px 30px",

    ".MuiTypography-root": {
      fontSize: "16px",
    },
    ".MuiSvgIcon-root": {
      fontSize: "18px",
    },
  },
  [theme.breakpoints.down(767)]: {
    padding: "5px 20px",

    ".MuiTypography-root": {
      fontSize: "13px",
    },
    ".MuiSvgIcon-root": {
      fontSize: "16px",
    },
  },
}));

export const Btn = styled(Link)(({ theme, active }) => ({
  display: "flex",
  alignItems: "center",
  padding: "15px 50px",
  textDecoration: "none",
  color:
    active === "true" ? theme.palette.blue.main : theme.palette.text.secondary,

  ".MuiTypography-root": {
    fontSize: "18px",
  },
  ".MuiSvgIcon-root": {
    flexShrink: "0",
    fontSize: "20px",
    path: {
      fill:
        active === "true"
          ? theme.palette.blue.main
          : theme.palette.text.secondary,
    },
  },
  [theme.breakpoints.down(1440)]: {
    padding: "10px 30px",

    ".MuiTypography-root": {
      fontSize: "16px",
    },
    ".MuiSvgIcon-root": {
      fontSize: "18px",
    },
  },
  [theme.breakpoints.down(767)]: {
    padding: "5px 20px",

    ".MuiTypography-root": {
      fontSize: "13px",
    },
    ".MuiSvgIcon-root": {
      fontSize: "16px",
    },
  },
}));

export const SubLink = styled(Link)(({ theme, active }) => ({
  ...theme.typography.body2,
  textDecoration: "none",
  textTransform: "capitalize",
  color:
    active === "true"
      ? `${theme.palette.blue.main} !important`
      : `${theme.palette.text.secondary} !important`,
}));

export const NodeBox = styled(Box)(({ theme }) => ({
  // background: theme.palette.blue.lightBlue,
  background: "var(--surface-elevated)",
  margin: "30px",
  padding: "25px 32px",
  borderRadius: "10px",
  border: "1px solid var(--border-subtle)",
  position: "relative",
  // display: 'flex',
  // alignItems: 'start',

  ".refresh-wrap": {
    display: "flex",
    alignItems: "start",
  },

  ".node-text": {
    fontSize: "20px",
    fontWeight: "700",
    // marginLeft: '15px',
    marginBottom: "12px",
    lineHeight: "23px",
    color: theme.palette.blue.newBlue,
  },
  ".ver-text": {
    fontSize: "14px",
    fontWeight: "400",
    lineHeight: "20px",
  },

  input: {
    color: "var(--text-primary)",
    background: "var(--surface-elevated)",
    border: "0",
    padding: "10px 15px",
    borderRadius: "5px",
    marginBottom: "10px",
    width: "100%",

    "&:placeholder": {
      color: "var(--text-primary)",
      opacity: 0.5,
    },

    "&:focus": {
      boxShadow: "unset",
      outline: "0",
    },
  },

  button: {
    display: "block",
    padding: "5px 10px",
    marginBottom: "10px",
    borderRadius: "5px",
    cursor: "pointer",
    // background: "linear-gradient(to right, var(--brand-primary) 50%, var(--brand-primary-strong) 100% )",
    color: "var(--text-primary)",
    border: "0",
    "&:hover": {
      opacity: "0.6",
      background: "var(--brand-primary)",
      color: "var(--brand-on-primary)",
    },
  },

  [theme.breakpoints.down(1440)]: {
    padding: "20px",
    ".node-text": {
      fontSize: "16px",
      marginBottom: "14px",
    },
    ".ver-text": {
      fontSize: "12px",
      lineHeight: "16px",
    },
    ".MuiSvgIcon-fontSizeMedium": {
      fontSize: "24px",
    },
  },

  [theme.breakpoints.down(767)]: {
    margin: "20px",
  },
}));
