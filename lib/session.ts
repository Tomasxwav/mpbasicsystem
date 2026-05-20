export interface SessionData {
  userId: number
  accessToken: string
  refreshToken: string
  expiresAt: number
}

async function getHmacKey(): Promise<CryptoKey> {
  return crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(process.env.SESSION_SECRET!),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"]
  )
}

function toBase64Url(buf: ArrayBuffer): string {
  return Buffer.from(buf).toString("base64url")
}

export async function encodeSession(data: SessionData): Promise<string> {
  const payload = Buffer.from(JSON.stringify(data)).toString("base64url")
  const key = await getHmacKey()
  const sig = toBase64Url(
    await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(payload))
  )
  return `${payload}.${sig}`
}

export async function decodeSession(token: string): Promise<SessionData | null> {
  const dot = token.lastIndexOf(".")
  if (dot === -1) return null

  const payload = token.slice(0, dot)
  const sig = token.slice(dot + 1)

  try {
    const key = await getHmacKey()
    const valid = await crypto.subtle.verify(
      "HMAC",
      key,
      Buffer.from(sig, "base64url"),
      new TextEncoder().encode(payload)
    )
    if (!valid) return null

    const data = JSON.parse(
      Buffer.from(payload, "base64url").toString()
    ) as SessionData

    if (data.expiresAt < Date.now()) return null
    return data
  } catch {
    return null
  }
}
