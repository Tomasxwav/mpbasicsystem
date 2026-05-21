"use client"

import { useState, useEffect, useCallback } from "react"
import type { ItemsResponse } from "@/app/api/items/route"
import type { MercadoLibreItem } from "@/types/meli-item"
import ImportExcelButton from "@/components/import-excel-button"

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

export default function ProductosTable() {
  const [data, setData] = useState<ItemsResponse | null>(null)
  const [offset, setOffset] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchItems = useCallback(async (nextOffset: number) => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/items?offset=${nextOffset}`)
      if (!res.ok) throw new Error(`Error ${res.status}`)
      const json: ItemsResponse = await res.json()
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
    <div className="w-full">
      {/* Table header row */}
      <div className="mb-2 2xl:mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-sm font-semibold text-text-primary 2xl:text-lg">Mis publicaciones</h2>
          <p className="text-xs text-text-secondary 2xl:text-sm">Artículos en MercadoLibre</p>
        </div>
        <div className="flex items-center gap-2 2xl:gap-3">
          {data && (
            <span className="text-xs text-text-secondary 2xl:text-sm">
              {data.paging.total} publicaciones totales
            </span>
          )}
          <ImportExcelButton onImportDone={() => fetchItems(offset)} />
        </div>
      </div>

      {/* Table card */}
      <div className="overflow-hidden rounded-lg 2xl:rounded-xl border border-border bg-surface shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-border">
            <thead>
              <tr className="bg-ml-navbar">
                {["", "Título", "ID", "SKU", "Precio", "Stock", "Estado", ""].map((col, i) => (
                  <th
                    key={i}
                    className="px-2 py-2 2xl:px-4 2xl:py-3 text-left text-xs font-bold uppercase tracking-wider text-ml-header-text"
                  >
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading ? (
                <tr>
                  <td colSpan={8} className="px-4 py-6 2xl:py-10 text-center text-xs 2xl:text-sm text-text-secondary">
                    Cargando publicaciones...
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan={8} className="px-4 py-6 2xl:py-10 text-center text-xs 2xl:text-sm text-status-closed-fg">
                    {error}
                  </td>
                </tr>
              ) : data?.items.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-6 2xl:py-10 text-center text-xs 2xl:text-sm text-text-secondary">
                    No hay publicaciones
                  </td>
                </tr>
              ) : (
                data?.items.map((item: MercadoLibreItem, i: number) => (
                  <tr
                    key={item.id}
                    className={`transition-colors hover:bg-surface-alt ${i % 2 === 0 ? "bg-surface" : "bg-surface-alt"}`}
                  >
                    <td className="px-2 py-1.5 2xl:px-4 2xl:py-3">
                      {item.thumbnail && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={item.thumbnail.replace(/^http:/, "https:")}
                          alt={item.title}
                          width={48}
                          height={48}
                          className="h-7 w-7 2xl:h-12 2xl:w-12 rounded object-contain"
                        />
                      )}
                    </td>
                    <td className="max-w-[200px] 2xl:max-w-xs px-2 py-1.5 2xl:px-4 2xl:py-3 text-xs 2xl:text-sm text-text-primary">
                      <span className="line-clamp-2">{item.title}</span>
                    </td>
                    <td className="px-2 py-1.5 2xl:px-4 2xl:py-3 font-mono text-xs font-medium text-text-secondary">
                      {item.id}
                    </td>
                    <td className="px-2 py-1.5 2xl:px-4 2xl:py-3 font-mono text-xs text-text-secondary">
                      {(item.attributes.find((a) => a.id === "SELLER_SKU")?.value_name ?? item.seller_custom_field) ?? (
                        <span className="opacity-30">—</span>
                      )}
                    </td>
                    <td className="px-2 py-1.5 2xl:px-4 2xl:py-3 text-xs 2xl:text-sm font-semibold text-text-primary">
                      {item.currency_id}{" "}
                      {item.price.toLocaleString("es-MX", { minimumFractionDigits: 2 })}
                    </td>
                    <td className="px-2 py-1.5 2xl:px-4 2xl:py-3 text-xs 2xl:text-sm text-text-primary">
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
                    <td className="px-2 py-1.5 2xl:px-4 2xl:py-3 text-xs 2xl:text-sm">
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
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {data && (
          <div className="flex items-center justify-between border-t border-border bg-surface-alt px-3 py-1.5 2xl:px-4 2xl:py-2.5">
            <span className="text-xs text-text-secondary">
              {data.items.length > 0
                ? `Mostrando ${data.paging.offset + 1}–${data.paging.offset + data.items.length} de ${data.paging.total}`
                : `0 de ${data.paging.total}`}
            </span>
            <div className="flex gap-1.5 2xl:gap-2">
              <button
                onClick={handlePrev}
                disabled={loading || data.paging.offset === 0}
                className="rounded border border-border bg-surface px-2.5 py-0.5 2xl:px-3 2xl:py-1 text-xs font-medium text-text-secondary transition-colors hover:border-ml-yellow hover:bg-ml-yellow hover:text-gray-800 disabled:cursor-not-allowed disabled:opacity-40"
              >
                ← Anterior
              </button>
              <button
                onClick={handleNext}
                disabled={loading || data.paging.offset + data.paging.limit >= data.paging.total}
                className="rounded border border-border bg-surface px-2.5 py-0.5 2xl:px-3 2xl:py-1 text-xs font-medium text-text-secondary transition-colors hover:border-ml-yellow hover:bg-ml-yellow hover:text-gray-800 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Siguiente →
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
