import { styled, Box } from "@mui/material";

export const ValidatorDetailsHeader = styled(Box)({
  display: "flex",
  justifyContent: "space-between",
  padding: "26px 50px 28px 23px",
  gap: "20px",
  flexWrap: "wrap",
});
export const ValidatorsCard = styled(Box)({
  h3: {
    padding: "20px 2px 13px",
    marginBottom: 0,
  },
});

export const ValidatorDetailItem = styled(Box)(({ theme }) => ({
  display: "flex",
  // justifyContent: "space-between",
  padding: "20px 20px 10px",
  background: "var(--theme-bg-card)",
  overflow: "hidden",
  transition: "background-color 0.3s ease",
  "> :first-child": {
    fontWeight: 300,
    color: "var(--theme-text-secondary)",
    width: "400px",
    fontSize: "16px",
    transition: "color 0.3s ease",
    [theme.breakpoints.down(420)]: {
      width: "300px",
    },
  },
  [theme.breakpoints.down(410)]: {
    flexDirection: "column",
    gap: "20px",
  },
}));
export const WalletAdd = styled(Box)(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  p: {
    dislay: "flex",
    flexDirection: "column",
    maxWidth: "440px",
    width: "100%",
    gap: "4px",
    alignItems: "flex-start",
  },
}));
export const ProfileDetails = styled(Box)(({ theme }) => ({
  display: "flex",
  // justifyContent: 'space-between',
  padding: "10px 30px 10px 30px",
  // borderTop: `1px solid var(--border-subtle)`,
  "&:first-child": {
    borderTop: "0",
  },
  "p:first-child": {
    color: "var(--theme-text-primary)",
    fontSize: "16px",
    fontWeight: 400,
    transition: "color 0.3s ease",
  },
  "p:last-child": {
    fontSize: "16px",
    fontWeight: "300",
    color: "var(--theme-text-secondary)",
    transition: "color 0.3s ease",
  },

  "> :first-child": {
    fontWeight: 700,
    width: "408px",
  },
  [theme.breakpoints.down(410)]: {
    flexDirection: "column",
    gap: "20px",
    "> :first-child": {
      width: "100%", // Adjust the width for smaller screens
    },
  },
}));

export const Wrapper = styled("div")({
  background: "var(--surface-raised)",
  marginBottom: "20px",
  display: "flex",
  borderRadius: "8px",
  justifyContent: "space-between",
  padding: "12px 24px",
  alignItems: "center",
  // width: "100%",
  // maxWidth: '215px',

  ".address-text": {
    fontSize: "14px",
    fontWeight: "400",
    overflow: "hidden",
    textOverflow: "ellipsis",
    color: "var(--theme-text-primary)",
    wordBreak: "break-all",
    whiteSpace: "normal",
  },

  ".copy-btn": {
    background: "transparent",
    border: "0",
    padding: "0",
    cursor: "pointer",
    marginLeft: "10px",
  },
});
export const ProfileSec = styled(Box)(({ theme }) => ({
  h3: {
    fontSize: "28px",
    fontWeight: 700,
  },
}));
