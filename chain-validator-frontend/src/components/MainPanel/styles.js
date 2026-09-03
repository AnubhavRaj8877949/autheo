import { Box, Container as BaseContainer, styled } from "@mui/material";
export const Wrapper = styled(Box)(({ theme }) => ({
  minHeight: "100vh",
  background: "var(--theme-bg-primary)",
  // backgroundImage: `url(${bgMain})`,
  position: "relative",
  backgroundSize: "100% 100%",
  backgroundRepeat: "no-repeat",
  display: "flex",
  flexDirection: "column",
  color: "var(--theme-text-primary)",
  fontWeight: "500",
  transition: "background-color 0.3s ease, color 0.3s ease",
  justifyContent: "space-between",
  ".MuiTableCell-root": {
    borderBottom: "transparent",
    backgroundSize: "cover",
    backgroundPosition: "center",
    backgroundRepeat: "no-repeat",
    whiteSpace: "nowrap",
    padding: "16px 28px",
    borderBottom: "1px solid var(--border-default)",
    fontSize: "16px",
    fontWeight: "300 !important",
    color: "var(--theme-text-secondary)",
    // borderRadius: "22px",
    ".notDiabled": {
      a: {
        marginRight: "0",
        fontWeight: "600",
        fontSize: "14px",
        border: "2px solid transparent",
        borderRadius: "999px",
        transition:
          "background 0.18s ease-out, color 0.18s ease-out, transform 0.12s ease-out, filter 0.18s ease-out",
        "--bg": "var(--surface-elevated)",
        "--hover-bg": "var(--theme-gradients-main)",
        "--text": "var(--text-primary)",
        "--hover-text": "var(--brand-on-primary)",
        WebkitTapHighlightColor: "transparent",
        "&:hover": {
          filter: "brightness(1.05)",
          // background: "var(--hover-bg)",
          color: "var(--text) !important",
          span: {
            color: "var(--text) !important",
          },
        },
        "&:active": {
          transform: "translateY(1px)",
        },
        "&:focus-visible": {
          outline: "3px solid rgba(22, 119, 255, 0.35)",
          outlineOffset: "2px",
        },
        span: {
          fontSize: "14px",
        },
      },
    },

    [theme.breakpoints.down(767)]: {
      padding: "10px 20px",
    },
    span: {},
    p: {
      color: "var(--theme-text-secondary)",
      fontSize: "16px",
      textTransform: "capitalize",
      fontWeight: "300",
    },
  },
  ".MuiTableHead-root": {
    backgroundColor: "var(--theme-bg-table)",
    color: "var(--theme-text-primary)",
    transition: "background-color 0.3s ease, color 0.3s ease",
    p: {
      color: "var(--theme-text-primary)",
      fontWeight: "600",
      fontSize: "16px",
      transition: "color 0.3s ease",
    },
    ".MuiTableCell-root": {
      padding: "22px 28px",
      // color: theme.palette.text.secondary,
      color: "var(--theme-text-primary)",
      fontWeight: "600",
      transition: "color 0.3s ease",
      background: "var(--theme-bg-table-row-hover)",
      span: {
        fontWeight: "500",
        color: "var(--theme-text-primary)",
        transition: "color 0.3s ease",
      },

      [theme.breakpoints.down(767)]: {
        padding: "10px 20px",
        fontSize: "13px",
        span: {},
        ".MuiTypography-label": {
          fontSize: "13px",
        },
        ".MuiTypography-body1": {
          fontSize: "13px",
        },
      },
      p: {
        display: "flex",
        gap: "6px",
        ".MuiButtonBase-root ": {
          padding: "0 !important",
        },
      },
    },
  },
  ".MuiTableBody-root": {
    backgroundColor: "var(--theme-bg-table)",
    transition: "background-color 0.3s ease",
    [theme.breakpoints.down(767)]: {
      ".MuiTypography-body2": {
        fontSize: "13px",
      },
    },
  },

  ".MuiContainer-root": {
    width: "1440px !important",

    ".bg-glow": {
      position: "absolute",
      top: "160px",
      left: "50%",
      transform: "translateX(-50%)",
      width: "800px",
      height: "800px",
      backgroundColor: "var(--autheo-teal-a08)", // subtle yellow glow
      borderRadius: "50%",
      filter: "blur(120px)",
      pointerEvents: "none",
      [theme.breakpoints.down(767)]: {
        width: "500px",
        height: "500px",
        top: "100px",
        filter: "blur(60px)",
      },
      [theme.breakpoints.down(500)]: {
        width: "300px",
        height: "300px",
        top: "100px",
        filter: "blur(60px)",
      },
    },

    ".manageAccountDetails": {
      padding: "18px 0",
    },
    [theme.breakpoints.down(1440)]: {
      // width: "75% !important",
    },

    [theme.breakpoints.down(999)]: {
      width: "100% !important",
    },
  },
  ".MuiPaper-root": {
    backgroundColor: "transparent",
    boxShadow: "none",
    border: "1px solid var(--theme-border-primary)",
    borderRadius: "14px !important",
    background: "var(--theme-bg-card)",
    overflow: "auto",
    color: "var(--theme-text-primary)",
    transition:
      "background-color 0.3s ease, color 0.3s ease, border-color 0.3s ease",
    "&:hover": {
      border: "1px solid var(--border-default)",
      borderRadius: 0,
    },
    ".disablebutton": {
      background: "var(--surface-elevated)",
      color: "var(--text-primary)",
      border: "0",
      padding: "10px 30px",
      borderRadius: "10px",
      opacity: "0.6",
      [theme.breakpoints.down(1499)]: {
        padding: "10px 17px",
      },
      [theme.breakpoints.down(767)]: {
        padding: "10px 14px",
      },
    },
  },
  ".MuiButton-root": {
    padding: "12px 16px",
    marginBottom: "10px",
    textTransform: "capitalize",
    borderRadius: "25px",
    transition: "color 0.2s ease-out, filter 0.2s ease-out",
    background: "var(--surface-elevated)",
    color: "var(--text-primary)",
    border: "1px solid transparent",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    "&:hover": {
      ".btn-icon": {
        path: {
          fill: "var(--brand-on-primary) !important",
        },
      },
    },
    [theme.breakpoints.down(1499)]: {
      padding: "10px 17px",
    },

    [theme.breakpoints.down(767)]: {
      fontSize: "12px",
      borderRadius: "30px",
      whiteSpace: "nowrap",
      padding: "10px 15px",
    },
    "&:hover": {
      opacity: "0.7",
      background: "var(--brand-primary)",
      color: "var(--brand-on-primary)",
      ".btn-icon": {
        path: {
          fill: "var(--brand-on-primary) !important",
        },
      },
    },
  },
  ".disable": {
    // background:"red",
    opacity: "0.7",
  },
  ".MuiButton-outlined": {
    borderColor: theme.palette.blue.main,
    color: theme.palette.blue.main,

    "&:hover": {
      borderColor: theme.palette.blue.main,
    },
  },
  ".MuiButton-contained": {
    width: "100%",
    "&.primary-btn": {
      background: " linear-gradient(to right, var(--brand-primary) 50%, var(--brand-primary-strong) 100% )",

      "&:hover": {
        background: "transparent ",
        color: "var(--brand-primary)",
        borderColor: "var(--brand-primary)",
      },
    },
    "&.dark-btn": {
      // background: theme.palette.secondary.dark,
      background: "var(--surface-elevated)",
      color: "var(--text-primary)",
    },

    "&.Mui-disabled": {
      opacity: "0.7",
      background: "var(--surface-elevated)",
      color: "var(--text-primary)",
      pointerEvents: "visible",
      cursor: "not-allowed !important",
      width: "100%",

      "&:hover": {
        opacity: "0.7",
      },
    },
  },
}));

export const Container = styled(BaseContainer)(({ theme }) => ({
  maxWidth: "100% !important",
  // width: ismobile === 'true' ? 'calc(100% - 60px)' : 'calc(100% - 400px)',
  // margin: ismobile === 'true' ? '30px' : '65px 60px 65px 30px',
  // marginLeft: '335px',
  padding: "40px 30px",

  // [theme.breakpoints.down(1680)]: {
  //   width: ismobile === 'true' ? 'calc(100% - 60px)' : 'calc(100% - 385px)',
  // },
  [theme.breakpoints.down(1440)]: {
    // margin: ismobile === 'true' ? '60px 30px 30px' : '45px',
    // marginLeft: '300px',
  },
  [theme.breakpoints.down(575)]: {
    padding: "30px 20px",
  },

  ".open-icon": {
    position: "absolute",
    top: "20px",
  },

  // '.MuiTableCell-body': {
  //   padding: '16px 30px',

  //   '.MuiTypography-body1': {
  //     padding: '10px 20px',
  //   },
  // },

  ".block-table": {
    ".MuiTableCell-head": {
      // '&:first-of-type': {
      //   paddingLeft: '98px',
      //   [theme.breakpoints.down(767)]: {
      //     paddingLeft: '85px',
      //   },
      // },
    },

    ".MuiTableCell-body": {
      padding: "16px 28px",
      [theme.breakpoints.down(767)]: {
        padding: "10px 20px",
      },
    },
  },

  ".validator-table": {
    backgroundColor: "var(--theme-bg-table)",
    transition: "background-color 0.3s ease",
    // '.MuiTableCell-head': {
    //   paddingLeft: '16px',
    //   paddingRight: '16px',
    // },
  },

  ".custom-divider": {
    margin: "20px 0 15px",
    borderColor: "var(--border-default)",
  },

  ".primary-btn": {
    borderRadius: "15px",
    fontWeight: "500",
    fontSize: "20px",
    lineHeight: "24px",
    padding: "20px",
    display: "inline-flex",
    justifyContent: "center",
    alignItems: "center",
    cursor: "pointer",
    transition: "all 0.25s linear",
    border: "1px solid",
    borderColor: "var(--brand-primary)",
    color: "white",
    svg: {
      path: {
        fill: "var(--theme-text-primary)",
        stroke: "var(--theme-text-primary)",
        transition: "all 0.25s linear",
      },
    },
    "&:hover": {
      svg: {
        path: {
          transition: "all 0.25s linear",
          fill: "var(--theme-text-primary)",
        },
      },
    },

    [theme.breakpoints.down(767)]: {
      fontSize: "16px",
      padding: "12px",
    },
  },
  ".outline-btn": {
    borderRadius: "15px",
    fontWeight: "500",
    fontSize: "20px",
    lineHeight: "24px",
    padding: "20px",
    display: "inline-flex",
    justifyContent: "center",
    alignItems: "center",
    cursor: "pointer",
    transition: "all 0.25s linear",
    background: "var(--brand-primary-soft-strong)",
    border: "1px solid",
    color: theme.palette.blue.main,
    borderColor: theme.palette.blue.main,

    svg: {
      path: {
        transition: "all 0.25s linear",
      },
    },
    "&:hover": {
      backgroundColor: "transparent",
      borderColor: theme.palette.text.primary,
      color: theme.palette.text.primary,

      svg: {
        path: {
          transition: "all 0.25s linear",
          fill: theme.palette.text.primary,
        },
      },
    },
    [theme.breakpoints.down(767)]: {
      fontSize: "16px",
      padding: "12px",
    },
  },

  ".common-table": {
    "&.Bondtable": {
      ".title": {
        fontSize: "18px",
        fontWeight: 600,
        paddingBottom: "20px",
      },
      ".MuiTableContainer-root": {
        border: "1px solid var(--theme-border-primary)",
        borderRadius: "14px",
      },
    },
    // background:
    // " linear-gradient(88deg,hsla(0,0%,100%,0) 1.62%,hsla(0,0%,100%,.1) 48.43%,hsla(0,0%,100%,0) 98.38%)",
    borderRadius: "22px",
    // paddingBottom: "35px",
    paddingTop: "10px",
    ".MuiTableContainer-root": {
      border: "1px solid var(--theme-border-primary)",
      borderRadius: "14px",
    },
    ".MuiPaginationItem-root.Mui-selected": {
      border: "1px solid var(--theme-border-primary)",
      background: "var(--surface-raised)",
    },
    ".Nodata": {
      display: "flex",
      justifyContent: "center",
      width: "100%",
      alignItems: "center",
      flexDirection: "column",
      // border: "1px solid var(--theme-border-primary)",
      padding: "20px",
      borderRadius: "20px",
      color: "var(--theme-text-primary)",
      transition: "color 0.3s ease",
    },

    h3: {
      fontSize: "22px",
      padding: "10px 2px 13px",
      // paddingTop: "37px",
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      [theme.breakpoints.down(767)]: {
        fontSize: "16px",
        padding: "20px",
      },
    },
    ".view-all": {
      fontSize: "14px",
      color: "var(--text-primary)",
      textDecoration: "none",
      transition: "all 0.2s linear",
      backgroundColor: "var(--surface-elevated)",
      border: "1px solid var(--border-default)",
      borderRadius: "30px",
      maxWidth: "123px",
      width: "100%",
      display: "flex",
      justifyContent: "center",
      "&:hover": {
        color: "var(--text-primary)",
        opacity: "0.8",
      },
    },
  },

  ".auth-wrapper": {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "20px",
    padding: "0 20px",
    marginTop: "30px",

    [theme.breakpoints.up(1440)]: {
      padding: "0",
    },

    [theme.breakpoints.down(1024)]: {
      flexDirection: "column",
      gap: "40px",
      paddingTop: "30px",
    },
    [theme.breakpoints.down(767)]: {
      padding: "0 15px",
      gap: "25px",
      marginTop: "20px",
    },

    ".addres-input": {
      marginBottom: "0",
      maxWidth: "fit-content",
    },
    "&__inner": {
      paddingTop: "115px",
      maxWidth: "885px",
      margin: "0 auto",

      [theme.breakpoints.down(1440)]: {
        paddingTop: "50px",
      },

      h3: {
        marginBottom: "5px",
      },

      ".address-field": {
        marginBottom: "20px",
      },
    },

    "&__backbtn": {
      textAlign: "right",
    },
    "&__btns": {
      display: "flex",
      gap: "0 30px",
      paddingTop: "50px",
      [theme.breakpoints.down(767)]: {
        flexDirection: "column",
        gap: "15px 0",
      },
      ".MuiButtonBase-root": {
        minWidth: "174px",
        margin: "auto",
      },

      ".primary-btn": {
        flex: "1",
        height: "68px",
      },

      ".outline-btn": {
        flex: "1",
      },
    },
  },

  ".btn-icon": {
    display: "inline-block",
    marginRight: "15px",
    lineHeight: "0",
  },

  ".id-wrap": {
    display: "flex",
    alignItems: "center",

    "&__icon": {
      "&--mr-0": {
        marginRight: 0,
      },
    },
  },
  ".vaildator-card": {
    background: "var(--theme-bg-card)",
    border: "1px solid var(--theme-border-primary)",
    height: "100%",
    position: "relative",
    display: "flex",
    justifyContent: "flex-start !important",
    transition: "background-color 0.3s ease, border-color 0.3s ease",
    "&__main": {
      display: "flex",
      flexDirection: "column",
      width: "100%",
      h5: {
        color: "var(--theme-text-secondary)",
        // opacity: "0.6",
        fontSize: "16px",
        fontWeight: 400,
        transition: "color 0.3s ease",
      },
      h4: {
        fontSize: "20px",
        fontWeight: "400",
        paddingTop: "8px",
        color: "var(--theme-text-primary)",
        transition: "color 0.3s ease",
      },
    },

    "&__icon": {
      marginRight: "16px",
    },
    "&__tooltip": {
      position: "absolute",
      top: "5px",
      right: "5px",

      ".MuiSvgIcon-fontSizeMedium": {
        fontSize: "18px",
      },
    },
  },

  ".not-found": {
    textAlign: "center",
    padding: "30px",

    img: {
      width: "250px",
      height: "250px",
      marginBottom: "20px",
      [theme.breakpoints.down(767)]: {
        width: "150px",
        height: "150px",
      },
    },

    " &__text": {
      fontSize: "18px",
    },
  },

  [theme.breakpoints.down(767)]: {
    ".MuiTypography-h3": {
      fontSize: "18px",
      marginBottom: "10px",
    },
    ".MuiTypography-body1": {
      fontSize: "15px",
    },
  },

  ".back-btn": {
    all: "unset",
    cursor: "pointer",
    opacity: "1",
    transition: "all linear 0.25s",

    "&:hover": {
      opacity: "0.7",
    },
  },

  ".circular-progress": {
    width: "15px !important",
    height: "15px !important",
    color: "var(--text-primary)",
  },
  ".table-wrap": {
    position: "relative",
    overflow: "hidden",
    background: "var(--theme-bg-table)",
    border: "1px solid var(--theme-border-primary)",
    borderRadius: "20px",
    transition: "background-color 0.3s ease, border-color 0.3s ease",
    ".nominate-btns": {
      position: "absolute",
      top: "-65px",
      right: "0",
    },

    ".MuiTableBody-root": {
      ".MuiTableRow-root": {
        cursor: "pointer",
        "&:hover": {
          background: "var(--brand-primary-soft)",
        },
      },
    },
  },

  ".bonds-btns, .MuiTableCell-root .notDiabled a.bonds-btns": {
    padding: "7px 20px",
    borderRadius: "999px",
    // margin: "0 5px",
    textDecoration: "none",
    fontSize: "13px",
    display: "inline-block",
    transition: "all linear 0.25s",
    background: "var(--bg, var(--surface-elevated))",
    color: "var(--text, var(--text-primary)) !important",
    border: "1px solid transparent",
    fontWeight: "700 !important",
    lineHeight: 1.1,
    whiteSpace: "nowrap",
    userSelect: "none",
    "& span, & p, & .MuiTypography-root": {
      color: "inherit !important",
    },
    "&:hover": {
      background: "var(--brand-primary) !important",
      color: "var(--brand-on-primary) !important",
      "& span, & p, & .MuiTypography-root": {
        color: "var(--brand-on-primary) !important",
      },
    },
  },
  ".status-active": {
    color: "var(--status-success) !important",
  },
  ".status-inactive": {
    color: "var(--status-error) !important",
  },
  ".status-waiting": {
    color: "var(--status-warning) !important",
  },

  ".tooltip-common": {
    ".MuiSvgIcon-fontSizeMedium": {
      fontSize: "12px",
    },
  },
  ".mt-5": {
    marginTop: "40px !important",
  },

  ".validator-address": {
    whiteSpace: "nowrap",
    display: "flex",
    alignItems: "start",
    // maxWidth: "550px",
    marginBottom: "30px",
    flexDirection: "column",
    gap: "8px",

    ".addres-input": {
      // marginLeft: "30px",
      marginBottom: "0",
      background: "var(--theme-bg-card) !important",
    },
  },
  ".content-wrap": {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "0 30px 30px",

    [theme.breakpoints.down(1440)]: {
      padding: "0 20px 20px",
    },
    [theme.breakpoints.down(574)]: {
      padding: "0 15px 15px",
    },
  },

  ".p-0": {
    padding: "0 !important",
  },
  ".text-hover": {
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "flex-start",
    gap: "4px",
    transition: "all 0.15s linear",
    "&:hover": {
      color: "var(--theme-text-primary)",
    },
    ".recentHash": {
      fontSize: "16px",
      minWidth: "635px",
    },
  },
  ".text-hover1": {
    // cursor: "pointer",
    display: "flex",
    alignItems: "center",
    gap: "4px",
    transition: "all 0.15s linear",

    ".recentHash": {
      fontSize: "16px",
      minWidth: "635px",
    },
  },
}));
export const Searchbar = styled(Box)(({ theme }) => ({
  maxWidth: "685px",
  width: "100%",
  ".MuiFormControl-root": {
    background: "var(--surface-raised)",
    color: "var(--theme-text-secondary)",
    border: "1px solid var(--theme-border-primary)",
    borderRadius: "14px",
    marginBottom: "40px",
  },
  ".css-1owsj0s-MuiInputBase-root-MuiOutlinedInput-root": {
    borderRadius: "14px",
    "&:hover": {
      border: 0,
      outline: "unset",
    },
  },
}));
