import { getSession } from "@/lib/session-server"
import { NextRequest } from "next/server"
import type { MercadoLibreItem } from "@/types/meli-item"

const LIMIT = 20

interface MLItemRaw {
  code: number
  body: MercadoLibreItem
}

export interface ItemsResponse {
  items: MercadoLibreItem[]
  paging: { total: number; offset: number; limit: number }
}

export async function GET(req: NextRequest) {
  const session = await getSession()
  if (!session) {
    return Response.json({ error: "Not authenticated" }, { status: 401 })
  }

  console.log(session.accessToken)
  console.log(session.userId)

  const offset = Math.max(0, parseInt(req.nextUrl.searchParams.get("offset") ?? "0"))

  const searchRes = await fetch(
    `https://api.mercadolibre.com/users/${session.userId}/items/search?offset=${offset}&limit=${LIMIT}`,
    {
      headers: { Authorization: `Bearer ${session.accessToken}` },
      cache: "no-store",
    }
  )

  //esto no me da la info, solo me da los ids

  if (!searchRes.ok) {
    return Response.json({ error: "ML API error" }, { status: searchRes.status })
  }

  const searchData = await searchRes.json()
  const ids: string[] = searchData.results ?? []
  const paging = searchData.paging ?? { total: 0, offset, limit: LIMIT }

  if (ids.length === 0) {
    return Response.json({ items: [], paging })
  }

  const itemsRes = await fetch(
    `https://api.mercadolibre.com/items?ids=${ids.join(",")}`,
    {
      headers: { Authorization: `Bearer ${session.accessToken}` },
      cache: "no-store",
    }
  )

  // aqui ya recibo la informacion completa de esos producvots

  const itemsRaw: MLItemRaw[] = await itemsRes.json()
  const items = itemsRaw.filter((r) => r.code === 200).map((r) => r.body)

  return Response.json({ items, paging } satisfies ItemsResponse)
}
