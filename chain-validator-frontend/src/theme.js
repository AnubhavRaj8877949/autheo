import { createTheme } from "@mui/material/styles";
import { AUTHEO } from "./styles/brand";

const theme = createTheme({
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        html: {
          "& ::-webkit-scrollbar": {
            width: "8px",
            height: "8px",
          },
          "& ::-webkit-scrollbar-track": {
            backgroundColor: "#fff !important",
            boxShadow: `inset 0 0 5px #fff !important`,
            borderRadius: "10px",
          },
          "& ::-webkit-scrollbar-thumb": {
            backgroundColor: "var(--brand-primary)",
            borderRadius: "10px",
          },
          "& ::-webkit-scrollbar-thumb:hover": {},
          ".MuiTooltip-arrow ": {
            fontSize: "20px !important",
          },
          ".custom-modal": {
            ".MuiDialog-paperWidthSm": {
              maxWidth: "552px",
              borderRadius: "10px",
              backgroundColor: "#1F1F1F",
            },
            ".common-wrapper": {
              padding: "0 !important",
              // padding:removeEventListener;

              "&__title": {
                borderBottom: "0",
                marginBottom: "0",
              },

              ".MuiButton-root": {
                backgroundColor: "#000",
                borderRadius: "15px",
                color: "#ffffff",
              },
            },

            "&__content": {
              padding: "38px",
            },
          },
          ".locked-tooltip": {
            textAlign: "center",
            padding: "10px",

            h4: {
              margin: "10px 0 0",
              lineHeight: "24px",
              fontSize: "16px",
            },
            p: {
              margin: "5px 0",
              fontSize: "13px",
              lineHeight: "24px",
            },
          },
          ".commn-icon": {
            svg: {
              width: "15px",
              height: "15px",

              path: {
                fill: "#fff",
              },
            },
          },

          /* Hide scrollbar for Chrome, Safari and Opera */
          "::-webkit-scrollbar": {
            display: "none",
          },
          "body::-webkit-scrollbar": {
            display: "none",
          },
        },
      },
    },
  },
  breakpoints: {
    values: {
      xs: 0,
      sm: 767,
      md: 999,
      lg: 1239,
      xl: 1440,
      xxl: 1680,
    },
  },
  typography: {
    fontSize: 11,
    fontFamily: '"Inter", sans-serif',
    fontWeightRegular: "normal",
    h1: {
      fontSize: "40px",
      fontWeight: 700,
    },
    h2: {
      fontSize: "36px",
      lineHeight: "24px",
      fontWeight: 500,
    },
    h3: {
      fontSize: 20,
      lineHeight: "24px",
      fontWeight: 600,
      letterSpacing: 0.5,
    },
    h4: {
      fontSize: 24,
      fontWeight: 700,
      lineHeight: "24px",
    },
    h5: {
      fontSize: 18,
      fontWeight: 500,
    },
    h6: {
      fontSize: 16,
      fontWeight: 300,
      lineHeight: "24px",
      letterSpacing: 0.5,
    },
    subtitle1: {
      fontSize: 14,
      fontWeight: 500,
    },
    subtitle2: {
      fontSize: 13,
      fontWeight: 400,
    },
    body1: {
      fontSize: 16,
      lineHeight: "24px",
      // letterSpacing: -0.25,
    },
    body2: {
      fontSize: 14,
      lineHeight: "24px",
    },
    body3: {
      fontSize: 12,
      lineHeight: "24px",
    },

    a: {
      fontWeight: 700,
      fontSize: "16px",
    },
    caption: {
      fontSize: 10,
    },
    button: {
      fontWeight: "700",
      fontSize: 14,
      lineHeight: "24px",
      letterSpacing: 1.5,
      textTransform: "uppercase",
    },
  },
  palette: {
    /* NOTE: MUI parses palette values at runtime with its own colour
       manipulator, so these must be literal colours - CSS custom properties
       are not valid here. They mirror src/styles/_autheo-tokens.scss and are
       the ONLY place Autheo brand hexes are repeated in JS. */
    primary: { main: AUTHEO.teal, dark: AUTHEO.tealDark, contrastText: AUTHEO.onTeal },
    secondary: { main: AUTHEO.gold, dark: AUTHEO.goldDeep, contrastText: AUTHEO.onGold },
    blue: {
      main: AUTHEO.teal,
      dark: AUTHEO.tealDeep,
      newBlue: AUTHEO.teal,
      lightBlue: "rgba(0, 254, 217, 0.15)",
    },
    gray: { light: AUTHEO.zinc400, main: AUTHEO.zinc200, dark: AUTHEO.zinc700 },
    green: { main: AUTHEO.success },
    orange: { main: AUTHEO.warning },
    error: { main: AUTHEO.error },
    warning: { main: AUTHEO.warning },
    success: { main: AUTHEO.success },
    info: { main: AUTHEO.info },
    /* Left unset on purpose: body/paper backgrounds are theme-aware and are
       driven by --surface-* tokens so the light/dark toggle keeps working. */
    text: { primary: AUTHEO.ink, secondary: AUTHEO.inkSecondary, disabled: AUTHEO.zinc500 },
    divider: "rgba(0, 254, 217, 0.15)",
  },
});

export default theme;
