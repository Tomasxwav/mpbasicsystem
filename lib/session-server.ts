import "server-only"
import { cookies } from "next/headers"
import { encodeSession, decodeSession, type SessionData } from "./session"

export type { SessionData }

export async function createSession(data: SessionData): Promise<void> {
  const token = await encodeSession(data)
  const store = await cookies()
  store.set("ml_session", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: Math.floor((data.expiresAt - Date.now()) / 1000),
  })
}

export async function getSession(): Promise<SessionData | null> {
  const store = await cookies()
  const token = store.get("ml_session")?.value
  if (!token) return null
  return decodeSession(token)
}

export async function deleteSession(): Promise<void> {
  const store = await cookies()
  store.delete("ml_session")
}
