import { readFileSync, writeFileSync, existsSync, mkdirSync } from "fs"
import path from "path"

const CACHE_PATH = path.join(process.cwd(), "data", "sku-map.json")

export function loadSkuMap(): Record<string, string> {
  if (!existsSync(CACHE_PATH)) return {}
  try {
    return JSON.parse(readFileSync(CACHE_PATH, "utf-8"))
  } catch {
    return {}
  }
}

export function saveSkuMap(map: Record<string, string>): void {
  const dir = path.dirname(CACHE_PATH)
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true })
  writeFileSync(CACHE_PATH, JSON.stringify(map, null, 2))
}
