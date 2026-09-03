const styles = {
  primaryButton: {
    display: "block",
    margin: "auto",
    minWidth: "174px",
    "&:hover": {
      opacity: "0.8",
    },
    fontWeight: "bold",
    borderRadius: "8px",
  },
  secondaryButton: {
    backgroundColor: "var(--surface-overlay)",
    color: "var(--text-primary)",
    "&:hover": {
      backgroundColor: "var(--surface-elevated)",
    },
    fontWeight: "bold",
    borderRadius: "8px",
  },
};

export default styles;
