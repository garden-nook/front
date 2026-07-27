import type { CSSProperties } from "react";

export const loginStyles: { [key: string]: CSSProperties } = {
  container: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F8FAFC",
    padding: "20px",
  },
  card: {
    backgroundColor: "white",
    borderRadius: "12px",
    padding: "40px",
    width: "100%",
    maxWidth: "420px",
    boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
  },
  logoWrapper: {
    textAlign: "center",
    marginBottom: "32px",
  },
  logoRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "10px",
    marginBottom: "8px",
  },
  logoImage: {
    width: "24px",
    height: "24px",
    display: "block",
    flexShrink: 0,
  },
  title: {
    fontSize: "24px",
    fontWeight: "bold",
    color: "#1F2937",
    margin: 0,
    lineHeight: 1,
  },
  subtitle: {
    fontSize: "14px",
    color: "#6B7280",
    margin: 0,
  },
  errorBox: {
    backgroundColor: "#FEE2E2",
    color: "#DC2626",
    padding: "12px",
    borderRadius: "8px",
    fontSize: "13px",
    marginBottom: "16px",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "16px",
  },
  label: {
    display: "block",
    fontSize: "13px",
    color: "#6B7280",
    marginBottom: "6px",
  },
  switchMode: {
    textAlign: "center",
    fontSize: "13px",
    color: "#6B7280",
  },
};
