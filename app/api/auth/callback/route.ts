import { NextRequest, NextResponse } from "next/server"
import { createSession } from "@/lib/session-server"

interface MLTokenResponse {
  access_token: string
  token_type: string
  expires_in: number
  scope: string
  user_id: number
  refresh_token: string
}

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code")

  if (!code) {
    return NextResponse.redirect(new URL("/login?error=missing_code", request.url))
  }

  let tokens: MLTokenResponse

  try {
    const response = await fetch("https://api.mercadolibre.com/oauth/token", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        grant_type: "authorization_code",
        client_id: process.env.ML_CLIENT_ID,
        client_secret: process.env.ML_CLIENT_SECRET,
        code,
        redirect_uri: process.env.FRONTEND_URL,
        code_verifier: code,
      }),
      cache: "no-store",
    })

    if (!response.ok) {
      console.error("ML token exchange failed:", response.status, await response.text())
      return NextResponse.redirect(new URL("/login?error=auth_failed", request.url))
    }

    console.log("ML token exchange successful", await response.json())

    tokens = await response.json()
  } catch (err) {
    console.error("ML token exchange error:", err)
    return NextResponse.redirect(new URL("/login?error=server_error", request.url))
  }

  await createSession({
    userId: tokens.user_id,
    accessToken: tokens.access_token,
    refreshToken: tokens.refresh_token,
    expiresAt: Date.now() + tokens.expires_in * 1000,
  })

  return NextResponse.redirect(new URL("/", request.url))
}
