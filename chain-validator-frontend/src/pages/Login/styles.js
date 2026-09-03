import { styled, Box } from "@mui/material";
import { Link as BaseLink } from "react-router-dom";

export const Link = styled(BaseLink)(({ theme }) => ({
  color: `${theme.palette.blue.main} !important`,
  textAlign: "center",
  display: "block",
}));
export const NodeBox = styled(Box)(({ theme }) => ({
  maxWidth: "448px",
  width: "100%",
  margin: " 20px auto",
  minHeight: "376px",
  background: "var(--theme-bg-card)",
  borderRadius: "24px",
  border: "1px solid",
  borderColor: "var(--theme-border-card)",
  transition: "background-color 0.3s ease, border-color 0.3s ease",
  position: "relative",

  "& .MuiBox-root": {
    padding: "40px 30px",
    paddingBottom: "0",
    [theme.breakpoints.down(767)]: {
      padding: "20px 15px",
      paddingBottom: "0",
    },
  },

  label: {
    fontSize: "14px",
    color: "var(--theme-text-primary)",
    fontWeight: "400",
    marginBottom: "0 !important",
    paddingBottom: "8px",
    display: "block",
  },
  ".validNode": {
    padding: "0",
    margin: "0",
    fontSize: "14px",
    marginTop: "4px",
    fontWeight: "400",
    textAlign: "right",
    color: "var(--theme-text-primary)",
  },

  ".refresh-wrap": {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "10px",
    marginBottom: "40px",
  },

  ".node-text": {
    color: "var(--theme-text-primary)",
    // textAlign: "center",
    // width: "100%",
    fontSize: "20px !important",
    fontWeight: "600",
    position: "relative",
    ".back-btns": {
      position: "absolute",
      left: "-55px",
      top: "-18px",
      [theme.breakpoints.down(767)]: {
        left: "-40px",
        top: "-12px",
      },
    },
  },
  ".ver-text": {
    fontSize: "14px",
    fontWeight: "400",
    lineHeight: "20px",
  },
  ".MuiInputBase-root": {
    height: "56px !important",
    overflow: "hidden !important",
    borderRadius: "7px",
  },
  input: {
    color: "var(--theme-text-primary)",
    background: "var(--theme-bg-input)",
    border: "1px solid var(--theme-border-input)",
    padding: "19.5px 16px !important",
    width: "100%",
    borderRadius: "7px !important",
    fontSize: "14px",
    transition:
      "background-color 0.3s ease, border-color 0.3s ease, color 0.3s ease",
    "&::placeholder": {
      color: "var(--theme-text-muted)",
      opacity: 1,
      fontSize: "16px !important",
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
    fontSize: "18px !important",
    // background: "linear-gradient(to right, var(--brand-primary) 50%, var(--brand-primary-strong) 100% )",
    color: "var(--text-primary)",
    border: "0",
    "&:hover": {
      opacity: "0.6",
    },
  },
  ".submit-btn": {
    "&:hover": {
      backgroundColor: "var(--brand-primary-strong) !important",
      color: "var(--brand-on-primary) !important",
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

  [theme.breakpoints.down(991)]: {
    minHeight: "376px",
  },

  [theme.breakpoints.down(767)]: {
    margin: "0px",
  },
  ".back-btns": {
    background: "transparent !important",
    border: "0 !important",
  },
  ".wallets-list": {
    height: "197px",
    display: "flex",
    flexDirection: "column",
    alignContent: "center",
    justifyContent: "center",
    gap: "12px",

    button: {
      width: "100%",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      backgroundColor: "var(--theme-bg-input)",
      border: "1px solid",
      borderColor: "var(--theme-border-input)",
      padding: "16px",
      borderRadius: "16px",
      transition: "all 0.2s",
      cursor: "pointer",
      textAlign: "left",
      "&:hover": {
        borderColor: "var(--brand-secondary)",
        ".wallet-name": {
          color: "var(--brand-secondary)",
        },
        ".chevron-icon": {
          color: "var(--brand-secondary)",
        },
      },

      ".wallet-info": {
        display: "flex",
        alignItems: "center",
        gap: "16px",
        ".wallet-icon": {
          width: "40px",
          height: "40px",
          backgroundColor: "var(--theme-bg-input)",
          borderRadius: "12px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          border: "1px solid",
          borderColor: "var(--theme-border-input)",
          transition: "all 0.2s",
          img: { width: "24px", height: "24px" },
          svg: { width: "24px", height: "24px" },
        },
        ".wallet-details": {
          ".wallet-name": {
            fontWeight: 600,
            color: "var(--theme-text-primary)",
            transition: "color 0.2s",
            fontSize: "16px",
            marginBottom: "2px",
          },
          ".wallet-network": {
            fontSize: "12px",
            color: "var(--theme-text-muted)",
          },
        },
      },
      ".chevron-icon": {
        color: "var(--theme-text-muted)",
        transition: "color 0.2s",
        width: "18px",
        height: "18px",
      },
    },
  },
}));

export const LeftSectionBox = styled(Box)(({ theme }) => ({
  ".left-column": {
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    maxWidth: "510px",
    width: "100%",

    [theme.breakpoints.down(1024)]: {
      maxWidth: "100%",
      alignItems: "center",
      textAlign: "center",
    },
  },

  ".title": {
    fontSize: "2rem",
    lineHeight: "2.25rem",
    fontWeight: "700",
    letterSpacing: "-0.025em",
    marginBottom: "1rem",
    marginTop: "0",
    color: "var(--text-primary)",
    [theme.breakpoints.up("md")]: {
      fontSize: "3rem",
      lineHeight: "1",
    },
    [theme.breakpoints.down(767)]: {
      fontSize: "1.75rem",
      lineHeight: "2rem",
    },
    br: {
      display: "none",
      [theme.breakpoints.up("md")]: {
        display: "block",
      },
    },
  },

  ".highlight": {
    color: "var(--brand-primary-text)",
  },

  ".description": {
    color: "var(--text-secondary)",
    fontSize: "1rem",
    lineHeight: "1.5",
    marginBottom: "2rem",
    marginTop: "0",
    [theme.breakpoints.up("md")]: {
      fontSize: "1.125rem",
      lineHeight: "1.625",
    },
  },

  ".features-list": {
    display: "flex",
    flexDirection: "column",
    gap: "1.5rem",

    [theme.breakpoints.down(1024)]: {
      alignItems: "center",
      textAlign: "left",
    },
  },

  ".feature-item": {
    display: "flex",
    gap: "1rem",
  },

  ".feature-icon-wrapper": {
    width: "2.5rem",
    height: "2.5rem",
    borderRadius: "0.5rem",
    backgroundColor: "var(--theme-bg-input)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    border: "1px solid var(--theme-border-input)",
  },

  ".feature-title": {
    fontWeight: "500",
    color: "var(--theme-text-primary)",
    marginBottom: "0.25rem",
    marginTop: "0",
    fontSize: "1rem",
    lineHeight: "1.5",
  },

  ".feature-desc": {
    fontSize: "0.875rem",
    color: "var(--text-secondary)",
    margin: "0",
    lineHeight: "1.5",
  },
}));

export const ValidatorJourneyBox = styled(Box)(({ theme }) => ({
  marginTop: "8rem",
  paddingTop: "6rem",
  paddingBottom: "3rem",
  [theme.breakpoints.down(767)]: {
    marginTop: "4rem",
    paddingTop: "4rem",
    paddingBottom: "2rem",
    borderRadius: "1rem",
  },
  position: "relative",
  overflow: "hidden",
  borderRadius: "1.5rem",
  border: "1px solid var(--border-subtle)",
  background: "var(--theme-bg-cardProcess)",

  ".bg-effect-1": {
    position: "absolute",
    top: 0,
    left: "50%",
    transform: "translateX(-50%)",
    width: "800px",
    height: "400px",
    backgroundColor: "var(--autheo-teal-a08)",
    filter: "blur(120px)",
    pointerEvents: "none",
    borderRadius: "9999px",
  },

  ".bg-effect-2": {
    position: "absolute",
    inset: 0,
    backgroundImage:
      "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3'/%3E%3C/filter%3E%3Crect width='120' height='120' filter='url(%23n)' opacity='0.5'/%3E%3C/svg%3E\")",
    opacity: 0.03,
    mixBlendMode: "overlay",
    pointerEvents: "none",
  },

  ".header-section": {
    textAlign: "center",
    marginBottom: "5rem",
    position: "relative",
    zIndex: 10,
    paddingLeft: "1.5rem",
    paddingRight: "1.5rem",
    [theme.breakpoints.down(767)]: {
      marginBottom: "3rem",
    },
  },

  ".process-badge": {
    display: "inline-flex",
    alignItems: "center",
    gap: "0.5rem",
    padding: "0.25rem 0.75rem",
    borderRadius: "9999px",
    backgroundColor: "var(--brand-primary-soft)",
    color: "var(--brand-primary-text)",
    fontSize: "0.75rem",
    fontWeight: 700,
    letterSpacing: "0.1em",
    textTransform: "uppercase",
    marginBottom: "1.5rem",
    border: "1px solid var(--brand-primary-border)",
  },

  ".main-title": {
    fontSize: "2rem",
    lineHeight: "2.25rem",
    fontWeight: 700,
    letterSpacing: "-0.025em",
    color: "var(--theme-text-primary)",
    marginBottom: "1.5rem",
    [theme.breakpoints.up("md")]: {
      fontSize: "3rem",
      lineHeight: 1,
    },
    [theme.breakpoints.down(767)]: {
      fontSize: "1.75rem",
      lineHeight: "2rem",
    },
  },

  ".description": {
    color: "var(--theme-text-secondary)",
    maxWidth: "42rem",
    margin: "0 auto",
    fontSize: "1rem",
    lineHeight: "1.5rem",
    [theme.breakpoints.up("md")]: {
      fontSize: "1.125rem",
      lineHeight: "1.75rem",
    },
  },

  ".grid-container": {
    maxWidth: "72rem",
    margin: "0 auto",
    paddingLeft: "1.5rem",
    paddingRight: "1.5rem",
    display: "grid",
    gridTemplateColumns: "repeat(1, minmax(0, 1fr))",
    gap: "2rem",
    position: "relative",
    zIndex: 10,
    [theme.breakpoints.up("md")]: {
      gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
    },
  },

  ".connecting-lines": {
    display: "none",
    position: "absolute",
    top: "60px",
    left: "16%",
    right: "16%",
    height: "2px",
    background:
      "linear-gradient(to right, var(--autheo-teal-a15), var(--autheo-teal-a25), var(--autheo-gold-a25))",
    transform: "translateY(-50%)",
    zIndex: 0,
    [theme.breakpoints.up("md")]: {
      display: "block",
    },
    ".shimmer": {
      position: "absolute",
      top: 0,
      left: 0,
      width: "100%",
      height: "100%",
      background:
        "linear-gradient(90deg, transparent 0%, var(--autheo-teal-a40) 50%, transparent 100%)",
      backgroundSize: "200% 100%",
      animation: "shimmer 2s infinite",
    },
  },

  "@keyframes shimmer": {
    "0%": {
      backgroundPosition: "200% 0",
    },
    "100%": {
      backgroundPosition: "-200% 0",
    },
  },

  /* One brand accent across all three steps - the step number carries the
     sequence, not a different hue per card. Only the final activation step
     (".step-3" below) is promoted to the Autheo gold "value" accent. */
  ".step-card": {
    position: "relative",
    zIndex: 10,
    backgroundColor: "var(--theme-bg-table)",
    backdropFilter: "blur(24px)",
    border: "1px solid var(--theme-border-cardProcess)",
    borderRadius: "1.5rem",
    padding: "2rem",
    transition: "all 0.5s cubic-bezier(0.4, 0, 0.2, 1)",
    boxShadow: "var(--theme-shadow-card)",
    overflow: "hidden",
    marginTop: "2rem",
    [theme.breakpoints.up("md")]: {
      marginTop: 0,
    },
    ".top-gradient": {
      background: "var(--brand-gradient-hairline)",
    },
    ".icon-container": {
      background: "var(--brand-gradient-subtle)",
      border: "1px solid var(--brand-primary-border)",
      boxShadow: "var(--brand-glow)",
    },
    ".step-badge": {
      color: "var(--brand-primary-text)",
    },
    "&:hover": {
      backgroundColor: "var(--theme-bg-table-row-hover)",
      borderColor: "var(--brand-primary-border)",
      ".top-gradient": {
        opacity: 1,
      },
      ".list-item": {
        color: "var(--theme-text-primary)",
      },
      ".icon-container": {
        transform: "scale(1.06)",
      },
      ".list-icon-bg": {
        borderColor: "var(--brand-primary-border)",
      },
    },
  },

  ".step-card.mt-0": {
    marginTop: 0,
  },

  ".top-gradient": {
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "0.25rem",
    opacity: 0,
    transition: "opacity 0.5s cubic-bezier(0.4, 0, 0.2, 1)",
  },

  ".icon-container": {
    width: "5rem",
    height: "5rem",
    borderRadius: "1rem",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    margin: "0 auto 2rem auto",
    transition: "all 0.5s cubic-bezier(0.4, 0, 0.2, 1)",
  },

  ".text-center-wrapper": {
    textAlign: "center",
    marginBottom: "2.5rem",
  },

  ".step-badge": {
    fontSize: "0.75rem",
    fontWeight: 700,
    letterSpacing: "0.1em",
    textTransform: "uppercase",
    marginBottom: "0.75rem",
    display: "block",
  },

  ".step-title": {
    fontWeight: 700,
    color: "var(--theme-text-primary)",
    fontSize: "1.5rem",
    lineHeight: 1.25,
  },

  ".list-container": {
    listStyle: "none",
    padding: 0,
    margin: 0,
    display: "flex",
    flexDirection: "column",
    gap: "1.5rem",
  },

  ".list-item": {
    display: "flex",
    alignItems: "center",
    gap: "1rem",
    fontSize: "0.875rem",
    color: "var(--theme-text-secondary)",
    transition: "color 150ms cubic-bezier(0.4, 0, 0.2, 1)",
  },

  ".list-icon-bg": {
    width: "2.5rem",
    height: "2.5rem",
    borderRadius: "9999px",
    backgroundColor: "var(--theme-bg-input)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    border: "1px solid var(--theme-border-input)",
    transition: "border-color 150ms cubic-bezier(0.4, 0, 0.2, 1)",
    svg: {
      width: "16px",
      height: "16px",
    },
  },

  ".list-text": {
    fontWeight: 500,
    fontSize: "1rem",
    lineHeight: "1.5rem",
  },

  ".step-3": {
    "&:hover": {
      borderColor: "var(--brand-secondary-border)",
      ".list-icon-bg": {
        borderColor: "var(--brand-secondary-border)",
      },
      ".list-icon-bg.go-live": {
        borderColor: "var(--brand-secondary)",
      },
    },
    ".top-gradient": {
      background:
        "linear-gradient(to right, transparent, var(--brand-secondary), transparent)",
    },
    ".icon-container": {
      background: "var(--brand-secondary-soft)",
      border: "1px solid var(--brand-secondary-border)",
      boxShadow: "none",
    },
    ".step-badge": {
      color: "var(--brand-secondary-text)",
    },
    ".list-icon-bg.go-live": {
      backgroundColor: "var(--surface-elevated)",
      borderColor: "var(--brand-secondary)",
    },
    ".list-text.go-live": {
      fontWeight: "var(--font-weight-bold)",
      color: "var(--brand-secondary-text)",
    },
  },
}));
