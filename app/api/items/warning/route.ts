import { getSession } from "@/lib/session-server"
import { NextRequest } from "next/server"
import type { MercadoLibreItem } from "@/types/meli-item"

const LIMIT = 20

interface MLItemRaw {
  code: number
  body: MercadoLibreItem
}

export interface WarningItemsResponse {
  items: MercadoLibreItem[]
  paging: { total: number; offset: number; limit: number }
}

async function fetchIdsByGauge(
  userId: string,
  accessToken: string,
  gauge: "warning" | "unhealthy",
  offset: number,
  limit: number
): Promise<{ ids: string[]; total: number }> {
  const res = await fetch(
    `https://api.mercadolibre.com/users/${userId}/items/search?reputation_health_gauge=${gauge}&offset=${offset}&limit=${limit}`,
    {
      headers: { Authorization: `Bearer ${accessToken}` },
      cache: "no-store",
    }
  )
  if (!res.ok) return { ids: [], total: 0 }
  const data = await res.json()
  return {
    ids: data.results ?? [],
    total: data.paging?.total ?? 0,
  }
}

export async function GET(req: NextRequest) {
  const session = await getSession()
  if (!session) {
    return Response.json({ error: "Not authenticated" }, { status: 401 })
  }

  const offset = Math.max(0, parseInt(req.nextUrl.searchParams.get("offset") ?? "0"))

  const [unhealthy, warning] = await Promise.all([
    fetchIdsByGauge(session.userId.toString(), session.accessToken, "unhealthy", offset, LIMIT),
    fetchIdsByGauge(session.userId.toString(), session.accessToken, "warning", offset, LIMIT),
  ])

  const allIds = [...new Set([...unhealthy.ids, ...warning.ids])]
  const total = unhealthy.total + warning.total

  if (allIds.length === 0) {
    return Response.json({ items: [], paging: { total, offset, limit: LIMIT } } satisfies WarningItemsResponse)
  }

  const itemsRes = await fetch(
    `https://api.mercadolibre.com/items?ids=${allIds.join(",")}`,
    {
      headers: { Authorization: `Bearer ${session.accessToken}` },
      cache: "no-store",
    }
  )

  if (!itemsRes.ok) {
    return Response.json({ error: "ML API error" }, { status: itemsRes.status })
  }

  const itemsRaw: MLItemRaw[] = await itemsRes.json()
  const items = itemsRaw.filter((r) => r.code === 200).map((r) => r.body)

  return Response.json({ items, paging: { total, offset, limit: LIMIT } } satisfies WarningItemsResponse)
}
