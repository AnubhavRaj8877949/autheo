import { Box, styled, Paper as MuiBasePaper } from "@mui/material";

export const ProfileDetailsHeader = styled(Box)(({ theme }) => ({
  padding: "60px 0px",
  borderBottom: "1px solid var(--border-default)",
  [theme.breakpoints.down(767)]: {
    padding: "30px 0px",
  },

  ".ProfileDetailsHeaderContent": {
    display: "flex",
    alignItems: "center",
    gap: "52px",

    [theme.breakpoints.down(767)]: {
      flexWrap: "wrap",
    },

    ".dark-btn": {
      marginLeft: "24px",
    },
  },

  ".ProfilePictureWrapper": {
    position: "relative",
    width: "100px",
    height: "100px",
    img: {
      maxWidth: "100%",
      maxHeight: "100%",
    },
    ".MuiSvgIcon-root": {
      fontSize: "24px",
      fill: "transparent",
      position: "absolute",
      bottom: "0",
      right: "0",
    },
  },
}));

export const Paper = styled(MuiBasePaper)(({ theme }) => ({
  background: "transparent !important",

  ".profile-wrap": {
    "&__item": {
      display: "flex",
      alignItems: "center",
      padding: "28px 0",
      minHeight: "92px",
      borderBottom: "1px solid var(--border-default)",
      marginBottom: "20px",

      ".MuiTypography-body1": {
        fontWeight: "600",
        textTransform: "capitalize",
        flex: "0 165px",

        "&.address-text": {
          flex: 1,
        },
      },

      "&--status": {
        justifyContent: "space-between",
        [theme.breakpoints.down(767)]: {
          alignItems: "start",
          flexDirection: "column",
          gap: "15px 0",
        },

        ".MuiButton-contained": {
          maxWidth: "280px",
          [theme.breakpoints.down(767)]: {
            maxWidth: "100%",
          },
        },
      },

      ".addres-input": {
        marginBottom: "0",
        maxWidth: "fit-content",
        [theme.breakpoints.down(767)]: {
          maxWidth: "200px",
        },
      },
      ".status-wrap": {
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        flex: "1",
      },
    },

    "&--detail": {
      marginTop: "-40px",
    },
  },
}));
export const WalletAddress = styled(Box)(({ theme }) => ({
  display: "flex",
  justifyContent: "space-between",
  width: "100%",
  alignItems: "flex-end",
  [theme.breakpoints.down(767)]: {
    flexDirection: "column",
    alignItems: "flex-start",
    gap: "15px",
  },
  ".walletInnerData": {
    display: "flex",
    flexDirection: "column",

    ".addres-input": {
      marginLeft: 0,
      marginTop: "8px",
      [theme.breakpoints.down(767)]: {
        maxWidth: "300px",
      },
    },
  },
  button: {
    color: "var(--text-primary)",
    maxWidth: "155px",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: "500",
    width: "100%",
    // border: "2px solid transparent",
    borderRadius: "25px",
    padding: "11px 22px",
    transition: "all 0.2s ease-out",
    "&:hover": {
      backgroundColor: "var(--brand-primary) !important",
      color: "var(--brand-on-primary) !important",
    },
  },
}));
export const HeadingItems = styled(Box)(({ theme }) => ({
  h3: {
    fontSize: "28px",
    fontWeight: "700",
  },
  ".manageHead": {
    display: "block",
    marginTop: "0",
    width: "100%",
    fontSize: "24px",
    textAlign: "center",
    paddingBotttom: "0",
    fontWeight: "600",
    marginBottom: "0",
  },
  ".profileBtn": {
    background: "var(--status-error) !important",
  },
}));
export const ProfileWrap = styled(Box)(({ theme }) => ({
  maxWidth: "500px",
  margin: "auto",
  border: "1px solid var(--theme-border-primary)",
  borderRadius: "25px",
  padding: "40px 30px",
  background: "var(--theme-bg-card)",
  transition:
    "background-color 0.3s ease, border-color 0.3s ease, color 0.3s ease",
  [theme.breakpoints.down(575)]: {
    padding: "30px 20px",
  },
  ".backProfilebtn": {
    display: "flex",
    alignItems: "center",
    marginBottom: "40px",
    h3: {
      display: "flex",
      justifyContent: "center",
      fontSize: "23px",
      fontWeight: "600",
      width: "100%",
      margin: "0",
    },
  },
  ".addres-input": {
    backgrond: "red !important",
  },

  h3: {
    display: "flex",
  },
}));
export const Profiledata = styled(Box)(({ theme }) => ({
  display: "flex",
  justifyContent: "space-between",
  marginTop: "10px",
  alignItems: "center",
  ".MuiButtonBase-root": {
    textTransform: "unset",
    fontSize: "16px",
  },
  p: {
    color: "var(--theme-text-secondary)",
    fontSize: "16px",
    transition: "color 0.3s ease",
  },
}));
