import { Paper, styled, Pagination as MuiPagination } from "@mui/material";

import FlexBox from "../../Common/FlexBox";

export const TabsSection = styled(FlexBox)(({ theme }) => ({
  justifyContent: "space-between",
  margin: "20px 0 20px",
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
  border: `1px solid var(--border-subtle)`,

  [theme.breakpoints.down(1440)]: {
    maxWidth: "350px",
    padding: "10px 20px",
  },
  [theme.breakpoints.down(767)]: {
    maxWidth: "100%",
    padding: "10px 12px",
  },

  ".MuiInputBase-root": {
    marginLeft: 0,

    ".MuiInputBase-input": {
      // color: theme.palette.text.white,
      fontSize: "16px",
    },
    ".MuiInputBase-input::placeholder": {
      // color: "var(--text-primary)",
      opacity: 0.5,
    },
  },

  [theme.breakpoints.down(1324)]: {
    width: "100%",
    marginTop: 15,
  },
}));
export const InputSearch = styled(Paper)(({ theme }) => ({
  maxWidth: "540px",
  width: "100%",
  ".MuiInputBase-root": {
    backgroundColor: "var(--theme-bg-input)",
    borderRadius: "14px",
    height: "46px",
    color: "var(--theme-text-primary)",
    overflow: "hidden",
    transition: "background-color 0.3s ease, color 0.3s ease",
    "&:hover": {
      // border: "1px solid var(--brand-primary)",
      borderRadius: "14px",
    },
  },
  ".MuiButtonBase-root": {
    position: "absolute",
    right: "7px",
    height: "36px",
    top: "10px",
  },
  ".css-1owsj0s-MuiInputBase-root-MuiOutlinedInput-root:hover .MuiOutlinedInput-notchedOutline":
    {
      borderColor: "none !important",
      border: 0,
    },
}));
export const Pagination = styled(MuiPagination)(({ theme }) => ({
  ".MuiPaginationItem-previousNext": {
    backgroundColor: "transparent",
    color: "var(--theme-text-primary)",
    transition: "color 0.3s ease",
    "&:hover": {
      // opacity:"0.7",
      backgroundColor: "transparent",
    },
  },
  ".MuiPaginationItem-root": {
    color: "var(--theme-text-secondary)",
    transition: "color 0.3s ease",
  },
  ".MuiPaginationItem-root.Mui-selected": {
    border: `1px solid var(--brand-primary)`,
    color: "var(--theme-text-primary)",
    borderRadius: "8px",
  },
  ".MuiPaginationItem-root.Mui-disabled": {
    background: "trasparent",
    color: "var(--theme-text-secondary)",
    border: 0,
    opacity: "1",
  },
}));

export const NoData = styled(Paper)(({ theme }) => ({
  display: "flex",
  justifyContent: "center",
  width: "100%",
  alignItems: "center",
  flexDirection: "column",
  border: "1px solid var(--theme-border-primary)",
  padding: "20px",
  borderRadius: "20px",
}));
