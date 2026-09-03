import { styled } from "@mui/material";

export const Container = styled("div")(({ theme }) => ({
  display: "grid",
  margin: "30px 0",
  gridTemplateColumns: "repeat(3, 1fr)",
  gap: theme.spacing(3),
  alignItems: "center",
  justifyItems: "flex-start",
  [theme.breakpoints.down(1453)]: {
    gridTemplateColumns: "repeat(2, 1fr)",
  },
  [theme.breakpoints.down(1070)]: {
    gridTemplateColumns: "1fr",
  },
  [theme.breakpoints.down("md")]: {
    gridTemplateColumns: "repeat(2, 1fr)",
  },
  [theme.breakpoints.down(820)]: {
    gridTemplateColumns: "1fr",
  },
}));
