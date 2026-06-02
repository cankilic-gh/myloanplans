import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "MyLoanPlans — Mortgage & Budget Planner",
    short_name: "MyLoanPlans",
    description:
      "Free, private mortgage calculator and budget planner. Data stays in your browser.",
    start_url: "/",
    display: "standalone",
    background_color: "#fbfcfe",
    theme_color: "#2f6bff",
    icons: [
      { src: "/icon.svg", sizes: "any", type: "image/svg+xml" },
      { src: "/apple-icon.png", sizes: "180x180", type: "image/png" },
    ],
  };
}
