import { Box, styled } from "@mui/material";

export const BondWrapper = styled(Box)(({ theme }) => ({
  ".bond-wrapper": {
    maxWidth: "500px",
    width: "100%",
    margin: "0 auto",
    // marginTop: "55px",
    backgroundColor: "var(--theme-bg-card)",
    padding: "30px",
    borderRadius: "14px",
    border: "1px solid var(--theme-border-primary)",
    transition: "background-color 0.3s ease, border-color 0.3s ease",
    position: "relative",
    [theme.breakpoints.down(1440)]: {
      padding: "20px",
    },
    ".fundAvail": {
      fontSize: "14px",
      fontWeight: 400,
      color: "var(--theme-text-primary)",
      transition: "color 0.3s ease",
      span: {
        color: "var(--theme-text-secondary)",
        transition: "color 0.3s ease",
      },
    },
    "&__amount": {
      position: "relative",

      ".maxBtn": {
        position: "absolute",
        top: "46px",
        right: "15px",

        "&.MuiButton-root": {
          padding: "5px 25px",
          fontSize: "13px",
          fontWeight: "500",
          borderRadius: "28px",
          // textTransform: "uppercase",
          background: "var(--surface-elevated)",
          color: "var(--text-primary)",
          border: 0,
          maxWidth: "100px",
          "&:hover": {
            background: "var(--brand-primary) !important",
            color: "var(--brand-on-primary) !important",
            fontWeight: "600",
          },
        },
      },
    },
    "&__title": {
      paddingBottom: "40px",
      borderBottom: "1px solid",
      textAlign: "center",
      border: 0,
      fontSize: "24px",
      fontWeight: "600",
      [theme.breakpoints.down(767)]: {
        fontSize: "18px",
        marginBottom: "10px",
        paddingBottom: "20px",
      },

      "&--flex": {
        paddingBottom: "20px",
        display: "flex",
        alignItems: "center",
        [theme.breakpoints.down(767)]: {
          flexDirection: "column",
          gap: "20px 0",
          alignItems: "start",
        },
        ".addres-input": {
          marginLeft: "50px",
          marginBottom: "0",
          [theme.breakpoints.down(767)]: {
            marginLeft: "0px",
            maxWidth: "100%",
          },
        },
      },
    },

    ".MuiFormHelperText-root": {
      marginBottom: "5px",
    },
    ".MuiButton-root": {
      fontSize: "18px",
      fontWeight: "500",
      // maxWidth: '425px',
      textTransform: "unset",
      padding: "8px 24px",
      borderRadius: "28px",
      [theme.breakpoints.down(767)]: {
        fontSize: "13px",
        maxWidth: "100%",
        padding: "12px",
      },
    },
    ".back-btns": {
      background: "transparent",
      border: 0,
      padding: 0,
      minWidth: "unset !important",
      position: "absolute",
      left: "33px",
      top: "40px",
      [theme.breakpoints.down(1440)]: {
        top: "30px",
      },

      svg: {
        marginRight: "10px",
      },
    },
    h6: {
      fontSize: "14px",
      marginBottom: "50px",
      color: "var(--theme-text-primary)",
      transition: "color 0.3s ease",
      span: {
        color: "var(--theme-text-secondary)",
        fontSize: "14px",
        transition: "color 0.3s ease",
      },
    },
  },
}));
