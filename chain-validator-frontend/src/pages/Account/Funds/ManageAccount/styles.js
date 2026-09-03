import { Box, styled } from "@mui/material";

export const ManageWrapper = styled(Box)(({ theme }) => ({
  ".account-card": {
    // background: theme.palette.primary.main,
    marginBottom: "20px",
    borderRadius: "22px",
    padding: "37px 0",
    [theme.breakpoints.down(767)]: {
      padding: "20px",
    },
    "&__title": {
      padding: "30px 30px",

      fontSize: "22px",
      fontWeight: "700",
      [theme.breakpoints.down(767)]: {
        padding: "0 20px 20px",
        fontSize: "18px",
      },
    },

    ".MuiTableCell-head": {
      padding: "20px 28px",
      ".MuiTypography-body1": {
        textTransform: "capitalize",
      },
      [theme.breakpoints.down(1440)]: {
        padding: "15px 20px",
      },
    },
    ".MuiTableCell-body": {
      padding: "15px 30px",
      [theme.breakpoints.down(1440)]: {
        padding: "10px 20px",
      },
    },
  },
}));
