import { ImageResponse } from "next/og";

export const alt =
  "The Sovereign Stack — community authority carried through the AI stack";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          position: "relative",
          overflow: "hidden",
          background: "#f7f1e7",
          color: "#203d34",
          fontFamily: "Georgia, serif",
        }}
      >
        <div
          style={{
            position: "absolute",
            width: 520,
            height: 520,
            right: -145,
            top: 56,
            border: "1px solid rgba(32, 61, 52, 0.16)",
            transform: "rotate(45deg)",
          }}
        />
        <div
          style={{
            width: 18,
            height: "100%",
            background: "#bd5233",
          }}
        />
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            padding: "62px 74px 58px 68px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
            <div
              style={{
                width: 46,
                height: 46,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                border: "4px solid #bd5233",
                transform: "rotate(45deg)",
              }}
            >
              <div style={{ width: 28, height: 28, background: "#bd5233" }} />
            </div>
            <div
              style={{
                display: "flex",
                fontFamily: "Arial, sans-serif",
                fontSize: 20,
                letterSpacing: "0.2em",
                textTransform: "uppercase",
                color: "#8a3f2a",
              }}
            >
              Governance &amp; learning layer
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
            <div style={{ display: "flex", fontSize: 82, lineHeight: 0.94 }}>
              The Sovereign Stack
            </div>
            <div
              style={{
                display: "flex",
                maxWidth: 810,
                fontFamily: "Arial, sans-serif",
                fontSize: 29,
                lineHeight: 1.35,
                color: "#4d625a",
              }}
            >
              Carry community authority through purpose, data, models, use,
              review—and refusal.
            </div>
          </div>

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              fontFamily: "Arial, sans-serif",
              fontSize: 18,
              color: "#6d7873",
            }}
          >
            <div style={{ display: "flex" }}>A working concept for Purple Maiʻa</div>
            <div style={{ display: "flex", color: "#8a3f2a" }}>
              Built by RN Collins
            </div>
          </div>
        </div>
      </div>
    ),
    size,
  );
}
