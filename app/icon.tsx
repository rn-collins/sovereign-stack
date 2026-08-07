import { ImageResponse } from "next/og";

export const size = { width: 64, height: 64 };
export const contentType = "image/png";

export default function Icon() {
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
            width: 34,
            height: 34,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            border: "3px solid #bd5233",
            transform: "rotate(45deg)",
          }}
        >
          <div style={{ width: 21, height: 21, background: "#bd5233" }} />
        </div>
      </div>
    ),
    size,
  );
}
