"use client"

import { useState, useEffect } from "react"
import type { User } from "@/types/meli-user"

const SITE_STATUS_LABEL: Record<string, string> = {
  active: "Activo",
  inactive: "Inactivo",
  suspended: "Suspendido",
}

const SITE_STATUS_CLASS: Record<string, string> = {
  active: "bg-status-active-bg text-status-active-fg",
  inactive: "bg-status-closed-bg text-status-closed-fg",
  suspended: "bg-status-closed-bg text-status-closed-fg",
}

export default function SellerCard() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetch("/api/user")
      .then((res) => {
        if (!res.ok) throw new Error(`Error ${res.status}`)
        return res.json() as Promise<User>
      })
      .then(setUser)
      .catch((err) => setError(err instanceof Error ? err.message : "Error desconocido"))
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center p-4">
        <span className="text-xs text-text-secondary">Cargando...</span>
      </div>
    )
  }

  if (error || !user) {
    return (
      <div className="flex h-full items-center justify-center p-4">
        <span className="text-xs text-status-closed-fg">{error ?? "Sin datos"}</span>
      </div>
    )
  }

  const siteStatus = user.status.site_status
  const statusLabel = SITE_STATUS_LABEL[siteStatus] ?? siteStatus
  const statusClass = SITE_STATUS_CLASS[siteStatus] ?? "bg-status-review-bg text-status-review-fg"

  const totalSales = user.seller_reputation.transactions.total
  const completedSales = user.seller_reputation.transactions.completed
  const ratings = user.seller_reputation.transactions.ratings

  return (
    <div className="overflow-hidden rounded-lg 2xl:rounded-xl border border-border bg-surface shadow-sm">
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-border bg-ml-navbar px-3 py-2 2xl:px-4 2xl:py-2.5">
        <div className="flex h-8 w-8 2xl:h-10 2xl:w-10 items-center justify-center rounded-full bg-ml-yellow font-bold text-sm 2xl:text-base text-gray-800">
          {user.nickname.charAt(0).toUpperCase()}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-xs font-bold text-ml-header-text 2xl:text-sm">{user.nickname}</p>
          <p className="truncate text-xs text-ml-header-text/70">{user.email}</p>
        </div>
        <span className={`inline-flex shrink-0 items-center rounded-full px-2 py-0.5 text-xs font-semibold ${statusClass}`}>
          {statusLabel}
        </span>
      </div>

      {/* Body */}
      <div className="grid grid-cols-2 gap-x-4 gap-y-2 p-3 2xl:p-4">
        <Row label="Nombre" value={`${user.first_name} ${user.last_name}`} />
        <Row label="País" value={user.country_id} />
        <Row label="Experiencia" value={user.seller_experience ?? "—"} />
        <Row label="Nivel" value={user.seller_reputation.level_id ?? "—"} />
        <Row label="Ventas totales" value={totalSales?.toString() ?? "—"} />
        <Row label="Completadas" value={completedSales?.toString() ?? "—"} />
        <Row
          label="Positivas"
          value={ratings.positive > 0 ? `${ratings.positive}` : "—"}
          valueClass="text-status-active-fg"
        />
        <Row
          label="Negativas"
          value={ratings.negative > 0 ? `${ratings.negative}` : "—"}
          valueClass={ratings.negative > 0 ? "text-status-closed-fg" : undefined}
        />
      </div>

      {/* Footer */}
      <div className="border-t border-border bg-surface-alt px-3 py-1.5 2xl:px-4">
        <a
          href={user.permalink}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs font-medium text-ml-blue hover:underline"
        >
          Ver perfil en MercadoLibre →
        </a>
      </div>
    </div>
  )
}

function Row({
  label,
  value,
  valueClass,
}: {
  label: string
  value: string
  valueClass?: string
}) {
  return (
    <div className="min-w-0">
      <p className="text-xs text-text-secondary">{label}</p>
      <p className={`truncate text-xs font-semibold text-text-primary 2xl:text-sm ${valueClass ?? ""}`}>{value}</p>
    </div>
  )
}
