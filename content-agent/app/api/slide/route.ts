import { ImageResponse } from "next/og";
import React from "react";

export const runtime = "edge";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const title = (searchParams.get("title") || "Teste IA").slice(0, 120);
  const body = (searchParams.get("body") || "").slice(0, 260);
  const index = (searchParams.get("index") || "1").slice(0, 2);

  const el = React.createElement(
    "div",
    {
      style: {
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: "86px",
        color: "#f7f7f5",
        background: "radial-gradient(circle at 88% 8%, rgba(154,111,255,.38), transparent 32%), linear-gradient(145deg,#09090b,#131116)",
        fontFamily: "Arial, sans-serif",
      },
    },
    React.createElement("div", { style: { display: "flex", justifyContent: "space-between", fontSize: 26, letterSpacing: 4, textTransform: "uppercase", color: "#c4b5fd" } },
      React.createElement("span", null, "testeiaqui.py"),
      React.createElement("span", null, index.padStart(2, "0"))
    ),
    React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: 38, maxWidth: 870 } },
      React.createElement("div", { style: { fontSize: title.length > 65 ? 66 : 82, lineHeight: 0.98, letterSpacing: -4, fontWeight: 800 } }, title),
      body ? React.createElement("div", { style: { fontSize: 34, lineHeight: 1.28, color: "#c9c7ce" } }, body) : null
    ),
    React.createElement("div", { style: { fontSize: 24, color: "#8f8d98", display: "flex", justifyContent: "space-between" } },
      React.createElement("span", null, "SEO · GEO · AEO · IA aplicada ao Marketing"),
      React.createElement("span", null, "→")
    )
  );

  return new ImageResponse(el, { width: 1080, height: 1350 });
}
