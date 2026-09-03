import { styled } from "@mui/material";
import FlexBox from "../FlexBox";

export const MainCard = styled(FlexBox)(({ theme }) => ({
  alignItems: "flex-start !important",
  justifyContent: "space-between",
  minWidth: "100%",
  width: "100%",
  padding: "20px 24px",
  backgroundColor: "var(--surface-raised)",
  border: "1px solid var(--border-default)",
  borderRadius: "10px",
  [theme.breakpoints.down(1680)]: {
    // padding: '20px',

    ".MuiTypography-h5": {
      fontSize: "16px",
    },
  },
  [theme.breakpoints.down(800)]: {
    width: "100%",
  },
}));

export const SecondaryCard = styled(FlexBox)(({ theme }) => ({
  width: "100%",
  maxWidth: 155,
  justifyContent: "start",
  fontSize: "14px",
  borderRadius: "10px",
}));
