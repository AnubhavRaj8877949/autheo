import { Paper, styled, Pagination as MuiPagination } from "@mui/material";

import FlexBox from "../../Common/FlexBox";

export const TabsSection = styled(FlexBox)(({ theme }) => ({
  justifyContent: "space-between",
  margin: "20px 0 35px",
  gap: "20px",
  [theme.breakpoints.down(1324)]: {
    flexDirection: "column",
    alignItems: "end",
  },
}));

export const Search = styled(Paper)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  width: "100%",
  maxWidth: "550px",
  padding: "10px 30px",
  borderRadius: "16px !important",
  boxShadow: "none",
  background: "var(--surface-elevated) !important",
  border: "1px solid var(--border-subtle)",

  [theme.breakpoints.down(1440)]: {
    maxWidth: "350px",
  },
  [theme.breakpoints.down(767)]: {
    maxWidth: "100%",
  },

  ".MuiInputBase-root": {
    marginLeft: 0,

    ".MuiInputBase-input": {
      // color: theme.palette.text.white,
      fontSize: "16px",
    },
    ".MuiInputBase-input::placeholder": {
      opacity: "1",
      color: "red",
    },
  },

  [theme.breakpoints.down(1324)]: {
    width: "100%",
    marginTop: 15,
  },
}));

export const Pagination = styled(MuiPagination)(({ theme }) => ({
  ".MuiPaginationItem-root": {
    border: "1px solid transparent",
    color: "var(--theme-text-secondary)",
  },
  ".MuiPaginationItem-previousNext": {
    background: "var(--surface-elevated)",
    color: "var(--text-primary)",
    "&:hover": {
      // backgroundColor: "#121212",
    },
  },
  ".MuiPaginationItem-root.Mui-selected": {
    color: "var(--brand-on-primary)",
  },
  ".MuiPaginationItem-root.Mui-disabled": {
    background: "var(--surface-elevated)",
  },
}));
