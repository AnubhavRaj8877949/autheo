import { Box, styled } from "@mui/material";
import { Link } from "react-router-dom";

export const Wrapper = styled(Box)(({ isopen, theme }) => ({
  position: "relative",
  minHeight: "100vh",
  width: "20%",
  background: "var(--theme-bg-secondary)",
  padding: "0",
  transition: "background-color 0.3s ease",
  display: "flex",
  flexDirection: "column",
  flexShrink: "0",
  zIndex: "20",
  justifyContent: "start",
  overflowY: "auto",
  [theme.breakpoints.down(1440)]: {
    width: "22%",
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
  flex_item: {
    display: "flex",
  },
  ".sidebar-logo": {
    justifyContent: "flex-start",
    borderBottom: "1px solid var(--border-subtle)",
    padding: "25px 50px",

    [theme.breakpoints.down(1440)]: {
      padding: "20px",
      justifyContent: "flex-start",
      img: {
        maxWidth: "150px",
      },
    },

    img: {
      maxWidth: "175px",
      width: "100%",
      [theme.breakpoints.down(767)]: {
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
  ".addressCopy": {
    backgroundColor: "var(--surface-elevated)",
    borderRadius: "8px",
    display: "flex",
    alignItems: "center",
    padding: "16px 15px",
    maxwidth: " 290px",
    width: "100%",
    span: {
      maxWidth: "230px",
      whiteSpace: "nowrap",
      overflow: "hidden",
      textOverflow: "ellipsis",
      display: "block",
      [theme.breakpoints.down(767)]: {
        maxWidth: "200px",
      },
    },
    svg: {
      fontSize: "22px",
    },
  },

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
  [theme.breakpoints.down(1440)]: {
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
    padding: "10px 20px",

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
  background: theme.palette.blue.lightBlue,
  margin: "30px",
  padding: "10px 32px",
  borderRadius: "14px",
  display: "flex",
  alignItems: "start",

  ".node-text": {
    fontSize: "20px",
    fontWeight: "700",
    marginBottom: "12px",
    color: "var(--text-primary)",
  },
  ".ver-text": {
    fontSize: "14px",
    fontWeight: "400",
    lineHeight: "20px",
  },
  [theme.breakpoints.down(1440)]: {
    padding: "20px",
    ".node-text": {
      fontSize: "16px",
      marginBottom: "15px",
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

// export const SidebarWrapper = styled(Box)(({ isopen, theme }) => ({
//   position: 'fixed',
//   top: '0',
//   bottom: '0',
//   zIndex: '9999',
//   [theme.breakpoints.down('md')]: {
//     width: isopen === 'true' ? '100vw' : '0vw',
//     background: 'rgba(0, 0,0, 0.5)',
//   },
// }));

// style.js

export const Mobilereasponsive = styled(Box)(({ theme }) => ({
  position: "sticky",
  top: "0",
  zIndex: 999,
  ".mobileresponsive": {
    justifyContent: "space-between",
    alignItems: "center",
    padding: "10px 20px",
    backgroundColor: "var(--theme-bg-header)",
    boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
    maxWidth: "1224px",
    width: "100%",
    margin: "auto",
    display: "none",

    [theme.breakpoints.down(1224)]: {
      display: "flex!important",

      // display: "block !important",
      justifyContent: "space-between",
    },
    ".open-icon": {
      color: "black",
      cursor: "pointer"
    },
  },
  ".logo": {
    marginRight: "auto",
    width: "160px",
    height: "60px",
  },
  ".headerWrapper": {
    ".header": {
      flexDirection: "column !important",
    },
  },
}));

export const Drawersidebar = styled(Box)(({ theme }) => ({
  ".MuiDrawer-root": {
    background: "var(--surface-elevated)",
  },
  ".headerWrapper": {
    backgroundColor: "var(--theme-bg-header)",
    position: "sticky",
    top: 0,
    zIndex: 1000,
    width: "300px",
  },

  ".header": {
    minHeight: "100vh",
    display: "flex",
    flexDirection: "column",
    justifyContent: "flex-start",
    alignItems: "center",
    padding: "10px 20px",
    backgroundColor: "var(--theme-bg-header)",
    // boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
    width: "100%",
    margin: "auto",
    gap: "20px",
  },
  ".headerRight": {
    width: "100%",
    display: "flex",
    flexDirection: "column",
    alignItems: "stretch",
    gap: "12px",
  },
  ".network-selector": {
    width: "100%",
  },
  ".network-selector-btn": {
    width: "100%",
    justifyContent: "space-between",
  },
  ".wallet-header-btn": {
    width: "100%",
    justifyContent: "space-between",
  },
  ".logo": {
    marginRight: "auto",
    width: "160px",
  },
  ".headerLinks": {
    marginRight: "auto",
    paddingTop: "30px",
    ul: {
      listStyleType: "none",
      margin: 0,
      padding: 0,
    },
    li: {
      margin: "0 15px",
      display: "flex",
      flexDirection: "column",
      gap: "25px",
    },

    ".link": {
      textDecoration: "none",
      color: "var(--theme-text-secondary)",
      fontSize: "16px",
      fontWeight: "500",
      textTransform: "capitalize",
      padding: 0,
      width: "100%",
      display: "block",
      whiteSpace: "nowrap",
      ".link.active": {
        color: "var(--brand-primary)" /* Example color for active link */,
        fontWeight: "bold",
      },
    },
    ".switchApp button": {
      color: "var(--theme-text-secondary)",
      fontSize: "15px",
      fontWeight: 700,
      textTransform: "capitalize",
      padding: 0,
      " .MuiPaper-root .css-o821ap-MuiPaper-root-MuiPopover-paper-MuiMenu-paper":
      {
        backgroundColor: "green !important",
        maxWidth: "150px",
        width: "100%",
        display: "block",
      },
    },
    button: {
      whiteSpace: "nowrap",
    },
  },
  ".active": {
    color: "var(--brand-primary) !important",
  },
  ".headerButtons": {
    display: "flex",
    gap: "15px",
    width: "100%",
    flexDirection: "column",
    [theme.breakpoints.down(1224)]: {
      maxWidth: "275px",
      marginRight: "auto",
    },

    ".btns": {
      svg: {
        marginLeft: "5px",
        path: {
          stroke: "var(--text-primary)",
        },
      },
    },
    ".dropdown": {
      "& ul": {
        background: "green !important", // Corrected syntax for nested selectors
      },
    },
  },
}));

export const Descktop = styled(Box)(({ theme }) => ({
  position: "sticky",
  width: "100%",
  top: 0,
  zIndex: 1000,
  ".headerWrapper": {
    backgroundColor: "var(--theme-bg-header)",
  },
  ".header": {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "10px 20px",
    backgroundColor: "var(--theme-bg-header)",
    // boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
    maxWidth: "1440px",
    width: "100%",
    margin: "auto",
    [theme.breakpoints.down(1224)]: {
      display: "none",
    },
  },
  " .logo": {
    width: "160px",
  },
  ".headerLinks": {
    ul: {
      listStyleType: "none",
      margin: 0,
      padding: 0,
    },
    li: {
      margin: "0 15px",
      display: "flex",
      gap: "40px",
      [theme.breakpoints.down(1366)]: {
        gap: "20px",
      },
      [theme.breakpoints.down(1199)]: {
        gap: "12px",
      },
    },

    ".link": {
      textDecoration: "none",
      color: "var(--theme-text-secondary)",
      fontSize: "16px",
      fontWeight: "500",
      textTransform: "capitalize",
      padding: 0,
      whiteSpace: "nowrap",
      ".link.active": {
        color: "var(--brand-primary)" /* Example color for active link */,
        fontWeight: "bold",
      },
    },
    ".switchApp button": {
      color: "var(--theme-text-secondary)",
      fontSize: "15px",
      fontWeight: 700,
      textTransform: "capitalize",
      padding: 0,
      " .MuiPaper-root .css-o821ap-MuiPaper-root-MuiPopover-paper-MuiMenu-paper":
      {
        backgroundColor: "green !important",
        maxWidth: "150px",
        width: "100%",
        display: "block",
      },
    },
    button: {
      whiteSpace: "nowrap",
    },
  },
  ".active": {
    color: "var(--brand-on-primary) !important",
  },
  ".headerButtons": {
    display: "flex",
    gap: "10px",
    ".btns": {
      // padding: "0 15px",
      // textTransform: "capitalize",
      // height: "40px",
      // fontStyle: "normal",
      // whiteSpace: "nowrap",
      // fontWeight: 700,
      // lineHeight: "normal",
      // letterSpacing: "0.28px",
      // color: "var(--text-primary)",
      // cursor: "pointer",
      // border: "2px solid transparent",
      // borderRadius: "25px",
      // transition: "color 0.2s ease-out, filter 0.2s ease-out",
      // "--bg": "var(--surface-elevated)",
      // "--hover-bg": "var(--theme-gradients-main)",
      // "--text": "var(--text-primary)",
      // "--hover-text": "var(--brand-on-primary)",
      "&:hover": {},
      svg: {
        marginLeft: "5px",
        path: {
          stroke: "var(--brand-on-primary)",
        },
      },
    },
  },
}));



