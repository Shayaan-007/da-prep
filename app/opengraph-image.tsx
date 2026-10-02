import { ImageResponse } from "next/og";

export const alt = "DA Prep: prepare for your degree apprenticeship";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: 80,
          background: "linear-gradient(135deg, #1d4ed8 0%, #0f766e 100%)",
          color: "white",
        }}
      >
        <div style={{ fontSize: 96, fontWeight: 700 }}>DA Prep</div>
        <div style={{ fontSize: 44, marginTop: 24, opacity: 0.95 }}>
          AI mock interviews, practice tests and an application tracker for UK degree apprenticeships
        </div>
      </div>
    ),
    size,
  );
}
