export const dynamic = "force-dynamic";

export async function GET() {
  return Response.json({
    ok: true,
    integrations: {
      ai: Boolean(process.env.AI_GATEWAY_API_KEY || process.env.VERCEL_OIDC_TOKEN),
      github: Boolean(process.env.GITHUB_TOKEN),
      metricool: Boolean(process.env.METRICOOL_TOKEN && process.env.METRICOOL_USER_ID && process.env.METRICOOL_BLOG_ID),
    },
  });
}
