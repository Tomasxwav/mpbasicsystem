"use client"

import { useState, useEffect, useCallback } from "react"
import type { WarningItemsResponse } from "@/app/api/items/warning/route"
import type { MercadoLibreItem } from "@/types/meli-item"

const STATUS_LABEL: Record<string, string> = {
  active: "Activo",
  paused: "Pausado",
  closed: "Cerrado",
  under_review: "En revisión",
}

const STATUS_CLASS: Record<string, string> = {
  active: "bg-status-active-bg text-status-active-fg",
  paused: "bg-status-paused-bg text-status-paused-fg",
  closed: "bg-status-closed-bg text-status-closed-fg",
  under_review: "bg-status-review-bg text-status-review-fg",
}

export default function ProductosTableWarning() {
  const [data, setData] = useState<WarningItemsResponse | null>(null)
  const [offset, setOffset] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchItems = useCallback(async (nextOffset: number) => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/items/warning?offset=${nextOffset}`)
      if (!res.ok) throw new Error(`Error ${res.status}`)
      const json: WarningItemsResponse = await res.json()
      setData(json)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchItems(offset)
  }, [offset, fetchItems])

  const handlePrev = () => {
    if (!data) return
    setOffset(Math.max(0, data.paging.offset - data.paging.limit))
  }

  const handleNext = () => {
    if (!data) return
    setOffset(data.paging.offset + data.paging.limit)
  }

  return (
    <div className="flex flex-col flex-1 w-full">
      <div className="mb-2 2xl:mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-sm font-semibold text-text-primary 2xl:text-lg">Productos en riesgo</h2>
          <p className="text-xs text-text-secondary 2xl:text-sm">Artículos que están perdiendo o podrían perder exposición</p>
        </div>
        {data && data.paging.total > 0 && (
          <span className="inline-flex items-center rounded-full bg-status-closed-bg px-2.5 py-0.5 text-xs font-semibold text-status-closed-fg">
            {data.paging.total} en riesgo
          </span>
        )}
      </div>

      <div className="flex flex-col flex-1 overflow-hidden rounded-lg 2xl:rounded-xl border border-border bg-surface shadow-sm">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <span className="text-xs text-text-secondary">Cargando publicaciones...</span>
          </div>
        ) : error ? (
          <EmptyState
            icon="⚠️"
            title="Error al cargar"
            description={error}
          />
        ) : data?.items.length === 0 ? (
          <EmptyState
            icon="✓"
            title="Todo en orden"
            description="Ninguna publicación tiene problemas de exposición en este momento."
            positive
          />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-border">
                <thead>
                  <tr className="bg-ml-navbar">
                    {["", "Título", "ID", "SKU", "Precio", "Stock", "Estado", ""].map((col, i) => (
                      <th
                        key={i}
                        className="px-2 py-2 text-left text-xs font-bold uppercase tracking-wider text-ml-header-text"
                      >
                        {col}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {data?.items.map((item: MercadoLibreItem, i: number) => (
                    <tr
                      key={item.id}
                      className={`transition-colors hover:bg-surface-alt ${i % 2 === 0 ? "bg-surface" : "bg-surface-alt"}`}
                    >
                      <td className="px-2 py-1.5 2xl:px-4">
                        {item.thumbnail && (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={item.thumbnail.replace(/^http:/, "https:")}
                            alt={item.title}
                            width={48}
                            height={48}
                            className="h-7 w-7 rounded object-contain"
                          />
                        )}
                      </td>
                      <td className="max-w-50 px-2 py-1.5 text-xs text-text-primary">
                        <span className="line-clamp-2">{item.title}</span>
                      </td>
                      <td className="px-2 py-1.5 font-mono text-xs font-medium text-text-secondary">
                        {item.id}
                      </td>
                      <td className="px-2 py-1.5 font-mono text-xs text-text-secondary">
                        {(item.attributes.find((a) => a.id === "SELLER_SKU")?.value_name ?? item.seller_custom_field) ?? (
                          <span className="opacity-30">—</span>
                        )}
                      </td>
                      <td className="px-2 py-1.5 text-xs font-semibold text-text-primary">
                        {item.currency_id}{" "}
                        {item.price.toLocaleString("es-MX", { minimumFractionDigits: 2 })}
                      </td>
                      <td className="px-2 py-1.5 text-xs text-text-primary">
                        {item.available_quantity}
                      </td>
                      <td className="px-2 py-1.5 2xl:px-4 2xl:py-3">
                        <span
                          className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold ${
                            STATUS_CLASS[item.status] ?? "bg-status-review-bg text-status-review-fg"
                          }`}
                        >
                          {STATUS_LABEL[item.status] ?? item.status}
                        </span>
                      </td>
                      <td className="px-2 py-1.5 text-xs">
                        <a
                          href={item.permalink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-medium text-ml-blue hover:underline"
                        >
                          Ver
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex items-center justify-between border-t border-border bg-surface-alt px-3 py-1.5 2xl:px-4">
              <span className="text-xs text-text-secondary">
                {data && data.items.length > 0
                  ? `Mostrando ${data.paging.offset + 1}–${data.paging.offset + data.items.length} de ${data.paging.total}`
                  : `0 de ${data?.paging.total ?? 0}`}
              </span>
              <div className="flex gap-1.5 2xl:gap-2">
                <button
                  onClick={handlePrev}
                  disabled={loading || (data?.paging.offset ?? 0) === 0}
                  className="rounded border border-border bg-surface px-2.5 py-0.5 2xl:px-3 2xl:py-1 text-xs font-medium text-text-secondary transition-colors hover:border-ml-yellow hover:bg-ml-yellow hover:text-gray-800 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  ← Anterior
                </button>
                <button
                  onClick={handleNext}
                  disabled={
                    loading ||
                    !data ||
                    data.paging.offset + data.paging.limit >= data.paging.total
                  }
                  className="rounded border border-border bg-surface px-2.5 py-0.5 2xl:px-3 2xl:py-1 text-xs font-medium text-text-secondary transition-colors hover:border-ml-yellow hover:bg-ml-yellow hover:text-gray-800 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Siguiente →
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

function EmptyState({
  icon,
  title,
  description,
  positive = false,
}: {
  icon: string
  title: string
  description: string
  positive?: boolean
}) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-2 py-10 px-6 text-center">
      <span className={`text-3xl ${positive ? "text-status-active-fg" : "text-status-closed-fg"}`}>
        {icon}
      </span>
      <p className={`text-sm font-semibold ${positive ? "text-status-active-fg" : "text-text-primary"}`}>
        {title}
      </p>
      <p className="max-w-xs text-xs text-text-secondary">{description}</p>
    </div>
  )
}
