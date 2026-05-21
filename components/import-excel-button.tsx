"use client"

import { useRef, useState } from "react"
import * as XLSX from "xlsx"
import type { ImportRow, ImportResult } from "@/app/api/items/import/route"

const VALID_STATUSES = ["active", "paused", "closed"] as const
type ValidStatus = (typeof VALID_STATUSES)[number]

const STATUS_ES: Record<ValidStatus, string> = {
  active: "Activo",
  paused: "Pausado",
  closed: "Cerrado",
}

type State =
  | { phase: "idle" }
  | { phase: "error"; message: string }
  | { phase: "preview"; rows: ImportRow[] }
  | { phase: "loading" }
  | { phase: "done"; results: ImportResult[] }

function parseSheet(file: File): Promise<ImportRow[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const wb = XLSX.read(e.target?.result, { type: "binary" })
        const ws = wb.Sheets[wb.SheetNames[0]]
        const raw: Record<string, unknown>[] = XLSX.utils.sheet_to_json(ws, { defval: "" })

        if (raw.length === 0) return reject(new Error("El archivo está vacío"))

        const rows: ImportRow[] = []
        const errors: string[] = []

        for (let i = 0; i < raw.length; i++) {
          const r = raw[i]
          const rowNum = i + 2

          const sku = String(r["sku"] ?? r["SKU"] ?? "").trim()
          const stockRaw = r["stock"] ?? r["Stock"] ?? r["STOCK"]
          const priceRaw = r["precio"] ?? r["price"] ?? r["Precio"] ?? r["Price"]
          const statusRaw = String(r["estado"] ?? r["status"] ?? r["Estado"] ?? r["Status"] ?? "").trim().toLowerCase()

          if (!sku) { errors.push(`Fila ${rowNum}: SKU vacío`); continue }

          const stock = Number(stockRaw)
          if (isNaN(stock) || stock < 0 || !Number.isInteger(stock)) {
            errors.push(`Fila ${rowNum}: stock inválido ("${stockRaw}")`); continue
          }

          const row: ImportRow = { sku, stock }

          if (priceRaw !== "" && priceRaw !== undefined) {
            const price = Number(priceRaw)
            if (isNaN(price) || price <= 0) {
              errors.push(`Fila ${rowNum}: precio inválido ("${priceRaw}")`); continue
            }
            row.price = price
          }

          if (statusRaw) {
            if (!(VALID_STATUSES as readonly string[]).includes(statusRaw)) {
              errors.push(`Fila ${rowNum}: estado inválido "${statusRaw}" (válidos: ${VALID_STATUSES.join(", ")})`); continue
            }
            row.status = statusRaw as ValidStatus
          }

          rows.push(row)
        }

        if (errors.length > 0) return reject(new Error(errors.join("\n")))
        if (rows.length === 0) return reject(new Error("No hay filas válidas"))
        resolve(rows)
      } catch (err) {
        reject(err instanceof Error ? err : new Error("Error al leer el archivo"))
      }
    }
    reader.onerror = () => reject(new Error("Error al leer el archivo"))
    reader.readAsBinaryString(file)
  })
}

export default function ImportExcelButton() {
  const inputRef = useRef<HTMLInputElement>(null)
  const [state, setState] = useState<State>({ phase: "idle" })

  async function handleFile(file: File) {
    try {
      const rows = await parseSheet(file)
      setState({ phase: "preview", rows })
    } catch (err) {
      setState({ phase: "error", message: err instanceof Error ? err.message : "Error desconocido" })
    }
  }

  async function handleConfirm(rows: ImportRow[]) {
    setState({ phase: "loading" })
    try {
      const res = await fetch("/api/items/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(rows),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error ?? `Error ${res.status}`)
      setState({ phase: "done", results: json.results })
    } catch (err) {
      setState({ phase: "error", message: err instanceof Error ? err.message : "Error desconocido" })
    }
  }

  function reset() {
    setState({ phase: "idle" })
    if (inputRef.current) inputRef.current.value = ""
  }

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        accept=".xlsx,.xls"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0]
          if (file) handleFile(file)
        }}
      />

      <button
        onClick={() => inputRef.current?.click()}
        className="rounded border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-600 transition-colors hover:bg-gray-100"
      >
        Importar Excel
      </button>

      {/* Modal */}
      {state.phase !== "idle" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-2xl rounded-xl bg-white shadow-xl">

            {/* Error */}
            {state.phase === "error" && (
              <div className="p-6">
                <h3 className="mb-3 text-base font-semibold text-gray-800">Error al procesar el archivo</h3>
                <pre className="mb-4 whitespace-pre-wrap rounded bg-red-50 p-3 text-xs text-red-700">{state.message}</pre>
                <div className="flex justify-end gap-2">
                  <button onClick={reset} className="rounded border border-gray-300 px-4 py-1.5 text-sm text-gray-600 hover:bg-gray-50">Cerrar</button>
                  <button onClick={() => inputRef.current?.click()} className="rounded bg-gray-800 px-4 py-1.5 text-sm text-white hover:bg-gray-700">Seleccionar otro archivo</button>
                </div>
              </div>
            )}

            {/* Preview */}
            {state.phase === "preview" && (
              <div className="p-6">
                <h3 className="mb-1 text-base font-semibold text-gray-800">Vista previa</h3>
                <p className="mb-4 text-sm text-gray-500">{state.rows.length} fila(s) a actualizar</p>
                <div className="mb-4 max-h-72 overflow-auto rounded border border-gray-200">
                  <table className="min-w-full divide-y divide-gray-200 text-xs">
                    <thead className="sticky top-0 bg-gray-50">
                      <tr>
                        {["SKU", "Stock", "Precio", "Estado"].map((h) => (
                          <th key={h} className="px-3 py-2 text-left font-semibold text-gray-600">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {state.rows.map((r, i) => (
                        <tr key={i}>
                          <td className="px-3 py-2 font-mono">{r.sku}</td>
                          <td className="px-3 py-2">{r.stock}</td>
                          <td className="px-3 py-2">{r.price ?? <span className="text-gray-300">—</span>}</td>
                          <td className="px-3 py-2">{r.status ? STATUS_ES[r.status] : <span className="text-gray-300">—</span>}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="flex justify-end gap-2">
                  <button onClick={reset} className="rounded border border-gray-300 px-4 py-1.5 text-sm text-gray-600 hover:bg-gray-50">Cancelar</button>
                  <button
                    onClick={() => handleConfirm(state.rows)}
                    className="rounded bg-mercadolibre px-4 py-1.5 text-sm font-medium text-gray-800 hover:brightness-95"
                  >
                    Confirmar actualización
                  </button>
                </div>
              </div>
            )}

            {/* Loading */}
            {state.phase === "loading" && (
              <div className="p-10 text-center">
                <p className="text-sm text-gray-500">Actualizando publicaciones en MercadoLibre...</p>
                <p className="mt-1 text-xs text-gray-400">Esto puede tardar si es la primera sincronización</p>
              </div>
            )}

            {/* Done */}
            {state.phase === "done" && (
              <div className="p-6">
                <h3 className="mb-3 text-base font-semibold text-gray-800">Resultado</h3>
                <div className="mb-4 max-h-72 overflow-auto rounded border border-gray-200">
                  <table className="min-w-full divide-y divide-gray-200 text-xs">
                    <thead className="sticky top-0 bg-gray-50">
                      <tr>
                        {["SKU", "Item ID", "Resultado"].map((h) => (
                          <th key={h} className="px-3 py-2 text-left font-semibold text-gray-600">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {state.results.map((r, i) => (
                        <tr key={i}>
                          <td className="px-3 py-2 font-mono">{r.sku}</td>
                          <td className="px-3 py-2 font-mono text-gray-500">{r.item_id ?? "—"}</td>
                          <td className="px-3 py-2">
                            {r.status === "updated" && <span className="text-green-600 font-medium">Actualizado</span>}
                            {r.status === "not_found" && <span className="text-yellow-600 font-medium">SKU no encontrado</span>}
                            {r.status === "error" && (
                              <span className="text-red-600 font-medium" title={r.error}>Error</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="flex justify-end">
                  <button onClick={reset} className="rounded bg-gray-800 px-4 py-1.5 text-sm text-white hover:bg-gray-700">Cerrar</button>
                </div>
              </div>
            )}

          </div>
        </div>
      )}
    </>
  )
}
