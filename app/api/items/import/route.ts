import { getSession } from "@/lib/session-server"
import { NextRequest } from "next/server"
import { z } from "zod"
import type { MercadoLibreItem } from "@/types/meli-item"
import { loadSkuMap, saveSkuMap } from "@/lib/sku-cache"

const ML_STATUSES = ["active", "paused", "closed"] as const

const RowSchema = z.object({
  sku: z.string().min(1),
  stock: z.coerce.number().int().min(0),
  price: z.coerce.number().positive().optional(),
  status: z.enum(ML_STATUSES).optional(),
})

export type ImportRow = z.infer<typeof RowSchema>

export type ImportResult = {
  sku: string
  item_id: string | null
  status: "updated" | "not_found" | "error"
  error?: string
}

interface MLItemRaw {
  code: number
  body: MercadoLibreItem
}

function extractSku(body: MercadoLibreItem): string | null {
  const attr = body.attributes.find((a) => a.id === "SELLER_SKU")
  return attr?.value_name ?? body.seller_custom_field ?? null
}

async function syncAllItems(
  accessToken: string,
  userId: string
): Promise<Record<string, string>> {
  const map: Record<string, string> = {}
  let offset = 0
  const limit = 100

  while (true) {
    const searchRes = await fetch(
      `https://api.mercadolibre.com/users/${userId}/items/search?offset=${offset}&limit=${limit}`,
      { headers: { Authorization: `Bearer ${accessToken}` }, cache: "no-store" }
    )
    if (!searchRes.ok) break

    const searchData = await searchRes.json()
    const ids: string[] = searchData.results ?? []
    const total: number = searchData.paging?.total ?? 0
    if (ids.length === 0) break

    // ML multiget acepta máximo 20 ids por llamada
    for (let i = 0; i < ids.length; i += 20) {
      const batch = ids.slice(i, i + 20)
      const itemsRes = await fetch(
        `https://api.mercadolibre.com/items?ids=${batch.join(",")}`,
        { headers: { Authorization: `Bearer ${accessToken}` }, cache: "no-store" }
      )
      if (!itemsRes.ok) continue

      const itemsRaw: MLItemRaw[] = await itemsRes.json()
      for (const { code, body } of itemsRaw) {
        if (code !== 200) continue
        const sku = extractSku(body)
        if (sku) map[sku] = body.id
      }
    }

    offset += limit
    if (offset >= total) break
  }

  return map
}

export async function POST(req: NextRequest) {
  const session = await getSession()
  if (!session) {
    return Response.json({ error: "Not authenticated" }, { status: 401 })
  }

  const body = await req.json()
  const parsed = z.array(RowSchema).safeParse(body)
  if (!parsed.success) {
    return Response.json({ error: "Datos inválidos", details: parsed.error.flatten() }, { status: 400 })
  }

  const rows = parsed.data
  let skuMap = loadSkuMap()

  // Ver si algún SKU falta en el cache
  const missingSku = rows.some((r) => !(r.sku in skuMap))
  if (missingSku) {
    const synced = await syncAllItems(session.accessToken, session.userId.toString())
    // Merge: el cache existente tiene prioridad, luego añadimos los nuevos
    skuMap = { ...synced, ...skuMap }
    saveSkuMap(skuMap)
  }

  const results: ImportResult[] = await Promise.all(
    rows.map(async (row): Promise<ImportResult> => {
      const itemId = skuMap[row.sku] ?? null

      if (!itemId) {
        return { sku: row.sku, item_id: null, status: "not_found", error: "SKU no encontrado en MercadoLibre" }
      }

      const updateBody: Record<string, unknown> = {
        available_quantity: row.stock,
      }
      if (row.price !== undefined) updateBody.price = row.price
      if (row.status !== undefined) updateBody.status = row.status

      const putRes = await fetch(`https://api.mercadolibre.com/items/${itemId}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${session.accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updateBody),
      })

      if (!putRes.ok) {
        const errText = await putRes.text()
        return { sku: row.sku, item_id: itemId, status: "error", error: `ML ${putRes.status}: ${errText}` }
      }

      return { sku: row.sku, item_id: itemId, status: "updated" }
    })
  )

  return Response.json({ results })
}
