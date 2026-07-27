import type { CSSProperties } from "react";

export const profileStyles: { [key: string]: CSSProperties } = {
  page: {
    minHeight: "100vh",
    backgroundColor: "#F8FAFC",
  },
  main: {
    maxWidth: "600px",
    margin: "0 auto",
    padding: "40px 20px",
  },
  container: {
    backgroundColor: "white",
    borderRadius: "16px",
    padding: "32px",
    boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
  },
  title: {
    fontSize: "24px",
    fontWeight: 700,
    color: "#1F2937",
    margin: "0 0 24px 0",
  },
  card: {
    display: "flex",
    flexDirection: "column",
    gap: "20px",
  },
  fieldGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "6px",
  },
  label: {
    fontSize: "14px",
    fontWeight: 500,
    color: "#374151",
  },
  actionsRow: {
    display: "flex",
    gap: "12px",
    marginTop: "8px",
    flexWrap: "wrap",
  },
};
