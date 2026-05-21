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

export default function ImportExcelButton({ onImportDone }: { onImportDone?: () => void }) {
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
      onImportDone?.()
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
        className="rounded-lg bg-ml-blue px-4 py-2 text-sm font-medium text-white transition-colors hover:brightness-90"
      >
        Importar Excel
      </button>

      {/* Modal */}
      {state.phase !== "idle" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-2xl rounded-xl border border-border bg-surface shadow-2xl">

            {/* Error */}
            {state.phase === "error" && (
              <div className="p-6">
                <h3 className="mb-3 text-base font-semibold text-text-primary">Error al procesar el archivo</h3>
                <pre className="mb-4 whitespace-pre-wrap rounded-lg bg-status-closed-bg p-3 text-xs text-status-closed-fg">{state.message}</pre>
                <div className="flex justify-end gap-2">
                  <button onClick={reset} className="rounded-lg border border-border px-4 py-1.5 text-sm text-text-secondary transition-colors hover:bg-surface-alt">
                    Cerrar
                  </button>
                  <button
                    onClick={() => inputRef.current?.click()}
                    className="rounded-lg bg-ml-blue px-4 py-1.5 text-sm font-medium text-white transition-colors hover:brightness-90"
                  >
                    Seleccionar otro archivo
                  </button>
                </div>
              </div>
            )}

            {/* Preview */}
            {state.phase === "preview" && (
              <div className="p-6">
                <h3 className="mb-1 text-base font-semibold text-text-primary">Vista previa</h3>
                <p className="mb-4 text-sm text-text-secondary">{state.rows.length} fila(s) a actualizar</p>
                <div className="mb-4 max-h-72 overflow-auto rounded-lg border border-border">
                  <table className="min-w-full divide-y divide-border text-xs">
                    <thead className="sticky top-0 bg-surface-alt">
                      <tr>
                        {["SKU", "Stock", "Precio", "Estado"].map((h) => (
                          <th key={h} className="px-3 py-2 text-left font-semibold text-text-secondary">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border bg-surface">
                      {state.rows.map((r, i) => (
                        <tr key={i} className="hover:bg-surface-alt">
                          <td className="px-3 py-2 font-mono text-text-primary">{r.sku}</td>
                          <td className="px-3 py-2 text-text-primary">{r.stock}</td>
                          <td className="px-3 py-2 text-text-primary">{r.price ?? <span className="opacity-30">—</span>}</td>
                          <td className="px-3 py-2 text-text-primary">{r.status ? STATUS_ES[r.status] : <span className="opacity-30">—</span>}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="flex justify-end gap-2">
                  <button onClick={reset} className="rounded-lg border border-border px-4 py-1.5 text-sm text-text-secondary transition-colors hover:bg-surface-alt">
                    Cancelar
                  </button>
                  <button
                    onClick={() => handleConfirm(state.rows)}
                    className="rounded-lg bg-ml-blue px-4 py-1.5 text-sm font-medium text-white transition-colors hover:brightness-90"
                  >
                    Confirmar actualización
                  </button>
                </div>
              </div>
            )}

            {/* Loading */}
            {state.phase === "loading" && (
              <div className="p-10 text-center">
                <p className="text-sm text-text-primary">Actualizando publicaciones en MercadoLibre...</p>
                <p className="mt-1 text-xs text-text-secondary">Esto puede tardar si es la primera sincronización</p>
              </div>
            )}

            {/* Done */}
            {state.phase === "done" && (
              <div className="p-6">
                <h3 className="mb-3 text-base font-semibold text-text-primary">Resultado</h3>
                <div className="mb-4 max-h-72 overflow-auto rounded-lg border border-border">
                  <table className="min-w-full divide-y divide-border text-xs">
                    <thead className="sticky top-0 bg-surface-alt">
                      <tr>
                        {["SKU", "Item ID", "Resultado"].map((h) => (
                          <th key={h} className="px-3 py-2 text-left font-semibold text-text-secondary">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border bg-surface">
                      {state.results.map((r, i) => (
                        <tr key={i} className="hover:bg-surface-alt">
                          <td className="px-3 py-2 font-mono text-text-primary">{r.sku}</td>
                          <td className="px-3 py-2 font-mono text-text-secondary">{r.item_id ?? "—"}</td>
                          <td className="px-3 py-2">
                            {r.status === "updated" && <span className="font-medium text-status-active-fg">Actualizado</span>}
                            {r.status === "not_found" && <span className="font-medium text-status-paused-fg">SKU no encontrado</span>}
                            {r.status === "error" && (
                              <span className="font-medium text-status-closed-fg" title={r.error}>Error</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="flex justify-end">
                  <button onClick={reset} className="rounded-lg bg-ml-blue px-4 py-1.5 text-sm font-medium text-white transition-colors hover:brightness-90">
                    Cerrar
                  </button>
                </div>
              </div>
            )}

          </div>
        </div>
      )}
    </>
  )
}
