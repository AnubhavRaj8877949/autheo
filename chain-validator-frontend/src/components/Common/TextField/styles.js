import { TextField, styled } from "@mui/material";

export const CustomizedTextField = styled(TextField)(({ theme }) => ({
  width: "100%",
  label: {
    width: "100%",
    position: "static",
    color: `var(--theme-text-primary) !important`,
    ...theme.typography.label,
    transform: "none !important",
    marginBottom: "12px",
  },
  ".MuiOutlinedInput-notchedOutline": {
    border: `0 !important`,

    top: "0px",
    padding: "0px",

    fieldset: {
      display: "none",
    },
    legend: {
      display: "none",
    },
  },
  ".MuiOutlinedInput-input": {
    borderRadius: "10px",
    padding: "15px 14px",
    height: "auto",
    color: "var(--theme-text-primary)",
    backgroundColor: "var(--theme-bg-input)",
    overflow: "hidden",
    border: "1px solid var(--theme-border-primary)",
    textOverflow: "ellipsis",

    "[type=number]": {
      "-moz-appearance": "textfield",
    },

    "&::-webkit-outer-spin-button": {
      "-webkit-appearance": "none",
      margin: "0",
    },
    "&::-webkit-inner-spin-button": {
      "-webkit-appearance": "none",
      margin: "0",
    },

    "&.Mui-disabled": {
      "-webkit-text-fill-color": "var(--text-primary) !important",
    },
  },
  ".MuiOutlinedInput-input::placeholder": {
    fontSize: "16px",
    color: "var(--theme-text-secondary)",
    opacity: 0.5,
    fontWeight: 400,
  },
  ".MuiFormHelperText-root": {
    marginTop: "10px",
    marginLeft: "0px",
    fontSize: "14px",
    fontWeight: "600",
    color: "var(--theme-text-primary)",
    opacity: 0.6,
    "&.Mui-error": {
      color: "var(--status-error) !important",
      opacity: 1,
    },
    [theme.breakpoints.down(767)]: {
      fontSize: "12px",
      lineHeight: "15px",
    },
  },
}));
