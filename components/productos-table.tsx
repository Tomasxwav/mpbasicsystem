"use client"

import { useState, useEffect, useCallback } from "react"
import type { MLItem, ItemsResponse } from "@/app/api/items/route"

const STATUS_LABEL: Record<string, string> = {
  active: "Activo",
  paused: "Pausado",
  closed: "Cerrado",
  under_review: "En revisión",
}

const STATUS_CLASS: Record<string, string> = {
  active: "bg-green-100 text-green-700",
  paused: "bg-yellow-100 text-yellow-700",
  closed: "bg-red-100 text-red-600",
  under_review: "bg-blue-100 text-blue-700",
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
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-800">Mis publicaciones</h2>
          <p className="text-sm text-gray-500">Artículos en MercadoLibre</p>
        </div>
        {data && (
          <span className="text-sm text-gray-500">
            {data.paging.total} publicaciones totales
          </span>
        )}
      </div>

      <div className="overflow-hidden rounded-xl border border-gray-200 shadow-sm">
        <table className="min-w-full divide-y divide-gray-200">
          <thead>
            <tr className="bg-mercadolibre">
              {["", "Título", "ID", "Precio", "Stock", "Estado", ""].map((col, i) => (
                <th
                  key={i}
                  className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-gray-700"
                >
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 bg-white">
            {loading ? (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-sm text-gray-400">
                  Cargando publicaciones...
                </td>
              </tr>
            ) : error ? (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-sm text-red-500">
                  {error}
                </td>
              </tr>
            ) : data?.items.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-sm text-gray-400">
                  No hay publicaciones
                </td>
              </tr>
            ) : (
              data?.items.map((item: MLItem, i: number) => (
                <tr
                  key={item.id}
                  className={`transition-colors hover:bg-yellow-50 ${i % 2 === 0 ? "bg-white" : "bg-gray-50"}`}
                >
                  <td className="px-4 py-3">
                    {item.thumbnail && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={item.thumbnail.replace(/^http:/, "https:")}
                        alt={item.title}
                        width={48}
                        height={48}
                        className="h-12 w-12 rounded object-contain"
                      />
                    )}
                  </td>
                  <td className="max-w-xs px-4 py-3 text-sm text-gray-800">
                    <span className="line-clamp-2">{item.title}</span>
                  </td>
                  <td className="px-4 py-3 font-mono text-xs font-medium text-gray-500">
                    {item.id}
                  </td>
                  <td className="px-4 py-3 text-sm font-semibold text-gray-900">
                    {item.currency_id}{" "}
                    {item.price.toLocaleString("es-MX", { minimumFractionDigits: 2 })}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-700">{item.available_quantity}</td>
                  <td className="px-4 py-3 text-sm">
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                        STATUS_CLASS[item.status] ?? "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {STATUS_LABEL[item.status] ?? item.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm">
                    <a
                      href={item.permalink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      Ver
                    </a>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {data && (
          <div className="flex items-center justify-between border-t border-gray-200 bg-gray-50 px-4 py-2">
            <span className="text-xs text-gray-400">
              {data.items.length > 0
                ? `Mostrando ${data.paging.offset + 1}–${data.paging.offset + data.items.length} de ${data.paging.total}`
                : `0 de ${data.paging.total}`}
            </span>
            <div className="flex gap-2">
              <button
                onClick={handlePrev}
                disabled={loading || data.paging.offset === 0}
                className="rounded border border-gray-300 px-3 py-1 text-xs font-medium text-gray-600 transition-colors hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-40"
              >
                ← Anterior
              </button>
              <button
                onClick={handleNext}
                disabled={loading || data.paging.offset + data.paging.limit >= data.paging.total}
                className="rounded border border-gray-300 px-3 py-1 text-xs font-medium text-gray-600 transition-colors hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-40"
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
