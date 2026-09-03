import { styled } from "@mui/system";
import { Box } from "@mui/material";


export const FooterItem = styled(Box)(({ theme }) => ({
  background: "var(--theme-bg-footer)",
  padding: "0 20px",
  marginTop: "30px",
  [theme.breakpoints.down(991)]: {
    padding: "0 10px",
    marginTop: "10px",
  },
}));
export const FooterItemInner = styled(Box)(({ theme }) => ({
  maxWidth: "1440px",
  margin: "0 auto",
  padding: "40px 20px 26px 20px",
  [theme.breakpoints.down("sm")]: {
    padding: "20px 10px 0px 0",
  },
}));
export const FooterSection = styled(Box)(({ theme }) => ({
  textAlign: "left",
  [theme.breakpoints.down("sm")]: {
    textAlign: "center",
  },
  "& h6": {
    fontSize: "18px",
    fontWeight: "600",
    color: "var(--theme-text-footer-primary)",
    marginBottom: "15px",
    whiteSpace: "noWrap",
  },
  "& a": {
    fontSize: "14px",
    fontWeight: "500",
    color: "var(--theme-text-footer-secondary)",
    display: "block",
    paddingBottom: "1px",
    textDecoration: "none",
    transition: "margin-left 0.3s ease-in-out",
    ":hover": {
      marginLeft: "10px",
      color: "var(--theme-text-link-hover)",
    },
  },
  "& p": {
    fontSize: "16px",
    fontWeight: "500",
    color: "var(--theme-text-footer-secondary)",
    maxWidth: "358px",
    [theme.breakpoints.down("sm")]: {
      maxWidth: "100%",
      textAlign: "center",
    },
  },
  "& img": {
    width: "180px",
  },
}));

export const SocialLinks = styled(Box)(({ theme }) => ({
  marginTop: "20px",
  "& h6": {
    textAlign: "center",
    fontWeight: "700",
    paddingTop: "50px",
    paddingBottom: "7px",
    color: "var(--theme-text-footer-primary)",
    [theme.breakpoints.down("md")]: {
      paddingTop: "10px",
    },
  },
}));

export const SocialLinksInner = styled(Box)(({ theme }) => ({
  display: "flex",
  justifyContent: "center",
  gap: "10px",
  paddingBottom: "42px",

  "& a": {
    color: "var(--theme-text-footer-primary)",
    fontSize: "24px",
    textDecoration: "none",
    cursor: "pointer",
    transition: "color 0.2s ease, transform 0.2s ease",
    "&:hover": {
      color: "var(--theme-text-link-hover)",
      transform: "scale(1.1)",
    },
  },
}));

export const Copyright = styled(Box)(({ theme }) => ({
  paddingTop: "18px",
  textAlign: "center",
  fontSize: "14px",
  borderTop: "1px solid var(--theme-border-footer)",
  color: "var(--theme-text-footer-secondary)",
  [theme.breakpoints.down("sm")]: {
    paddingBottom: "20px",
  },
}));
