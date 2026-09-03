import { Button, styled, Typography, TableCell, TableContainer } from "@mui/material";

import { MainCard } from "../../../components/Common/Card/styles";

export const Container = styled(MainCard)(({ theme }) => ({
  flexDirection: "column",
  alignItems: "flex-start",
  justifyContent: "flex-start",
  width: "100%",
  marginBottom: "24px",
  padding: "0 !important",

  ".validator-status": {
    width: "100%",
    border: "1px solid var(--theme-border-primary)",
    overflow: "hidden",
    borderRadius: "14px",
    ".MuiPaper-root": {
      border: "0 !important",
      borderRadius: "0 !important",
      overflow: "auto",
      ".MuiTableHead-root": {
        background: "var(--theme-bg-table)",
        color: "var(--theme-text-primary)",
        backdropFilter: " blur(64px)",
        transition: "background-color 0.3s ease, color 0.3s ease",
      },
    },
    "&__card": {
      padding: "10px 25px",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      // borderBottom: "1px solid var(--border-subtle)",

      [theme.breakpoints.down(767)]: {
        padding: "15px",
        flexWrap: "wrap",
      },
      [theme.breakpoints.down(467)]: {
        // flexDirection: "column",
        gap: "10px 0",
      },
      h4: {
        color: "var(--theme-text-primary)",
        // paddingLeft: "30px",
        fontSize: "18px !important",
        fontWeight: 600,
        transition: "color 0.3s ease",
      },
      ".MuiTypography-root": {
        fontSize: "22px",
        fontWeight: "700",
        [theme.breakpoints.down(767)]: {
          fontSize: "16px",
        },
      },
    },
  },

  ".recent-action": {
    ".title": {
      padding: "30px",
      fontSize: "20px",
      fontWeight: "700",
      [theme.breakpoints.down(767)]: {
        padding: "15px",
        fontSize: "16px",
      },
    },

    ".no-data": {
      width: "100%",
      margin: "0",
      textAlign: "center",
    },
  },
}));

export const ValidatorButton = styled(Button)(() => ({
  backgroundColor: "var(--brand-primary) !important",
  color: "var(--brand-on-primary) !important",
  border: "1px solid transparent !important",
  textTransform: "capitalize",
  fontWeight: "var(--font-weight-semibold)",
  whiteSpace: "nowrap",

  "&:hover": {
    backgroundColor: "var(--brand-primary-strong) !important",
    color: "var(--brand-on-primary) !important",
    boxShadow: "var(--brand-glow)",
    opacity: 1,
  },
}));

// export const StyledDivider = styled(Divider)(({ theme }) => ({
//   background: theme.divider,
//   height: '1px',
// }));

/* Colour is applied through the shared `.status-*` classes (see
   styles/_autheo-components.scss); this only carries the type treatment. */
export const ActionStatus = styled(Typography)(() => ({
  fontWeight: "var(--font-weight-medium)",
  whiteSpace: "nowrap",
}));

export const StyledTableCell = styled(TableCell)(() => ({
  paddingTop: "20px !important",
  paddingBottom: "26px !important",
}));

export const StyledTableContainer = styled(TableContainer)(() => ({
  border: "1px solid var(--theme-border-primary)",
  borderRadius: "14px",
}));
