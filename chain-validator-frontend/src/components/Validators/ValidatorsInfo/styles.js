import { styled } from "@mui/material";

import FlexBox from "../../Common/FlexBox";

export const Container = styled("div")(({ isOpen, theme }) => ({
  display: "grid",
  gridTemplateColumns: "repeat(2, 1fr)",
  gap: "32px",
  alignItems: "center",
  justifyItems: "flex-start",
  [theme.breakpoints.down(1430)]: {
    gridTemplateColumns: "repeat(2, 1fr)",
  },
  [theme.breakpoints.down(1050)]: {
    gridTemplateColumns: !isOpen ? "repeat(2, 1fr)" : "1fr",
  },
  [theme.breakpoints.down(800)]: {
    gridTemplateColumns: "1fr",
  },
}));

export const OuterRing = styled(FlexBox)`
  margin-right: 15px;
  justify-content: center;
  width: 88px;
  height: 88px;
  border-radius: 50%;
  background: conic-gradient(from 90deg at 50% 50%, rgba(0, 254, 217, 0.0001) 0deg, var(--brand-primary) 359.96deg, rgba(0, 254, 217, 0.0001) 360deg);
  transform: rotate(-90deg);
`;

export const InnerRing = styled(FlexBox)`
  justify-content: center;
  width: 58px;
  height: 58px;
  border-radius: 50%;
  background: var(--surface-base);
  transform: rotate(90deg);
`;
