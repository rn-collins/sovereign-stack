import { ImageResponse } from "next/og";

// The same mark as app/icon.tsx, at the size iOS asks for. It is written as a
// second route rather than a static PNG so the two cannot drift: if the rust
// diamond changes in one, the mismatch is visible in the diff.
//
// iOS applies its own rounded mask and composites anything transparent against
// whatever is behind it, so the cream ground is painted edge to edge.
export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#f7f1e7",
        }}
      >
        <div
          style={{
            width: 96,
            height: 96,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            border: "8px solid #bd5233",
            transform: "rotate(45deg)",
          }}
        >
          <div style={{ width: 59, height: 59, background: "#bd5233" }} />
        </div>
      </div>
    ),
    size,
  );
}
