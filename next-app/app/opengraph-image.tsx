import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "SNU TeamUp - 서울대 공모전 팀빌딩";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: "linear-gradient(135deg, #1e1e2e 0%, #2d2d44 100%)",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "sans-serif",
        }}
      >
        <div
          style={{
            fontSize: 72,
            fontWeight: 700,
            color: "#ffffff",
            marginBottom: 16,
          }}
        >
          SNU TeamUp
        </div>
        <div
          style={{
            fontSize: 32,
            color: "#a0a0b8",
          }}
        >
          서울대학교 공모전 팀빌딩 플랫폼
        </div>
      </div>
    ),
    { ...size },
  );
}
