import { ImageResponse } from "next/og";

export const alt = "MyLoanPlans — Free Mortgage Calculator & Budget Planner";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OG() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 72,
          backgroundColor: "#fbfcfe",
          backgroundImage:
            "radial-gradient(1000px 500px at 10% -10%, #e7efff 0%, transparent 60%), radial-gradient(900px 500px at 110% 20%, #eee9ff 0%, transparent 55%)",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
          <div
            style={{
              width: 64,
              height: 64,
              borderRadius: 16,
              backgroundImage: "linear-gradient(135deg,#3b76ff,#8b7bff 55%,#2bd4a4)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#fff",
              fontSize: 34,
              fontWeight: 800,
            }}
          >
            M
          </div>
          <div style={{ fontSize: 30, fontWeight: 700, color: "#0b1220" }}>MyLoanPlans</div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              fontSize: 70,
              fontWeight: 800,
              color: "#0b1220",
              lineHeight: 1.05,
            }}
          >
            <div style={{ display: "flex" }}>Mortgage & Budget,</div>
            <div style={{ display: "flex", color: "#2f6bff" }}>beautifully planned.</div>
          </div>
          <div style={{ fontSize: 30, color: "#5b6b85", maxWidth: 900 }}>
            Free amortization, payoff & savings projections. No signup — your data stays in your browser.
          </div>
        </div>

        <div style={{ display: "flex", gap: 14 }}>
          {["Amortization", "Extra-payment payoff", "Budget & savings", "Excel / CSV export"].map(
            (t) => (
              <div
                key={t}
                style={{
                  fontSize: 24,
                  color: "#1f57e6",
                  backgroundColor: "#eaf1ff",
                  borderRadius: 999,
                  padding: "10px 22px",
                }}
              >
                {t}
              </div>
            )
          )}
        </div>
      </div>
    ),
    size
  );
}
