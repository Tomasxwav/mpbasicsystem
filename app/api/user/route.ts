import { getSession } from "@/lib/session-server"
import type { User } from "@/types/meli-user"

export async function GET() {
  const session = await getSession()
  if (!session) {
    return Response.json({ error: "Not authenticated" }, { status: 401 })
  }

  const res = await fetch("https://api.mercadolibre.com/users/me", {
    headers: { Authorization: `Bearer ${session.accessToken}` },
    cache: "no-store",
  })

  if (!res.ok) {
    return Response.json({ error: "ML API error" }, { status: res.status })
  }

  const user: User = await res.json()
  return Response.json(user)
}
