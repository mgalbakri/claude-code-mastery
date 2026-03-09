import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";

export const runtime = "edge";

const PHASE_COLORS: Record<string, { bg: string; accent: string }> = {
  "1": { bg: "#064e3b", accent: "#34d399" },
  "2": { bg: "#1e3a5f", accent: "#60a5fa" },
  "3": { bg: "#3b0764", accent: "#c084fc" },
};

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const title = searchParams.get("title") || "12-Week AI Coding Course";
  const week = searchParams.get("week");
  const phase = searchParams.get("phase") || "1";
  const type = searchParams.get("type") || "week"; // week | appendix | default

  const colors = PHASE_COLORS[phase] || PHASE_COLORS["1"];
  const label =
    type === "appendix"
      ? `Appendix ${week || ""}`
      : week
        ? `Week ${week} of 12`
        : "Free Course";

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "60px",
          background: `linear-gradient(135deg, #0a0a0a 0%, ${colors.bg} 100%)`,
          fontFamily: "sans-serif",
        }}
      >
        {/* Top: logo + label */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
          }}
        >
          <div
            style={{
              fontSize: 20,
              fontWeight: 700,
              letterSpacing: "0.05em",
              textTransform: "uppercase" as const,
              color: colors.accent,
            }}
          >
            Agent Code Academy
          </div>
          <div
            style={{
              fontSize: 16,
              color: "#94a3b8",
              background: "rgba(255,255,255,0.08)",
              padding: "6px 16px",
              borderRadius: 8,
            }}
          >
            {label}
          </div>
        </div>

        {/* Center: title */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 16,
          }}
        >
          <div
            style={{
              fontSize: week ? 52 : 48,
              fontWeight: 800,
              color: "#f8fafc",
              lineHeight: 1.15,
              maxWidth: "90%",
            }}
          >
            {title}
          </div>
          <div
            style={{
              fontSize: 20,
              color: "#94a3b8",
            }}
          >
            Learn to build real apps with Claude Code
          </div>
        </div>

        {/* Bottom: URL + decoration */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-end",
          }}
        >
          <div style={{ fontSize: 18, color: "#64748b" }}>
            agentcodeacademy.com
          </div>
          <div
            style={{
              display: "flex",
              gap: 6,
            }}
          >
            {Array.from({ length: 12 }).map((_, i) => (
              <div
                key={i}
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: 4,
                  background:
                    week && i < parseInt(week)
                      ? colors.accent
                      : "rgba(255,255,255,0.1)",
                }}
              />
            ))}
          </div>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  );
}
