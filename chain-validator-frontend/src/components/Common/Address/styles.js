import { styled } from "@mui/material";

export const Wrapper = styled("div")({
  background: "var(--surface-sunken)",
  marginBottom: "20px",
  display: "flex",
  borderRadius: "8px",
  justifyContent: "space-between",
  padding: "16px",
  alignItems: "center",
  width: "100%",
  // maxWidth: '215px',

  ".address-text": {
    fontSize: "14px",
    fontWeight: "400",
    overflow: "hidden",
    textOverflow: "ellipsis",
    color: "var(--text-primary)",
    wordBreak: "break-all",
    whiteSpace: "normal",
  },

  ".copy-btn": {
    background: "transparent",
    border: "0",
    padding: "0",
    cursor: "pointer",
    marginLeft: "10px",
  },
});
