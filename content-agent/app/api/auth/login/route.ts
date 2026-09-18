import { NextRequest, NextResponse } from "next/server";
import { createSessionToken, SESSION_COOKIE } from "@/lib/auth";

function sameValue(a: string, b: string) {
  if (a.length !== b.length) return false;
  let result = 0;
  for (let i = 0; i < a.length; i += 1) result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return result === 0;
}

export async function POST(request: NextRequest) {
  const form = await request.formData();
  const username = String(form.get("username") || "");
  const passcode = String(form.get("passcode") || "");
  const next = String(form.get("next") || "/");
  const allowedUser = process.env.CONTENT_OS_USER;
  const allowedPasscode = process.env.CONTENT_OS_PASSCODE;

  if (!allowedUser || !allowedPasscode) {
    return NextResponse.json({ error: "Autenticação não configurada." }, { status: 503 });
  }

  if (!sameValue(username, allowedUser) || !sameValue(passcode, allowedPasscode)) {
    const target = new URL("/login", request.url);
    target.searchParams.set("error", "1");
    if (next.startsWith("/")) target.searchParams.set("next", next);
    return NextResponse.redirect(target, 303);
  }

  const response = NextResponse.redirect(new URL(next.startsWith("/") ? next : "/", request.url), 303);
  response.cookies.set(SESSION_COOKIE, await createSessionToken(), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: 60 * 60 * 12,
  });
  return response;
}
